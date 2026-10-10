#!/usr/bin/env node
/**
 * Render test: walk the React view tree of every tab for representative
 * calls assembled from the real session log, catching render-path errors.
 */
import { readFileSync } from "node:fs";

const code = readFileSync(new URL("../lib/client.js", import.meta.url), "utf8");
let captured = null;
const windowStub = { __ModuleLoader__: { load: (def) => { captured = def; } } };
new Function("window", code)(windowStub);

const reactStub = {
	createElement: (type, props, ...children) => {
		const node = { type, props: props ?? {}, children: children.flat(Infinity) };
		if (typeof type === "function") return type(node.props);
		return node;
	},
	memo: (component) => component,
	Fragment: "fragment",
	useState: (initial) => [typeof initial === "function" ? initial() : initial, () => {}],
	useEffect: () => {},
	useMemo: (fn) => fn(),
	useRef: (initial) => ({ current: initial }),
	useCallback: (fn) => fn,
};
const client = captured.factory((id) => {
	if (id !== "react") throw new Error("unexpected require: " + id);
	return reactStub;
});
const internals = client.__internals;

const fail = (message) => { throw new Error("RENDER ASSERT: " + message); };
const assert = (condition, message) => { if (!condition) fail(message); };

// A realistic-enough locale: pull the zh dictionary semantics by key lookup.
const dictionaries = { zh: {}, en: {} };
const fakeCtx = () => ({
	effect: (fn) => { fn(); return () => {}; },
	locale: {
		register: (_ns, dict) => { Object.assign(dictionaries.zh, dict.zh); Object.assign(dictionaries.en, dict.en); return () => {}; },
		bind: () => (key, params) => {
			let text = dictionaries.zh[key] ?? key;
			if (params !== undefined) for (const [name, value] of Object.entries(params)) text = text.replaceAll("{" + name + "}", String(value));
			return text;
		},
	},
	uiConversation: {
		events: { register: () => () => {} },
		views: { register: () => () => {} },
		binding: () => ({ target: () => ({ getSnapshot: () => undefined, subscribe: () => () => {} }) }),
	},
	uiSession: { provide: () => () => {} },
	slots: { inject: () => {}, register: () => () => {} },
	sessions: { binding: () => ({ session: { loadOlder: async () => {} } }) },
});
client.apply(fakeCtx());
const t = fakeCtx().locale.bind();
assert(t("view.calls") === "调用", "locale bind should translate zh");

// Reuse the smoke engine to assemble a real snapshot.
const rawLog = readFileSync(process.argv[2] ?? "/tmp/session-sample.jsonl", "utf8").trim().split("\n").map((line) => JSON.parse(line));
const events = rawLog.filter((event) => event.type !== "session");
const definitions = [];
const collectCtx = () => ({
	...fakeCtx(),
	uiConversation: {
		events: { register: (definition) => { definitions.push(definition); return () => {}; } },
		views: { register: () => () => {} },
		binding: () => ({ target: () => ({ getSnapshot: () => undefined, subscribe: () => () => {} }) }),
	},
});
internals.registerLlmCallsDefinitions(collectCtx());

const snapshotOf = (context) => ({ key: context.key, kind: context.def.kind, id: context.id, matches: context.matches, start: context.start, state: context.state, current: new Map() });
const engine = {
	contexts: new Map(),
	accept(event) {
		for (const def of definitions) {
			const result = def.match(event);
			if (result === null) continue;
			const key = def.kind + "" + result.id;
			let context = this.contexts.get(key);
			if (context === undefined) { context = { def, id: result.id, key, start: undefined, matches: [], state: undefined }; this.contexts.set(key, context); }
			const match = { event, role: result.role, location: { kind: "session" } };
			const starting = result.role === "start" && context.start === undefined;
			context.matches.push(match);
			if (starting && match.role === "start") {
				context.start = match;
				context.state = def.start(snapshotOf(context), match, { previous: () => undefined });
				for (let index = 0; index < context.matches.length - 1; index += 1) context.state = def.update({ ...snapshotOf(context), state: context.state }, context.matches[index]);
			} else if (context.state !== undefined) {
				context.state = def.update({ ...snapshotOf(context), state: context.state }, match);
			}
		}
	},
};
for (const event of events) engine.accept(event);
const builder = internals.llmCallsViewDefinition.create();
const snapshot = builder.replace({ nodes: [...engine.contexts.values()].map((context) => context.def.buildViewNode(snapshotOf(context))).filter((node) => node !== null), timeline: { turnOrder: [], turns: new Map() } });
console.log("snapshot assembled:", snapshot.calls.length, "calls");

// ---- tree walking utilities ----
const collectText = (node, parts = []) => {
	if (node === null || node === undefined || node === false || node === true) return parts;
	if (typeof node === "string" || typeof node === "number") { parts.push(String(node)); return parts; }
	if (Array.isArray(node)) { for (const child of node) collectText(child, parts); return parts; }
	for (const child of node.children ?? []) collectText(child, parts);
	return parts;
};
const countNodes = (node) => {
	if (node === null || node === undefined || typeof node !== "object") return 0;
	let total = 1;
	for (const child of node.children ?? []) total += countNodes(child);
	return total;
};

const loadImageStub = async () => "data:image/png;base64,AAAA";
const completeCall = snapshot.calls.find((call) => call.status === "complete" && call.settled?.stream?.length > 3 && call.settled.message.content.length > 0);
const retryCall = snapshot.calls.find((call) => call.retries.length > 0);
const toolsCall = snapshot.calls.find((call) => (call.header?.header?.tools?.length ?? 0) > 0);
const runningCall = snapshot.calls.find((call) => call.status === "running" || call.status === "error");
const titleCall = snapshot.calls.find((call) => call.purpose === "title");
assert(completeCall !== undefined, "need a complete call");
assert(retryCall !== undefined, "need a retry call");
assert(toolsCall !== undefined, "need a call with tools");

// ---- 1. root view render ----
const rootTree = internals.LlmCallsView({
	useSession: () => ({ hasMore: false, loadingOlder: false, running: false }),
	useLlmCalls: (selector) => selector(snapshot),
	loadOlder: async () => true,
	loadImage: loadImageStub,
	viewRequest: null,
	completeViewRequest: () => {},
	t,
});
const rootText = collectText(rootTree).join(" ");
console.log("root nodes:", countNodes(rootTree));
assert(rootText.includes("772"), "root should show the call count");
assert(rootText.includes("调用"), "root should show the zh toolbar label");
assert(rootText.includes("complete") === false, "statuses render through cards; complete label uses zh");
assert(rootText.includes("完成"), "zh complete label expected");

// ---- 2. every tab of representative calls ----
const exerciseCall = (call, label) => {
	const tabs = ["overview", "input", "output", "stream", "retries", "tools"];
	for (const tab of tabs) {
		const tree = internals.renderTab(tab, { call, t, loadImage: loadImageStub, inputView: { messages: [], incomplete: false }, tools: call.header?.header?.tools });
		const text = collectText(tree).join(" ");
		assert(text.length >= 0, "render must not throw");
		console.log("  " + label + "/" + tab + ": " + countNodes(tree) + " nodes");
	}
};
console.log("complete call tabs:");
exerciseCall(completeCall, "complete");
console.log("retry call tabs:");
exerciseCall(retryCall, "retry");
console.log("tools call tabs:");
exerciseCall(toolsCall, "tools");
console.log("running call tabs:");
exerciseCall(runningCall, "running");
console.log("title call tabs:");
exerciseCall(titleCall, "title");

// ---- 3. CallDetail default render + input materialization ----
const inputView = snapshot.foldInput(completeCall.anchor);
const detailTree = internals.CallDetail({ call: completeCall, t, loadImage: loadImageStub, foldInput: snapshot.foldInput });
const detailText = collectText(detailTree).join(" ");
console.log("detail nodes:", countNodes(detailTree), "· input messages:", inputView.messages.length);
assert(inputView.messages.length === completeCall.inputCount, "detail input must materialize");
assert(detailText.includes(completeCall.settled.message.source.model), "detail should show the settled model name");

// ---- 4. input tab with real materialized input ----
const inputTree = internals.renderTab("input", { call: completeCall, t, loadImage: loadImageStub, inputView, tools: undefined });
console.log("input tab nodes:", countNodes(inputTree));
assert(inputTree !== null, "input tab must render");
const messageRows = countNodes(inputTree);
assert(messageRows > inputView.messages.length, "input tab must render one tree per message");

// ---- 5. stream tab renders chunk rows ----
const streamTree = internals.renderTab("stream", { call: completeCall, t, loadImage: loadImageStub, inputView, tools: undefined });
const streamText = collectText(streamTree).join(" ");
console.log("stream tab nodes:", countNodes(streamTree));
assert(streamText.includes("ms"), "stream offsets must render");

// ---- 6. retries tab shows failure text ----
const retryTree = internals.renderTab("retries", { call: retryCall, t, loadImage: loadImageStub, inputView, tools: undefined });
const retryText = collectText(retryTree).join(" ");
console.log("retries tab nodes:", countNodes(retryTree));
assert(retryText.length > 0, "retries tab must render content");
assert(retryText.includes("重试"), "zh retry labels expected");

// ---- 7. tools tab lists tools ----
const toolsTree = internals.renderTab("tools", { call: toolsCall, t, loadImage: loadImageStub, inputView, tools: toolsCall.header.header.tools });
const toolsText = collectText(toolsTree).join(" ");
console.log("tools tab nodes:", countNodes(toolsTree));
const firstTool = toolsCall.header.header.tools[0].name;
assert(toolsText.includes(firstTool), "tools tab must list " + firstTool);

// ---- 8. message row with image block ----
const imageRow = internals.MessageRow({ message: { seq: 1, role: "user", content: [{ type: "text", text: "see this" }, { type: "image", attachment: { name: "shot.png" } }], source: { kind: "user" }, isError: false }, index: 0, t, loadImage: loadImageStub });
const imageText = collectText(imageRow).join(" ");
assert(imageText.includes("user"), "message row renders role");

console.log("ALL RENDER CHECKS PASSED");
