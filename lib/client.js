window.__ModuleLoader__.load({
	id: "dsh-ui-llm-calls",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");
		const { useState, useEffect, useMemo, useRef, useCallback } = react;

		/** Hyperscript helper (no JSX in this hand-built bundle). */
		const h = (type, props, ...children) => react.createElement(type, props, ...children.flat());
		/** Fragment helper. */
		const frag = (key, ...children) => react.createElement(react.Fragment, key === undefined ? undefined : { key }, ...children);
		//#region locales
		/** Locale namespace of this plugin. */
		const NS = "llm-calls";
		const zh = {
			"view.calls": "调用",
			"toolbar.calls": "次调用",
			"toolbar.follow": "跟随最新",
			"toolbar.loading": "加载中…",
			"toolbar.loadOlder": "加载更早的调用",
			"toolbar.showOlder": "显示更早 {count} 次调用",
			"toolbar.totalUsage": "累计 {tokens} tokens",
			"toolbar.empty": "本会话还没有模型调用",
			"card.assistant": "助手",
			"card.turn": "轮 {turn}",
			"card.step": "步 {step}",
			"card.title": "标题",
			"card.compaction": "压缩",
			"card.running": "进行中",
			"card.waiting": "等待响应",
			"card.streaming": "流式生成中",
			"card.retrying": "重试等待中",
			"card.complete": "完成",
			"card.interrupted": "已中断",
			"card.error": "失败",
			"card.aborted": "未发起调用",
			"tab.overview": "概览",
			"tab.input": "输入消息",
			"tab.output": "输出",
			"tab.stream": "原始流",
			"tab.retries": "重试 {count}",
			"tab.tools": "工具 {count}",
			"field.provider": "提供方",
			"field.model": "模型",
			"field.purpose": "类型",
			"field.status": "状态",
			"field.config": "请求参数",
			"field.contextWindow": "上下文窗口",
			"field.startedAt": "开始时间",
			"field.completedAt": "完成时间",
			"field.duration": "总时长",
			"field.ttft": "首字延迟",
			"field.decode": "解码耗时",
			"field.throughput": "输出速度",
			"field.timing": "计时",
			"field.usage": "Token 用量",
			"usage.input": "输入",
			"usage.cacheRead": "缓存读",
			"usage.cacheWrite": "缓存写",
			"usage.output": "输出",
			"usage.reasoning": "思考",
			"usage.total": "总计",
			"input.summary": "{count} 条消息 · 约 {tokens} tokens",
			"input.incomplete": "更早的历史尚未加载，输入可能不完整",
			"input.structured": "结构化",
			"input.raw": "原始 JSON",
			"input.copy": "复制",
			"input.copied": "已复制",
			"input.expandAll": "全部展开",
			"input.collapseAll": "全部收起",
			"input.copyAll": "复制全部消息",
			"role.system": "system",
			"role.developer": "developer",
			"role.user": "user",
			"role.assistant": "assistant",
			"role.tool": "tool",
			"block.text": "文本",
			"block.reasoning": "思考",
			"block.image": "图片",
			"block.file": "文件",
			"block.toolCall": "工具调用",
			"block.toolResult": "工具结果",
			"block.other": "其他内容",
			"block.error": "错误",
			"image.offloaded": "图片已卸载（请求中以占位文本发送）",
			"image.unnamed": "图片 {index}",
			"output.noContent": "没有输出内容",
			"output.interrupted": "已中断",
			"output.copy": "复制消息 JSON",
			"stream.records": "{count} 条流记录 · {chunks} 个 chunk",
			"stream.showMore": "显示更多 {count} 条",
			"stream.copy": "复制流 JSON",
			"stream.dropped": "（已丢弃 {count} 条较早的实时记录）",
			"stream.time": "时间",
			"stream.offset": "偏移",
			"stream.type": "类型",
			"stream.detail": "内容",
			"retries.none": "没有重试记录",
			"retries.attempt": "尝试 {index}",
			"retries.scheduled": "第 {retry} 次重试 · 延迟 {delay}",
			"retries.started": "已开始",
			"retries.failedAttempts": "失败的尝试",
			"retries.stream": "查看原始流",
			"tools.none": "本请求未发送任何工具",
			"tools.copy": "复制工具清单 JSON",
			"tools.description": "说明",
			"tools.parameters": "参数 Schema",
			"misc.unknown": "未知",
			"misc.unavailable": "未记录",
			"misc.notLoaded": "未加载",
			"misc.retry": "重试 {retry}/{max}",
			"misc.tokens": "{value} tokens",
			"misc.ms": "{value} ms",
			"misc.seconds": "{value} s",
			"misc.perSecond": "{value} tok/s",
			"misc.now": "刚刚",
			"title.system": "系统提示词",
			"title.messages": "消息列表",
			"title.maxTokens": "输出上限",
			"title.result": "生成标题",
			"detail.close": "关闭详情",
		};
		const en = {
			"view.calls": "Calls",
			"toolbar.calls": "calls",
			"toolbar.follow": "Follow latest",
			"toolbar.loading": "Loading…",
			"toolbar.loadOlder": "Load older calls",
			"toolbar.showOlder": "Show {count} older calls",
			"toolbar.totalUsage": "{tokens} tokens total",
			"toolbar.empty": "No model calls in this session yet",
			"card.assistant": "Assistant",
			"card.turn": "Turn {turn}",
			"card.step": "Step {step}",
			"card.title": "Title",
			"card.compaction": "Compaction",
			"card.running": "Running",
			"card.waiting": "Waiting",
			"card.streaming": "Streaming",
			"card.retrying": "Retrying",
			"card.complete": "Complete",
			"card.interrupted": "Interrupted",
			"card.error": "Failed",
			"card.aborted": "No request",
			"tab.overview": "Overview",
			"tab.input": "Input",
			"tab.output": "Output",
			"tab.stream": "Raw stream",
			"tab.retries": "Retries {count}",
			"tab.tools": "Tools {count}",
			"field.provider": "Provider",
			"field.model": "Model",
			"field.purpose": "Purpose",
			"field.status": "Status",
			"field.config": "Request config",
			"field.contextWindow": "Context window",
			"field.startedAt": "Started",
			"field.completedAt": "Completed",
			"field.duration": "Duration",
			"field.ttft": "TTFT",
			"field.decode": "Decoding",
			"field.throughput": "Throughput",
			"field.timing": "Timing",
			"field.usage": "Token usage",
			"usage.input": "Input",
			"usage.cacheRead": "Cache read",
			"usage.cacheWrite": "Cache write",
			"usage.output": "Output",
			"usage.reasoning": "Reasoning",
			"usage.total": "Total",
			"input.summary": "{count} messages · ~{tokens} tokens",
			"input.incomplete": "Older history is not loaded; the input may be incomplete",
			"input.structured": "Structured",
			"input.raw": "Raw JSON",
			"input.copy": "Copy",
			"input.copied": "Copied",
			"input.expandAll": "Expand all",
			"input.collapseAll": "Collapse all",
			"input.copyAll": "Copy all messages",
			"role.system": "system",
			"role.developer": "developer",
			"role.user": "user",
			"role.assistant": "assistant",
			"role.tool": "tool",
			"block.text": "Text",
			"block.reasoning": "Reasoning",
			"block.image": "Image",
			"block.file": "File",
			"block.toolCall": "Tool call",
			"block.toolResult": "Tool result",
			"block.other": "Other",
			"block.error": "Error",
			"image.offloaded": "Image offloaded (sent as placeholder text)",
			"image.unnamed": "Image {index}",
			"output.noContent": "No output content",
			"output.interrupted": "Interrupted",
			"output.copy": "Copy message JSON",
			"stream.records": "{count} stream records · {chunks} chunks",
			"stream.showMore": "Show {count} more",
			"stream.copy": "Copy stream JSON",
			"stream.dropped": "({count} earlier live records dropped)",
			"stream.time": "Time",
			"stream.offset": "Offset",
			"stream.type": "Type",
			"stream.detail": "Detail",
			"retries.none": "No retry records",
			"retries.attempt": "Attempt {index}",
			"retries.scheduled": "Retry #{retry} · after {delay}",
			"retries.started": "started",
			"retries.failedAttempts": "Failed attempts",
			"retries.stream": "View raw stream",
			"tools.none": "No tools were sent with this request",
			"tools.copy": "Copy tool catalog JSON",
			"tools.description": "Description",
			"tools.parameters": "Parameters schema",
			"misc.unknown": "Unknown",
			"misc.unavailable": "Not recorded",
			"misc.notLoaded": "Not loaded",
			"misc.retry": "Retry {retry}/{max}",
			"misc.tokens": "{value} tokens",
			"misc.ms": "{value} ms",
			"misc.seconds": "{value} s",
			"misc.perSecond": "{value} tok/s",
			"misc.now": "just now",
			"title.system": "System prompt",
			"title.messages": "Messages",
			"title.maxTokens": "Max tokens",
			"title.result": "Generated title",
			"detail.close": "Close details",
		};
		//#endregion
		//#region shared helpers
		/** Locale-independent failure sanitization (mirrors the trajectory definition). */
		function displayFailure(failure) {
			if (failure === null || typeof failure !== "object") return { message: String(failure) };
			const record = failure;
			const code = typeof record.code === "string" ? record.code : undefined;
			if (code === "AUTH") return { code, message: "" };
			return {
				...code === undefined ? {} : { code },
				message: typeof record.message === "string" ? record.message : JSON.stringify(failure),
			};
		}

		/** Whether one stream chunk carries a non-empty model token fragment. */
		function isTokenDelta(chunk) {
			switch (chunk.type) {
				case "text-delta":
				case "reasoning-delta":
					return chunk.text !== "";
				case "tool-call-delta":
					return chunk.argumentsDelta !== "" || chunk.name !== undefined;
				default:
					return false;
			}
		}

		/** First qualifying token time of one packed run, stopping at the first hit. */
		function runFirstTokenTime(run) {
			const members = run.type === "tool-call-chunks" ? run.args : run.texts;
			let time = run.time0;
			for (let index = 0; index < members.length; index += 1) {
				if (index > 0) time += run.dt[index - 1];
				if (run.type === "tool-call-chunks") {
					if (members[index] !== "" || (index === 0 && run.name !== undefined)) return time;
					continue;
				}
				if (members[index] !== "") return time;
			}
			return undefined;
		}

		/** Time of the first token in one compact stream. */
		function streamFirstTokenTime(stream) {
			for (const record of stream) {
				const time =
					record.type === "chunk"
						? isTokenDelta(record.chunk)
							? record.time
							: undefined
						: runFirstTokenTime(record);
				if (time !== undefined) return time;
			}
			return undefined;
		}

		/** Expand compact durable stream records into exact timed chunks. */
		function expandStream(stream) {
			const chunks = [];
			for (const record of stream) {
				if (record.type === "chunk") {
					chunks.push({ time: record.time, chunk: record.chunk });
					continue;
				}
				const members = record.type === "tool-call-chunks" ? record.args : record.texts;
				let time = record.time0;
				for (let index = 0; index < members.length; index += 1) {
					if (index > 0) time += record.dt[index - 1];
					let chunk;
					if (record.type === "text-chunks") {
						chunk = { type: "text-delta", index: record.index, text: members[index] };
					} else if (record.type === "reasoning-chunks") {
						chunk = { type: "reasoning-delta", index: record.index, text: members[index] };
					} else {
						chunk = {
							type: "tool-call-delta",
							index: record.index,
							id: record.id,
							...(Object.hasOwn(record, "name") ? { name: record.name } : {}),
							argumentsDelta: members[index],
						};
					}
					chunks.push({ time, chunk });
				}
			}
			return chunks;
		}

		/** Number of expandable chunks in one compact stream. */
		function streamChunkCount(stream) {
			let count = 0;
			for (const record of stream) {
				if (record.type === "chunk") count += 1;
				else count += (record.type === "tool-call-chunks" ? record.args : record.texts).length;
			}
			return count;
		}

		/** Usage carried by raw `usage` chunks inside one compact stream. */
		function streamUsage(stream) {
			let usage;
			for (const record of stream) {
				if (record.type !== "chunk" || record.chunk.type !== "usage") continue;
				usage = addUsage(usage, record.chunk.usage);
			}
			return usage;
		}

		/** Disjoint usage addition across attempts. */
		function addUsage(current, next) {
			if (next === undefined) return current;
			return {
				inputTokens: (current?.inputTokens ?? 0) + next.inputTokens,
				outputTokens: (current?.outputTokens ?? 0) + next.outputTokens,
				...(current?.totalTokens === undefined && next.totalTokens === undefined
					? {}
					: { totalTokens: (current?.totalTokens ?? 0) + (next.totalTokens ?? 0) }),
				...(current?.cacheReadTokens === undefined && next.cacheReadTokens === undefined
					? {}
					: { cacheReadTokens: (current?.cacheReadTokens ?? 0) + (next.cacheReadTokens ?? 0) }),
				...(current?.cacheWriteTokens === undefined && next.cacheWriteTokens === undefined
					? {}
					: { cacheWriteTokens: (current?.cacheWriteTokens ?? 0) + (next.cacheWriteTokens ?? 0) }),
				...(current?.reasoningTokens === undefined && next.reasoningTokens === undefined
					? {}
					: { reasoningTokens: (current?.reasoningTokens ?? 0) + (next.reasoningTokens ?? 0) }),
			};
		}

		/** Total billed input tokens of one usage record. */
		function usageInputTotal(usage) {
			if (usage === undefined) return undefined;
			return (usage.inputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0);
		}

		/** Rough character length of one content-block list. */
		function contentChars(content) {
			let chars = 0;
			for (const block of content) {
				if (block.type === "text" || block.type === "reasoning") chars += block.text.length;
				else if (block.type === "tool-call") chars += block.arguments.length + block.name.length;
				else chars += 40;
			}
			return chars;
		}

		/** First text fragment of a content-block list for row summaries. */
		function contentSummary(content) {
			for (const block of content) {
				if (block.type === "text" || block.type === "reasoning") {
					const text = block.text.replace(/\s+/g, " ").trim();
					if (text !== "") return text;
				}
				if (block.type === "tool-call") return block.name + " " + block.arguments;
				if (block.type === "image" || block.type === "file") return "[" + block.type + "]";
			}
			return "";
		}

		/** Classify one assistant content block for rendering. */
		function assistantBlock(block) {
			switch (block.type) {
				case "text":
					return { kind: "text", text: block.text };
				case "reasoning":
					return { kind: "reasoning", text: block.text };
				case "image":
					return { kind: "image", attachment: block.attachment, offloaded: block.offloaded === true };
				case "file":
					return { kind: "file", attachment: block.attachment };
				case "tool-call":
					return { kind: "tool-call", callId: String(block.id), name: block.name, argsRaw: block.arguments };
				default:
					return { kind: "other", block };
			}
		}

		/** Integer with thin separators, safe for any magnitude. */
		function formatCount(value) {
			return Number.isFinite(value) ? value.toLocaleString("en-US") : String(value);
		}

		/** Compact token count: 1234 → "1,234", 123456 → "123.5k". */
		function formatTokensShort(value) {
			if (!Number.isFinite(value)) return "0";
			if (Math.abs(value) >= 100000) return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
			return value.toLocaleString("en-US");
		}

		/** Duration in ms → human text. */
		function formatDuration(ms) {
			if (!Number.isFinite(ms) || ms < 0) return undefined;
			if (ms < 1000) return Math.round(ms) + " ms";
			if (ms < 60000) return (ms / 1000).toFixed(ms < 10000 ? 2 : 1).replace(/\.?0+$/, "") + " s";
			if (ms < 3600000) {
				const minutes = Math.floor(ms / 60000);
				const seconds = Math.round((ms % 60000) / 1000);
				return minutes + "m" + String(seconds).padStart(2, "0") + "s";
			}
			return (ms / 3600000).toFixed(1) + " h";
		}

		/** Epoch ms → local HH:MM:SS. */
		function formatClock(time) {
			if (!Number.isFinite(time)) return "";
			const date = new Date(time);
			return [date.getHours(), date.getMinutes(), date.getSeconds()]
				.map((part) => String(part).padStart(2, "0"))
				.join(":");
		}

		/** Rough token estimate from character length (mixed zh/en heuristic). */
		function estimateTokens(chars) {
			return chars === 0 ? 0 : Math.max(1, Math.ceil(chars / 3.2));
		}
		//#endregion
		//#region event definitions
		/** Cap on retained live chunk records per attempt (safety valve). */
		const MAX_LIVE_RECORDS = 20000;

		/** Wrap one contribution in the engine-owned target envelope. */
		function callsNode(context, anchorSeq, data) {
			return {
				key: context.key,
				kind: context.kind,
				id: context.id,
				target: "calls",
				anchorSeq,
				location: context.start?.location ?? { kind: "unresolved" },
				data,
			};
		}

		/** Empty live attempt accumulator. */
		function initialLive(seq, time) {
			return { startSeq: seq, startTime: time, records: [], dropped: 0, blocks: [], usage: undefined, firstTokenTime: undefined, lastTime: time };
		}

		/** One empty assistant block of a wire kind, ready to receive deltas. */
		function emptyLiveBlock(blockType) {
			switch (blockType) {
				case "text":
					return { kind: "text", text: "" };
				case "reasoning":
					return { kind: "reasoning", text: "" };
				case "tool-call":
					return { kind: "tool-call", callId: "", name: "", argsRaw: "" };
				default:
					return { kind: "other", block: null };
			}
		}

		/** Apply one live chunk to the live accumulator (blocks + raw records). */
		function applyLiveChunk(live, chunk, seq, time) {
			const next = { ...live, lastTime: time };
			if (chunk.type === "usage") {
				next.usage = addUsage(live.usage, chunk.usage);
				return next;
			}
			if (live.records.length < MAX_LIVE_RECORDS) {
				live.records.push({ time, chunk });
			} else {
				next.dropped = live.dropped + 1;
			}
			if (chunk.type === "block-start" || chunk.type === "block-end") {
				const blocks = [...live.blocks];
				blocks[chunk.index] =
					chunk.type === "block-start"
						? emptyLiveBlock(chunk.blockType)
						: assistantBlock(chunk.block);
				next.blocks = blocks;
				return next;
			}
			if (chunk.type === "text-delta" || chunk.type === "reasoning-delta") {
				const kind = chunk.type === "text-delta" ? "text" : "reasoning";
				const blocks = [...live.blocks];
				const previous = blocks[chunk.index];
				blocks[chunk.index] = { kind, text: (previous?.kind === kind ? previous.text : "") + chunk.text };
				next.blocks = blocks;
				if (next.firstTokenTime === undefined && isTokenDelta(chunk)) next.firstTokenTime = time;
				return next;
			}
			if (chunk.type === "tool-call-delta") {
				const blocks = [...live.blocks];
				const previous = blocks[chunk.index];
				const base =
					previous?.kind === "tool-call"
						? previous
						: { kind: "tool-call", callId: "", name: "", argsRaw: "" };
				blocks[chunk.index] = {
					kind: "tool-call",
					callId: base.callId !== "" ? base.callId : String(chunk.id),
					name: chunk.name ?? base.name,
					argsRaw: base.argsRaw + chunk.argumentsDelta,
				};
				next.blocks = blocks;
				if (next.firstTokenTime === undefined && isTokenDelta(chunk)) next.firstTokenTime = time;
				return next;
			}
			return next;
		}

		/** Fresh step state. */
		function initialStepState(turn, step, startSeq, startTime, started) {
			return {
				turn,
				step,
				startSeq,
				startTime,
				started,
				live: null,
				attempts: [],
				settled: null,
				retries: [],
				retryStarted: [],
				stepEnd: null,
				firstTokenTime: undefined,
			};
		}

		/** Retain the step's first token time across attempts and settlements. */
		function retainFirstToken(state, stream) {
			return state.firstTokenTime ?? streamFirstTokenTime(stream);
		}

		/** Reconstruct step state from raw matches when no durable start exists. */
		function fallbackStepState(context) {
			let state;
			for (const match of context.matches) {
				const event = match.event;
				if (event.type === "step/start") {
					state ??= initialStepState(event.data.turn, event.data.step, event.seq, event.time, true);
					continue;
				}
				if (event.type === "assistant/live-chunk") {
					state ??= initialStepState(event.data.turn, event.data.step, event.seq, event.time, false);
					state = {
						...state,
						live: applyLiveChunk(state.live ?? initialLive(event.seq, event.time), event.data.chunk, event.seq, event.time),
					};
					continue;
				}
				if (event.type === "assistant/message") {
					state ??= initialStepState(event.data.turn, event.data.step, event.seq, event.time, false);
					state = {
						...state,
						live: null,
						firstTokenTime: retainFirstToken(state, event.data.stream),
						settled: {
							seq: event.seq,
							time: event.time,
							message: event.data.message,
							stream: event.data.stream,
							usage: event.data.usage,
							interrupted: event.data.interrupted === true,
						},
					};
					continue;
				}
				if (event.type === "assistant/attempt") {
					state ??= initialStepState(event.data.turn, event.data.step, event.seq, event.time, false);
					state = {
						...state,
						live: null,
						firstTokenTime: retainFirstToken(state, event.data.stream),
						attempts: [...state.attempts, { seq: event.seq, time: event.time, stream: event.data.stream }],
					};
					continue;
				}
				if (event.type === "llm/retry") {
					state ??= initialStepState(event.data.turn, event.data.step, event.seq, event.time, false);
					const failure = displayFailure(event.data.failure);
					state = {
						...state,
						retries: [
							...state.retries,
							{
								seq: event.seq,
								time: event.time,
								retry: event.data.retry,
								maxRetries: event.data.mode === "normal" ? event.data.maxRetries : undefined,
								delayMs: event.data.delayMs,
								provider: event.data.provider,
								mode: event.data.mode,
								policyKey: event.data.policyKey,
								failure,
							},
						],
					};
					continue;
				}
				if (event.type === "llm/retry-started") {
					state ??= initialStepState(event.data.turn, event.data.step, event.seq, event.time, false);
					state = {
						...state,
						retryStarted: [
							...state.retryStarted,
							{ seq: event.seq, time: event.time, retry: event.data.retry, retryId: String(event.data.retryId) },
						],
					};
					continue;
				}
				if (event.type === "step/end") {
					state ??= initialStepState(0, 0, event.seq, event.time, false);
					state = { ...state, stepEnd: { seq: event.seq, time: event.time } };
					continue;
				}
			}
			return state;
		}

		/** One model-call Context: streaming, retries, settlements, and boundaries. */
		const stepDefinition = {
			kind: "llm-calls-step",
			target: "calls",
			match: (event) => {
				if (event.type === "step/start") return { id: `${event.data.turn}:${event.data.step}`, role: "start" };
				if (
					event.type === "assistant/live-chunk" ||
					event.type === "assistant/message" ||
					event.type === "assistant/attempt" ||
					event.type === "llm/retry" ||
					event.type === "llm/retry-started" ||
					event.type === "step/end"
				) {
					return { id: `${event.data.turn}:${event.data.step}`, role: "update" };
				}
				return null;
			},
			start: (_context, match) => {
				if (match.event.type !== "step/start") throw new Error("llm-calls-step start requires step/start");
				return initialStepState(match.event.data.turn, match.event.data.step, match.event.seq, match.event.time, true);
			},
			update: (context, match) => {
				const event = match.event;
				const state = context.state;
				if (event.type === "step/start") return state;
				if (event.type === "assistant/live-chunk") {
					return { ...state, live: applyLiveChunk(state.live ?? initialLive(event.seq, event.time), event.data.chunk, event.seq, event.time) };
				}
				if (event.type === "assistant/message") {
					return {
						...state,
						live: null,
						firstTokenTime: retainFirstToken(state, event.data.stream),
						settled: {
							seq: event.seq,
							time: event.time,
							message: event.data.message,
							stream: event.data.stream,
							usage: event.data.usage,
							interrupted: event.data.interrupted === true,
						},
					};
				}
				if (event.type === "assistant/attempt") {
					return {
						...state,
						live: null,
						firstTokenTime: retainFirstToken(state, event.data.stream),
						attempts: [...state.attempts, { seq: event.seq, time: event.time, stream: event.data.stream }],
					};
				}
				if (event.type === "llm/retry") {
					const failure = displayFailure(event.data.failure);
					return {
						...state,
						retries: [
							...state.retries,
							{
								seq: event.seq,
								time: event.time,
								retry: event.data.retry,
								maxRetries: event.data.mode === "normal" ? event.data.maxRetries : undefined,
								delayMs: event.data.delayMs,
								provider: event.data.provider,
								mode: event.data.mode,
								policyKey: event.data.policyKey,
								failure,
							},
						],
					};
				}
				if (event.type === "llm/retry-started") {
					return {
						...state,
						retryStarted: [
							...state.retryStarted,
							{ seq: event.seq, time: event.time, retry: event.data.retry, retryId: String(event.data.retryId) },
						],
					};
				}
				if (event.type === "step/end") {
					return { ...state, stepEnd: { seq: event.seq, time: event.time } };
				}
				return state;
			},
			publication: (match) => {
				if (match.event.type === "assistant/live-chunk") {
					const type = match.event.data.chunk.type;
					return type === "usage" || type === "finish" ? "none" : "animation-frame";
				}
				return "immediate";
			},
			buildViewNode: (context) => {
				const state = context.state ?? fallbackStepState(context);
				if (state === undefined) return null;
				return callsNode(context, state.startSeq, { kind: "call", state });
			},
		};

		/** Message of one surface event, or null when it derives none. */
		function surfaceEventMessage(event) {
			switch (event.type) {
				case "user/message":
					return event.data;
				case "system/message":
				case "developer/message":
				case "assistant/message":
					return event.data.message.content.length === 0 ? null : event.data.message;
				case "tool/result":
					return event.data.message;
				default:
					return null;
			}
		}

		/** One surface node per durable message-producing event, feeding the input fold. */
		const surfaceDefinition = {
			kind: "llm-calls-surface",
			target: "calls",
			match: (event) => {
				if (
					event.type === "system/message" ||
					event.type === "developer/message" ||
					event.type === "user/message" ||
					event.type === "assistant/message" ||
					event.type === "tool/result"
				) {
					return { id: String(event.seq), role: "start" };
				}
				return null;
			},
			start: (_context, match) => {
				const event = match.event;
				const message = surfaceEventMessage(event);
				return {
					seq: event.seq,
					time: event.time,
					type: event.type,
					role: message?.role ?? "user",
					message,
					op: "surfaceOp" in event ? event.surfaceOp : "append",
					sourceEventSeqs: "sourceEventSeqs" in event ? event.sourceEventSeqs : undefined,
					chars: message === null ? 0 : contentChars(message.content),
					empty: message === null,
				};
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				const state = context.state;
				if (state === undefined) return null;
				return callsNode(context, state.seq, { kind: "surface", state });
			},
		};

		/** Full request header snapshots (config + tool catalog). */
		const headerDefinition = {
			kind: "llm-calls-header",
			target: "calls",
			match: (event) => (event.type === "request/header" ? { id: String(event.seq), role: "start" } : null),
			start: (_context, match) => {
				const event = match.event;
				return { seq: event.seq, time: event.time, header: event.data.header, reason: event.data.reason, startsSeries: event.data.startsSeries === true };
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				const state = context.state;
				if (state === undefined) return null;
				return callsNode(context, state.seq, { kind: "header", state });
			},
		};

		/** Route context snapshots (context window, prompt update mode). */
		const requestContextDefinition = {
			kind: "llm-calls-reqctx",
			target: "calls",
			match: (event) => (event.type === "request/context" ? { id: String(event.seq), role: "start" } : null),
			start: (_context, match) => {
				const event = match.event;
				return { seq: event.seq, time: event.time, data: event.data };
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				const state = context.state;
				if (state === undefined) return null;
				return callsNode(context, state.seq, { kind: "reqctx", state });
			},
		};

		/** Durable image-offload decisions for input message rendering. */
		const offloadDefinition = {
			kind: "llm-calls-offload",
			target: "calls",
			match: (event) => (event.type === "image/offload" ? { id: String(event.seq), role: "start" } : null),
			start: (_context, match) => {
				const event = match.event;
				return { seq: event.seq, time: event.time, targets: Array.isArray(event.data?.targets) ? event.data.targets : [] };
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				const state = context.state;
				if (state === undefined) return null;
				return callsNode(context, state.seq, { kind: "offload", state });
			},
		};

		/** One compaction summarize request (an auxiliary model call). */
		const compactionDefinition = {
			kind: "llm-calls-compaction",
			target: "calls",
			match: (event) => (event.type === "compaction/summary" ? { id: String(event.seq), role: "start" } : null),
			start: (_context, match) => {
				const event = match.event;
				return { seq: event.seq, time: event.time, data: event.data };
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				const state = context.state;
				if (state === undefined) return null;
				return callsNode(context, state.seq, { kind: "compaction", state });
			},
		};

		/** Auxiliary title generation request with its complete input. */
		const titleRequestDefinition = {
			kind: "llm-calls-title-request",
			target: "calls",
			match: (event) => (event.type === "session/title-llm-request" ? { id: String(event.seq), role: "start" } : null),
			start: (_context, match) => {
				const event = match.event;
				return { seq: event.seq, time: event.time, data: event.data };
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				const state = context.state;
				if (state === undefined) return null;
				return callsNode(context, state.seq, { kind: "titleReq", state });
			},
		};

		/** Title results, paired with their request cards by the snapshot builder. */
		const titleResultDefinition = {
			kind: "llm-calls-title-result",
			target: "calls",
			match: (event) => (event.type === "session/title" ? { id: String(event.seq), role: "start" } : null),
			start: (_context, match) => {
				const event = match.event;
				return { seq: event.seq, time: event.time, title: event.data?.title, source: event.data?.source };
			},
			update: (context) => context.state,
			buildViewNode: (context) => {
				const state = context.state;
				if (state === undefined) return null;
				return callsNode(context, state.seq, { kind: "title", state });
			},
		};

		/** Register every llm-calls event definition. */
		function registerLlmCallsDefinitions(ctx) {
			ctx.uiConversation.events.register(stepDefinition);
			ctx.uiConversation.events.register(surfaceDefinition);
			ctx.uiConversation.events.register(headerDefinition);
			ctx.uiConversation.events.register(requestContextDefinition);
			ctx.uiConversation.events.register(offloadDefinition);
			ctx.uiConversation.events.register(compactionDefinition);
			ctx.uiConversation.events.register(titleRequestDefinition);
			ctx.uiConversation.events.register(titleResultDefinition);
		}
		//#endregion
		//#region snapshot builder
		/** Shared empty snapshot before any Session binding materializes. */
		const EMPTY_INPUT_VIEW = { messages: [], incomplete: false };
		const EMPTY_SNAPSHOT = {
			calls: [],
			surfaceRevision: 0,
			foldInput: () => EMPTY_INPUT_VIEW,
			revision: 0,
		};

		/** Tolerant surface-range resolution for one replace record. */
		function applyReplace(nodes, rec) {
			const op = rec.op;
			const startIdx = nodes.indexOf(op.startSeq);
			const endIdx = nodes.indexOf(op.endSeq);
			if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
				// Window cut inside the replaced range: fall back to the best
				// position we can prove from the cited source seqs.
				let insertAt = -1;
				if (rec.sourceEventSeqs !== undefined) {
					for (const source of rec.sourceEventSeqs) {
						const index = nodes.indexOf(source);
						if (index !== -1) {
							insertAt = index;
							break;
						}
					}
				}
				if (rec.message !== null) {
					if (insertAt === -1) insertAt = 0;
					nodes.splice(insertAt, 0, rec.seq);
				}
				return { tolerated: true };
			}
			nodes.splice(startIdx, endIdx - startIdx + 1, ...(rec.message !== null ? [rec.seq] : []));
			return { tolerated: false };
		}

		/**
		 * Per-Session incremental snapshot builder for the "calls" target.
		 * Assembles one card per model request (ordinary step, compaction, or
		 * title request) plus the raw material for lazy input reconstruction.
		 */
		class LlmCallsSnapshotBuilder {
			constructor() {
				this.empty = EMPTY_SNAPSHOT;
				this.nodes = new Map();
				this.snapshot = EMPTY_SNAPSHOT;
				this.revision = 0;
				this.surfaceRevision = 0;
				this.surfaceEvents = [];
				this.offloads = [];
				this.foldFn = EMPTY_SNAPSHOT.foldInput;
				this.callCache = new Map();
			}

			replace({ nodes }) {
				this.nodes = new Map(nodes.map((node) => [node.key, node]));
				this.rebuild();
				return this.snapshot;
			}

			apply({ upserts }) {
				if (upserts.length > 0) {
					for (const node of upserts) this.nodes.set(node.key, node);
					this.rebuild();
				}
				return this.snapshot;
			}

			rebuild() {
				const stepNodes = [];
				const surfaces = [];
				const offloads = [];
				const headers = [];
				const reqctx = [];
				const compactionNodes = [];
				const titleRequestNodes = [];
				const titles = [];
				for (const node of this.nodes.values()) {
					const data = node.data;
					switch (data?.kind) {
						case "call":
							stepNodes.push(node);
							break;
						case "surface":
							surfaces.push(data.state);
							break;
						case "offload":
							offloads.push(data.state);
							break;
						case "header":
							headers.push(data.state);
							break;
						case "reqctx":
							reqctx.push(data.state);
							break;
						case "compaction":
							compactionNodes.push(node);
							break;
						case "titleReq":
							titleRequestNodes.push(node);
							break;
						case "title":
							titles.push(data.state);
							break;
					}
				}
				surfaces.sort((left, right) => left.seq - right.seq);
				offloads.sort((left, right) => left.seq - right.seq);
				headers.sort((left, right) => left.seq - right.seq);
				reqctx.sort((left, right) => left.seq - right.seq);
				titles.sort((left, right) => left.seq - right.seq);

				const surfaceChanged = surfaces !== this.surfaceEvents || offloads !== this.offloads;
				this.surfaceEvents = surfaces;
				this.offloads = offloads;
				this.surfaceBySeq = new Map(surfaces.map((record) => [record.seq, record]));
				if (surfaceChanged) {
					this.surfaceRevision += 1;
					const events = surfaces;
					const bySeq = this.surfaceBySeq;
					const offloadList = offloads;
					this.foldFn = (anchor) => this.materializeInput(events, bySeq, offloadList, anchor);
				}

				const calls = [];
				const anchors = [];
				for (const node of stepNodes) {
					const state = node.data.state;
					anchors.push(state.settled?.seq ?? state.attempts[0]?.seq ?? Number.POSITIVE_INFINITY);
				}
				anchors.sort((left, right) => left - right);
				const inputStats = this.computeInputStats(anchors);

				const nextCache = new Map();
				const cachedView = (node, state, headerSeq, reqctxSeq, stats, make) => {
					const cached = this.callCache.get(node.key);
					if (
						cached !== undefined &&
						cached.state === state &&
						cached.headerSeq === headerSeq &&
						cached.reqctxSeq === reqctxSeq &&
						cached.stats?.count === stats?.count &&
						cached.stats?.chars === stats?.chars &&
						cached.stats?.incomplete === stats?.incomplete
					) {
						nextCache.set(node.key, cached);
						return cached.view;
					}
					const view = make();
					nextCache.set(node.key, { state, headerSeq, reqctxSeq, stats, view });
					return view;
				};

				for (const node of stepNodes) {
					const state = node.data.state;
					const anchor = state.settled?.seq ?? state.attempts[0]?.seq ?? Number.POSITIVE_INFINITY;
					const stats = inputStats.get(anchor) ?? { count: 0, chars: 0, incomplete: false };
					const headerRecord = this.latestBefore(headers, anchor);
					const reqctxRecord = this.latestBefore(reqctx, anchor);
					calls.push(
						cachedView(node, state, headerRecord?.seq, reqctxRecord?.seq, stats, () =>
							assembleStepCall(state, headerRecord, reqctxRecord, stats, anchor),
						),
					);
				}
				for (const node of compactionNodes) {
					const state = node.data.state;
					calls.push(cachedView(node, state, undefined, undefined, undefined, () => assembleCompactionCall(state)));
				}
				for (const node of titleRequestNodes) {
					const state = node.data.state;
					calls.push(cachedView(node, state, undefined, undefined, undefined, () => assembleTitleCall(state, titles)));
				}
				this.callCache = nextCache;
				calls.sort((left, right) => left.startSeq - right.startSeq);

				this.revision += 1;
				this.snapshot = {
					calls,
					surfaceRevision: this.surfaceRevision,
					foldInput: this.foldFn,
					revision: this.revision,
				};
			}

			/** Latest record with a seq strictly below the anchor. */
			latestBefore(records, anchor) {
				for (let index = records.length - 1; index >= 0; index -= 1) {
					if (records[index].seq < anchor) return records[index];
				}
				return undefined;
			}

			/** One walk over surface events capturing message counts at every anchor. */
			computeInputStats(anchors) {
				const stats = new Map();
				const nodes = [];
				let chars = 0;
				let anchorIndex = 0;
				let tolerated = false;
				const capture = () => {
					stats.set(anchors[anchorIndex], { count: nodes.length, chars, incomplete: tolerated });
					anchorIndex += 1;
				};
				for (const record of this.surfaceEvents) {
					while (anchorIndex < anchors.length && anchors[anchorIndex] <= record.seq) capture();
					if (record.message === null) continue;
					if (record.op === "append") {
						nodes.push(record.seq);
						chars += record.chars;
						continue;
					}
					if (record.op.startSeq === undefined) continue;
					const op = record.op;
					const startIdx = nodes.indexOf(op.startSeq);
					const endIdx = nodes.indexOf(op.endSeq);
					if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) {
						tolerated = true;
						let insertAt = -1;
						if (record.sourceEventSeqs !== undefined) {
							for (const source of record.sourceEventSeqs) {
								const index = nodes.indexOf(source);
								if (index !== -1) {
									insertAt = index;
									break;
								}
							}
						}
						if (record.message !== null) {
							if (insertAt === -1) insertAt = 0;
							nodes.splice(insertAt, 0, record.seq);
							chars += record.chars;
						}
						continue;
					}
					let removedChars = 0;
					for (let index = startIdx; index <= endIdx; index += 1) {
						removedChars += this.surfaceBySeq.get(nodes[index])?.chars ?? 0;
					}
					const removed = endIdx - startIdx + 1;
					nodes.splice(startIdx, removed, ...(record.message !== null ? [record.seq] : []));
					chars += record.chars - removedChars;
				}
				while (anchorIndex < anchors.length) capture();
				return stats;
			}

			/** Full lazy materialization of one request's input message list. */
			materializeInput(events, bySeq, offloads, anchor) {
				const nodes = [];
				let incomplete = false;
				for (const record of events) {
					if (record.seq >= anchor) break;
					if (record.message === null) continue;
					if (record.op === "append") {
						nodes.push(record.seq);
						continue;
					}
					if (record.op.startSeq === undefined) continue;
					const result = applyReplace(nodes, record);
					if (result.tolerated) incomplete = true;
				}
				const offloaded = new Map();
				for (const offload of offloads) {
					if (offload.seq >= anchor) break;
					for (const target of offload.targets) {
						if (target === null || typeof target !== "object" || !Number.isSafeInteger(target.seq)) continue;
						if (!nodes.includes(target.seq)) continue;
						const indexes = Array.isArray(target.imageIndexes) ? target.imageIndexes : [];
						offloaded.set(target.seq, new Set(indexes));
					}
				}
				const messages = [];
				for (const seq of nodes) {
					const record = bySeq.get(seq);
					if (record === undefined || record.message === null) continue;
					const marks = offloaded.get(seq);
					const content = marks === undefined ? record.message.content : markOffloaded(record.message.content, marks);
					messages.push({
						seq,
						role: record.message.role,
						content,
						source: record.message.source,
						isError: record.message.isError === true,
					});
				}
				return { messages, incomplete };
			}
		}

		/** Project offload marks onto one message's content blocks. */
		function markOffloaded(content, indexes) {
			let imageIndex = 0;
			return content.map((block) => {
				if (block.type !== "image") return block;
				const current = imageIndex;
				imageIndex += 1;
				return indexes.has(current) ? { ...block, offloaded: true } : block;
			});
		}

		/** Derive display status of one step call. */
		function stepCallStatus(state) {
			if (state.settled !== null) return state.settled.interrupted ? "interrupted" : "complete";
			if (state.stepEnd !== null) {
				if (state.attempts.length > 0 || state.retries.length > 0) return "error";
				return state.live !== null ? "interrupted" : "aborted";
			}
			if (state.live !== null) return "streaming";
			if (state.retries.length > 0) return "retrying";
			return "running";
		}

		/** Assemble one ordinary per-step call view from its definition state. */
		function assembleStepCall(state, headerRecord, reqctxRecord, stats, anchor) {
			const status = stepCallStatus(state);
			let usage = state.settled?.usage ?? state.live?.usage;
			if (usage === undefined) {
				for (const attempt of state.attempts) usage = addUsage(usage, streamUsage(attempt.stream));
			}
			const completedTime = state.settled?.time ?? state.stepEnd?.time ?? state.live?.lastTime;
			const firstTokenTime = state.firstTokenTime ?? state.live?.firstTokenTime;
			return {
				key: `step:${state.turn}:${state.step}`,
				purpose: "assistant",
				turn: state.turn,
				step: state.step,
				startSeq: state.startSeq,
				startTime: state.started ? state.startTime : state.live?.startTime ?? state.settled?.time ?? state.attempts[0]?.time ?? state.startTime,
				anchor,
				status,
				header: headerRecord,
				reqctx: reqctxRecord,
				inputCount: stats.count,
				inputChars: stats.chars,
				inputIncomplete: stats.incomplete,
				live: state.live,
				attempts: state.attempts,
				settled: state.settled,
				retries: state.retries,
				retryStarted: state.retryStarted,
				stepEnd: state.stepEnd,
				firstTokenTime,
				completedTime,
				usage,
				interrupted: state.settled?.interrupted === true,
			};
		}

		/** Assemble one compaction summarize call view. */
		function assembleCompactionCall(state) {
			const data = state.data;
			return {
				key: `compaction:${state.seq}`,
				purpose: "compaction",
				compactionId: data.compactionId,
				turn: data.turn ?? null,
				startSeq: state.seq,
				startTime: state.time,
				anchor: state.seq,
				status: "complete",
				header: undefined,
				reqctx: undefined,
				inputCount: undefined,
				inputChars: undefined,
				inputIncomplete: false,
				live: null,
				attempts: [],
				settled: {
					seq: state.seq,
					time: state.time,
					message: undefined,
					stream: undefined,
					usage: data.usage,
					interrupted: false,
					summary: data.summary,
					rawOutput: data.rawOutput,
				},
				retries: [],
				retryStarted: [],
				stepEnd: null,
				firstTokenTime: undefined,
				completedTime: undefined,
				usage: data.usage,
				compaction: {
					provider: data.provider,
					model: data.model,
					maxTokens: data.maxTokens,
					shadowedTokenCount: data.shadowedTokenCount,
					shadowedRange: data.shadowedRange,
					llmStreamCall: data.llmStreamCall === true,
					sourceCommandId: data.sourceCommandId,
				},
			};
		}

		/** Assemble one title request call view, pairing its recorded result. */
		function assembleTitleCall(state, titles) {
			const data = state.data;
			let result;
			for (const title of titles) {
				if (title.seq > state.seq) {
					result = title.title;
					break;
				}
			}
			return {
				key: `title:${state.seq}`,
				purpose: "title",
				startSeq: state.seq,
				startTime: state.time,
				anchor: state.seq,
				status: "complete",
				header: undefined,
				reqctx: undefined,
				inputCount: data.messages?.length ?? 0,
				inputChars: undefined,
				inputIncomplete: false,
				live: null,
				attempts: [],
				settled: null,
				retries: [],
				retryStarted: [],
				stepEnd: null,
				firstTokenTime: undefined,
				completedTime: undefined,
				usage: undefined,
				title: {
					titleProvider: data.titleProvider,
					route: data.route,
					system: data.system,
					messages: Array.isArray(data.messages) ? data.messages : [],
					maxTokens: data.maxTokens,
					result,
				},
			};
		}

		/** View definition contribution for the "calls" conversation target. */
		const llmCallsViewDefinition = {
			target: "calls",
			create: () => new LlmCallsSnapshotBuilder(),
		};
		//#endregion
		//#region css
		const css =
			".dL9c_root{--llm-calls-bottom-clearance:calc(var(--dsh-composer-height,152px) + 16px);width:100%;height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);flex-direction:column;display:flex;overflow:hidden}" +
			".dL9c_toolbar{z-index:4;box-sizing:border-box;border-bottom:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);height:34px;flex:none;align-items:center;gap:10px;padding:0 10px 0 14px;display:flex}" +
			".dL9c_count{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxs-12);user-select:none;white-space:nowrap}" +
			".dL9c_countStrong{color:var(--dsw-alias-label-primary);font-weight:600}" +
			".dL9c_toolbarSpacer{flex:1;min-width:0}" +
			".dL9c_toolButton{border-radius:var(--dsw-radius-sm);height:22px;color:var(--dsw-alias-label-tertiary);cursor:pointer;font:var(--dsw-font-xxs-12);background:0 0;border:0;flex:none;align-items:center;gap:5px;padding:0 8px;display:inline-flex}" +
			".dL9c_toolButton:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}" +
			".dL9c_toolButton[aria-pressed=true]{color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-interactive-bg-hover)}" +
			".dL9c_toolButton:disabled{cursor:default;opacity:.5}" +
			".dL9c_toolButton:focus-visible{outline:1px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}" +
			".dL9c_list{flex:1;min-height:0;padding:6px calc(var(--dsh-composer-side-clearance,0px) + 16px) var(--llm-calls-bottom-clearance);overflow-y:auto;container-type:inline-size}" +
			".dL9c_inner{max-width:var(--dsh-chat-content-width,860px);flex-direction:column;width:100%;margin:0 auto;display:flex}" +
			".dL9c_empty{color:var(--dsw-alias-label-tertiary);font:var(--dsh-content-font-size-secondary,13px);padding:36px 0;text-align:center}" +
			".dL9c_card{border-bottom:.5px solid var(--dsw-alias-border-l1)}" +
			".dL9c_cardHead{box-sizing:border-box;grid-template-columns:44px max-content minmax(0,1fr) max-content max-content max-content max-content;align-items:center;gap:10px;width:100%;min-height:40px;padding:4px 8px;cursor:pointer;font:var(--dsw-font-xs-13);background:0 0;border:0;display:grid;text-align:left}" +
			".dL9c_cardHead:hover{background:var(--dsw-alias-interactive-bg-hover)}" +
			".dL9c_cardHead:focus-visible{outline:none;box-shadow:inset 0 0 0 1px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}" +
			".dL9c_card[data-selected=true]>.dL9c_cardHead{background:var(--dsw-alias-interactive-bg-active)}" +
			".dL9c_index{color:var(--dsw-alias-label-tertiary);font:600 11px/16px var(--ds-font-family-code);font-variant-numeric:tabular-nums;user-select:none}" +
			".dL9c_purpose{box-sizing:border-box;border-radius:var(--dsw-radius-xs);user-select:none;border:1px solid #0000;flex:none;align-items:center;height:19px;padding:0 6px;font-size:10px;font-weight:650;line-height:16px;display:inline-flex}" +
			".dL9c_purposeAssistant{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform)}" +
			".dL9c_purposeCompaction{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform)}" +
			".dL9c_purposeTitle{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform)}" +
			".dL9c_model{color:var(--dsw-alias-label-primary);font:11px/16px var(--ds-font-family-code);text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}" +
			".dL9c_status{flex:none;align-items:center;gap:5px;font:var(--dsw-font-xxs-12);color:var(--dsw-alias-label-tertiary);user-select:none;white-space:nowrap;display:inline-flex}" +
			".dL9c_dot{border-radius:50%;flex:none;width:6px;height:6px}" +
			".dL9c_dotComplete{background:var(--dsw-alias-state-success-primary)}" +
			".dL9c_dotInterrupted{background:var(--dsw-alias-state-warn-label)}" +
			".dL9c_dotError{background:var(--dsw-alias-state-error-primary)}" +
			".dL9c_dotAborted{background:var(--dsw-alias-label-caption)}" +
			".dL9c_dotLive{background:var(--dsw-alias-state-business-primary)}@media (prefers-reduced-motion:no-preference){.dL9c_dotLive{animation:dL9c_pulse 1s ease-in-out infinite}}@keyframes dL9c_pulse{0%,to{opacity:1}50%{opacity:.35}}" +
			".dL9c_meta{color:var(--dsw-alias-label-tertiary);font:11px/16px var(--ds-font-family-code);font-variant-numeric:tabular-nums;user-select:none;white-space:nowrap;flex:none}" +
			".dL9c_detail{background:var(--dsw-alias-bg-base);border-top:.5px solid var(--dsw-alias-border-l1);flex-direction:column;display:flex}" +
			".dL9c_tabs{box-sizing:border-box;border-bottom:.5px solid var(--dsw-alias-border-l2);scrollbar-width:none;white-space:nowrap;flex:none;gap:1px;width:100%;height:34px;padding:0 8px 0 14px;display:flex;overflow:auto hidden}" +
			".dL9c_tabs::-webkit-scrollbar{display:none}" +
			".dL9c_tab{color:var(--dsw-alias-label-tertiary);cursor:pointer;font:var(--dsw-font-xs-13);background:0 0;border:0;flex:none;padding:0 9px;position:relative}" +
			".dL9c_tab:hover{color:var(--dsw-alias-label-primary)}" +
			".dL9c_tab[data-active=true]{color:var(--dsw-alias-state-business-primary)}" +
			".dL9c_tab[data-active=true]:after{background:var(--dsw-alias-state-business-primary);content:\"\";border-radius:1px 1px 0 0;height:2px;position:absolute;bottom:0;left:9px;right:9px}" +
			".dL9c_tab:focus-visible{outline:1px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:-1px}" +
			".dL9c_body{flex-direction:column;padding:10px 14px 16px;display:flex}" +
			".dL9c_section{border-bottom:.5px solid var(--dsw-alias-border-l1);flex-direction:column;padding:8px 0 12px;display:flex}" +
			".dL9c_section:last-child{border-bottom:0}" +
			".dL9c_sectionHead{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-strong-13);user-select:none;margin:0 0 6px}" +
			".dL9c_kv{grid-template-columns:110px minmax(0,1fr);align-items:baseline;padding:0 0 2px;display:grid}" +
			".dL9c_kv dt{color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xs-13);user-select:none}" +
			".dL9c_kv dd{min-width:0;color:var(--dsw-alias-label-primary);font:12px/18px var(--ds-font-family-code);text-overflow:ellipsis;white-space:nowrap;margin:0;overflow:hidden}" +
			".dL9c_kvMono{font-family:var(--ds-font-family-code)}" +
			".dL9c_errorText{color:var(--dsw-alias-state-error-primary)}" +
			".dL9c_warnText{color:var(--dsw-alias-state-warn-label)}" +
			".dL9c_usage{flex-wrap:wrap;gap:6px 14px;display:flex}" +
			".dL9c_usageItem{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xxs-12);user-select:none;white-space:nowrap}" +
			".dL9c_usageValue{color:var(--dsw-alias-label-primary);font:600 11px/16px var(--ds-font-family-code);font-variant-numeric:tabular-nums}" +
			".dL9c_rowActions{align-items:center;gap:6px;margin-left:auto;display:inline-flex}" +
			".dL9c_action{border-radius:var(--dsw-radius-sm);height:20px;color:var(--dsw-alias-label-tertiary);cursor:pointer;font:var(--dsw-font-xxs-12);background:0 0;border:0;flex:none;align-items:center;gap:4px;padding:0 7px;display:inline-flex}" +
			".dL9c_action:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}" +
			".dL9c_action[aria-pressed=true]{color:var(--dsw-alias-state-business-primary)}" +
			".dL9c_action:focus-visible{outline:1px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}" +
			".dL9c_msgRow{border-bottom:.5px solid var(--dsw-alias-border-l1)}" +
			".dL9c_msgRow:last-child{border-bottom:0}" +
			".dL9c_msgHead{box-sizing:border-box;grid-template-columns:max-content max-content max-content minmax(0,1fr) max-content;align-items:center;gap:8px;width:100%;min-height:30px;padding:4px 4px;cursor:pointer;font:var(--dsw-font-xs-13);background:0 0;border:0;display:grid;text-align:left}" +
			".dL9c_msgHead:hover{background:var(--dsw-alias-interactive-bg-hover)}" +
			".dL9c_msgHead:focus-visible{outline:none;box-shadow:inset 0 0 0 1px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary))}" +
			".dL9c_role{box-sizing:border-box;border-radius:var(--dsw-radius-xs);user-select:none;border:1px solid #0000;flex:none;align-items:center;height:18px;padding:0 5px;font:600 10px/14px var(--ds-font-family-code);letter-spacing:.02em;display:inline-flex}" +
			".dL9c_roleSystem{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform)}" +
			".dL9c_roleDeveloper{color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform)}" +
			".dL9c_roleUser{color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-tertiary)}" +
			".dL9c_roleAssistant{color:color-mix(in srgb,var(--dsw-alias-brand-primary-new-colorprimary-new-color,--dsw-static-blue-500) 60%,var(--dsw-alias-state-error-secondary,--dsw-alias-label-secondary));background:var(--dsw-alias-interactive-bg-hover)}" +
			".dL9c_roleTool{color:var(--dsw-alias-state-warn-label);background:var(--dsw-alias-state-warn-tertiary)}" +
			".dL9c_msgIndex{color:var(--dsw-alias-label-caption);font:10px/14px var(--ds-font-family-code);font-variant-numeric:tabular-nums;user-select:none}" +
			".dL9c_msgSource{color:var(--dsw-alias-label-caption);font:10px/14px var(--ds-font-family-code);user-select:none}" +
			".dL9c_msgSummary{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}" +
			".dL9c_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s var(--ds-ease-in-out,in-out)}" +
			".dL9c_msgHead[aria-expanded=true] .dL9c_chevron{transform:rotate(90deg)}" +
			".dL9c_msgBody{padding:2px 0 10px 8px}" +
			".dL9c_block+.dL9c_block{margin-top:8px}" +
			".dL9c_blockLabel{color:var(--dsw-alias-label-tertiary);font:600 10px/14px var(--ds-font-family);user-select:none;margin:0 0 3px}" +
			".dL9c_text{overflow-wrap:anywhere;color:var(--dsw-alias-label-primary);font:12px/18px var(--ds-font-family-code);tab-size:2;white-space:pre-wrap;background:0 0;margin:0}" +
			".dL9c_json{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-markdown-code-block,rgba(0,0,0,.04));font:11px/17px var(--ds-font-family-code);tab-size:2;white-space:pre-wrap;border-radius:var(--dsw-radius-sm);max-height:420px;margin:0;padding:10px 12px;overflow:auto}" +
			".dL9c_jsonNoClip{max-height:none}" +
			".dL9c_imageRow{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);align-items:center;gap:8px;max-width:420px;padding:6px;display:flex}" +
			".dL9c_imageThumb{background:var(--dsw-alias-bg-module-platform);border-radius:var(--dsw-radius-xs);object-fit:contain;width:44px;height:44px;flex:none}" +
			".dL9c_imageMeta{flex-direction:column;min-width:0;flex:1;display:flex}" +
			".dL9c_imageName{color:var(--dsw-alias-label-primary);font-size:12px;line-height:16px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}" +
			".dL9c_imageNote{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:15px}" +
			".dL9c_streamTable{border-spacing:0;table-layout:fixed;width:100%;color:var(--dsw-alias-label-secondary);font:11px/16px var(--ds-font-family-code)}" +
			".dL9c_streamTable th{box-sizing:border-box;border-bottom:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-1);font:var(--dsw-font-xxs-12);font-weight:500;text-align:left;user-select:none;white-space:nowrap;padding:4px 8px;position:sticky;top:0}" +
			".dL9c_streamTable td{box-sizing:border-box;border-bottom:.5px solid var(--dsw-alias-border-l1);height:24px;padding:2px 8px;overflow:hidden}" +
			".dL9c_streamTime{width:74px;color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums;white-space:nowrap}" +
			".dL9c_streamOffset{width:64px;color:var(--dsw-alias-label-caption);font-variant-numeric:tabular-nums;white-space:nowrap}" +
			".dL9c_streamType{width:150px;white-space:nowrap}" +
			".dL9c_streamDetail{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}" +
			".dL9c_streamTypeFinish{color:var(--dsw-alias-state-business-primary)}" +
			".dL9c_streamTypeUsage{color:var(--dsw-alias-state-success-primary)}" +
			".dL9c_streamTypeReasoning{color:var(--dsw-alias-state-warn-label)}" +
			".dL9c_retryRow{border-bottom:.5px solid var(--dsw-alias-border-l1);padding:6px 2px}" +
			".dL9c_retryRow:last-child{border-bottom:0}" +
			".dL9c_retryHead{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);align-items:center;gap:8px;display:flex}" +
			".dL9c_toolItem{border-bottom:.5px solid var(--dsw-alias-border-l1)}" +
			".dL9c_toolItem:last-child{border-bottom:0}" +
			".dL9c_toolSummary{box-sizing:border-box;grid-template-columns:12px max-content minmax(0,1fr);align-items:center;gap:6px;min-height:30px;cursor:pointer;user-select:none;padding:4px 2px;list-style:none;display:grid}" +
			".dL9c_toolSummary::-webkit-details-marker{display:none}" +
			".dL9c_toolSummary:hover{background:var(--dsw-alias-interactive-bg-hover)}" +
			".dL9c_toolName{color:var(--dsw-alias-label-primary);font:500 12px/18px var(--ds-font-family-code)}" +
			".dL9c_toolDesc{min-width:0;color:var(--dsw-alias-label-tertiary);font:var(--dsh-content-font-size-secondary,13px);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}" +
			".dL9c_toolBody{background:var(--dsw-alias-bg-base);padding:2px 0 10px 18px}" +
			".dL9c_configChips{flex-wrap:wrap;gap:6px 8px;display:flex}" +
			".dL9c_chip{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xs);color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font:11px/16px var(--ds-font-family-code);padding:2px 7px;white-space:nowrap}" +
			".dL9c_chipValue{color:var(--dsw-alias-label-primary);font-weight:600}" +
			".dL9c_note{color:var(--dsw-alias-label-tertiary);font:var(--dsh-content-font-size-secondary,13px);margin:6px 0 0}" +
			"@container (width<=680px){.dL9c_cardHead{grid-template-columns:36px max-content minmax(0,1fr) max-content;gap:7px}.dL9c_cardUsage,.dL9c_cardDuration,.dL9c_cardTime{display:none}.dL9c_kv{grid-template-columns:92px minmax(0,1fr)}}";
		const cssTagId = "dsh-ui-llm-calls/styles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(cssTagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-ui-llm-calls";
			tag.dataset.pluginCss = cssTagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region view components
		/** Compose one class name. */
		const cx = (...names) => names.filter(Boolean).join(" ");

		/** Copy text through the async clipboard API with a textarea fallback. */
		async function copyText(text) {
			try {
				if (navigator.clipboard?.writeText !== undefined) {
					await navigator.clipboard.writeText(text);
					return true;
				}
			} catch {}
			try {
				const area = document.createElement("textarea");
				area.value = text;
				area.style.position = "fixed";
				area.style.opacity = "0";
				document.body.appendChild(area);
				area.select();
				const ok = document.execCommand("copy");
				area.remove();
				return ok;
			} catch {
				return false;
			}
		}

		/** Small copy button with transient copied feedback. */
		function CopyButton({ getValue, label, t }) {
			const [copied, setCopied] = useState(false);
			const timerRef = useRef(null);
			useEffect(() => () => { if (timerRef.current !== null) clearTimeout(timerRef.current); }, []);
			const onClick = useCallback(async () => {
				const value = getValue();
				if (typeof value !== "string" || value === "") return;
				if (await copyText(value)) {
					setCopied(true);
					if (timerRef.current !== null) clearTimeout(timerRef.current);
					timerRef.current = setTimeout(() => setCopied(false), 1600);
				}
			}, [getValue]);
			return h("button", { className: cx("dL9c_action"), type: "button", onClick }, copied ? t("input.copied") : label);
		}

		/** Safe JSON stringify with a cycle-free pretty form. */
		function prettyJson(value) {
			try {
				return JSON.stringify(value, null, 2) ?? "";
			} catch {
				return String(value);
			}
		}

		/** Toggle chip acting like a segmented control member. */
		function SegToggle({ active, label, onClick }) {
			return h("button", { className: cx("dL9c_action"), type: "button", "aria-pressed": active, onClick }, label);
		}

		/** One key-value overview row. */
		function Kv({ label, value, mono, error, warn }) {
			if (value === undefined || value === null || value === "") return null;
			return h("div", { className: cx("dL9c_kv") },
				h("dt", null, label),
				h("dd", { className: cx(mono && "dL9c_kvMono", error && "dL9c_errorText", warn && "dL9c_warnText") }, value),
			);
		}

		/** Token usage chip row. */
		function UsageView({ usage, t }) {
			if (usage === undefined) return h("div", { className: cx("dL9c_note") }, t("misc.unavailable"));
			const items = [];
			const input = usageInputTotal(usage);
			if (input !== undefined && input !== 0) items.push([t("usage.input"), formatCount(input)]);
			if (usage.cacheReadTokens !== undefined && usage.cacheReadTokens !== 0) items.push([t("usage.cacheRead"), formatCount(usage.cacheReadTokens)]);
			if (usage.cacheWriteTokens !== undefined && usage.cacheWriteTokens !== 0) items.push([t("usage.cacheWrite"), formatCount(usage.cacheWriteTokens)]);
			if (usage.outputTokens !== undefined) items.push([t("usage.output"), formatCount(usage.outputTokens)]);
			if (usage.reasoningTokens !== undefined && usage.reasoningTokens !== 0) items.push([t("usage.reasoning"), formatCount(usage.reasoningTokens)]);
			if (usage.totalTokens !== undefined) items.push([t("usage.total"), formatCount(usage.totalTokens)]);
			return h("div", { className: cx("dL9c_usage") }, items.map(([label, value]) =>
				h("span", { key: label, className: cx("dL9c_usageItem") }, label + " ", h("span", { className: cx("dL9c_usageValue") }, value)),
			));
		}

		/** One config chip like temperature or thinking effort. */
		function Chip({ label, value }) {
			if (value === undefined || value === null || value === "") return null;
			return h("span", { className: cx("dL9c_chip") }, label, " ", h("span", { className: cx("dL9c_chipValue") }, String(value)));
		}

		/** One content block of any role's message. */
		function BlockView({ block, t, loadImage, offloaded }) {
			const [imageUrl, setImageUrl] = useState(null);
			const attachment = block.attachment;
			useEffect(() => {
				if (block.kind !== "image" || loadImage === undefined) return;
				let active = true;
				loadImage(attachment).then((url) => { if (active) setImageUrl(url); }, () => {});
				return () => { active = false; };
			}, [block.kind, attachment, loadImage]);
			if (block.kind === "text" || block.kind === "reasoning") {
				return h("div", { className: cx("dL9c_block") },
					h("div", { className: cx("dL9c_blockLabel") }, t(block.kind === "text" ? "block.text" : "block.reasoning")),
					h("pre", { className: cx("dL9c_text") }, block.text),
				);
			}
			if (block.kind === "tool-call") {
				return h("div", { className: cx("dL9c_block") },
					h("div", { className: cx("dL9c_blockLabel") }, t("block.toolCall") + " · " + block.name),
					h("pre", { className: cx("dL9c_json") }, block.argsRaw),
				);
			}
			if (block.kind === "image") {
				return h("div", { className: cx("dL9c_block") },
					h("div", { className: cx("dL9c_blockLabel") }, t("block.image")),
					h("div", { className: cx("dL9c_imageRow") },
						imageUrl !== null ? h("img", { className: cx("dL9c_imageThumb"), src: imageUrl, alt: "" }) : null,
						h("div", { className: cx("dL9c_imageMeta") },
							h("div", { className: cx("dL9c_imageName") }, attachment?.name ?? t("image.unnamed", { index: 1 })),
							offloaded || block.offloaded === true ? h("div", { className: cx("dL9c_imageNote") }, t("image.offloaded")) : null,
						),
					),
				);
			}
			if (block.kind === "file") {
				return h("div", { className: cx("dL9c_block") },
					h("div", { className: cx("dL9c_blockLabel") }, t("block.file")),
					h("div", { className: cx("dL9c_imageRow") },
						h("div", { className: cx("dL9c_imageMeta") },
							h("div", { className: cx("dL9c_imageName") }, attachment?.name ?? ""),
						),
					),
				);
			}
			return h("div", { className: cx("dL9c_block") },
				h("div", { className: cx("dL9c_blockLabel") }, t("block.other")),
				h("pre", { className: cx("dL9c_json") }, prettyJson(block.block ?? block)),
			);
		}

		/** Render one message's content blocks. */
		function BlocksView({ content, t, loadImage }) {
			return h("div", null, content.map((block, index) =>
				h(BlockView, {
					key: index,
					t,
					loadImage,
					block: block.type === "text" || block.type === "reasoning"
						? { kind: block.type, text: block.text }
						: block.type === "tool-call"
							? { kind: "tool-call", name: block.name, argsRaw: block.arguments }
							: block.type === "image"
								? { kind: "image", attachment: block.attachment, offloaded: block.offloaded === true }
								: block.type === "file"
									? { kind: "file", attachment: block.attachment }
									: { kind: "other", block },
				}),
			));
		}

		/** One input message row with its expand/collapse body. */
		function MessageRow({ message, index, t, loadImage }) {
			const [open, setOpen] = useState(index === 0);
			const roleKey = "role." + message.role;
			const summary = contentSummary(message.content);
			const sourceKind = message.source?.kind;
			return h("div", { className: cx("dL9c_msgRow") },
				h("button", {
					className: cx("dL9c_msgHead"),
					type: "button",
					"aria-expanded": open,
					onClick: () => setOpen(!open),
				},
					h("span", { className: cx("dL9c_role", "dL9c_role" + message.role[0].toUpperCase() + message.role.slice(1)) }, t(roleKey)),
					h("span", { className: cx("dL9c_msgIndex") }, "#" + (index + 1)),
					sourceKind !== undefined && sourceKind !== message.role ? h("span", { className: cx("dL9c_msgSource") }, sourceKind) : null,
					h("span", { className: cx("dL9c_msgSummary") }, message.isError === true ? t("block.error") + " · " + summary : summary),
					h("span", { className: cx("dL9c_chevron"), "aria-hidden": "true" }, "›"),
				),
				open === true
					? h("div", { className: cx("dL9c_msgBody") },
						message.isError === true ? h("div", { className: cx("dL9c_blockLabel", "dL9c_errorText") }, t("block.error")) : null,
						h(BlocksView, { content: message.content, t, loadImage }),
					)
					: null,
			);
		}

		/** Memoized message row: streaming frames skip unchanged input rows. */
		const MemoizedMessageRow = react.memo(MessageRow);

		/** Structured input message list with raw-JSON and copy affordances. */
		function InputMessagesView({ messages, t, loadImage }) {
			const [raw, setRaw] = useState(false);
			const chars = useMemo(() => messages.reduce((total, message) => total + contentChars(message.content), 0), [messages]);
			return h("div", null,
				h("div", { className: cx("dL9c_sectionHead") },
					t("input.summary", { count: messages.length, tokens: formatCount(estimateTokens(chars)) }),
					h("span", { className: cx("dL9c_rowActions") },
						h(SegToggle, { active: !raw, label: t("input.structured"), onClick: () => setRaw(false) }),
						h(SegToggle, { active: raw, label: t("input.raw"), onClick: () => setRaw(true) }),
						h(CopyButton, { getValue: () => prettyJson(messages.map(({ role, content }) => ({ role, content }))), label: t("input.copyAll"), t }),
					),
				),
				raw === true
					? h("pre", { className: cx("dL9c_json") }, prettyJson(messages.map(({ role, content }) => ({ role, content }))))
					: h("div", null, messages.map((message, index) =>
						h(MemoizedMessageRow, { key: message.seq + ":" + index, message, index, t, loadImage }),
					)),
			);
		}

		/** One expanded stream chunk table with progressive rendering. */
		function StreamChunksView({ chunks, t, originTime }) {
			const [limit, setLimit] = useState(400);
			const visible = chunks.length > limit ? chunks.slice(0, limit) : chunks;
			const typeClass = (chunk) => {
				switch (chunk.type) {
					case "finish": return cx("dL9c_streamTypeFinish");
					case "usage": return cx("dL9c_streamTypeUsage");
					case "reasoning-delta": return cx("dL9c_streamTypeReasoning");
					default: return null;
				}
			};
			const describe = (chunk) => {
				switch (chunk.type) {
					case "block-start": return chunk.blockType + " #" + chunk.index;
					case "block-end": return chunk.block?.type ?? "";
					case "text-delta":
					case "reasoning-delta": return chunk.text;
					case "tool-call-delta": return (chunk.name !== undefined ? "[" + chunk.name + "] " : "") + chunk.argumentsDelta;
					case "usage": return prettyJson(chunk.usage);
					case "finish": return chunk.reason?.kind ?? "";
					default: return prettyJson(chunk);
				}
			};
			return h("div", null,
				h("table", { className: cx("dL9c_streamTable") },
					h("thead", null, h("tr", null,
						h("th", { className: cx("dL9c_streamTime") }, t("stream.time")),
						h("th", { className: cx("dL9c_streamOffset") }, t("stream.offset")),
						h("th", { className: cx("dL9c_streamType") }, t("stream.type")),
						h("th", null, t("stream.detail")),
					)),
					h("tbody", null, visible.map((entry, index) =>
						h("tr", { key: index },
							h("td", { className: cx("dL9c_streamTime") }, formatClock(entry.time)),
							h("td", { className: cx("dL9c_streamOffset") }, "+" + (entry.time - originTime) + "ms"),
							h("td", { className: cx("dL9c_streamType", typeClass(entry.chunk)) }, entry.chunk.type ?? "?"),
							h("td", { className: cx("dL9c_streamDetail") }, describe(entry.chunk)),
						),
					)),
				),
				chunks.length > limit
					? h("button", { className: cx("dL9c_toolButton"), type: "button", onClick: () => setLimit(limit + 2000) }, t("stream.showMore", { count: formatCount(chunks.length - limit) }))
					: null,
			);
		}

		/** Retry and failed-attempt ledger. */
		function RetriesView({ call, t }) {
			if (call.retries.length === 0 && call.attempts.length === 0) {
				return h("div", { className: cx("dL9c_note") }, t("retries.none"));
			}
			return h("div", null,
				call.retries.map((retry, index) =>
					h("div", { key: retry.seq, className: cx("dL9c_retryRow") },
						h("div", { className: cx("dL9c_retryHead") },
							h("span", null, t("retries.attempt", { index: index + 1 })),
							h("span", { className: cx("dL9c_msgSource") }, t("retries.scheduled", { retry: retry.retry, delay: formatDuration(retry.delayMs) })),
							call.retryStarted.some((started) => started.retry === retry.retry && started.time >= retry.time)
								? h("span", { className: cx("dL9c_msgSource") }, "· " + t("retries.started"))
								: null,
							retry.maxRetries !== undefined ? h("span", { className: cx("dL9c_msgSource") }, t("misc.retry", { retry: retry.retry, max: retry.maxRetries })) : null,
						),
						h("div", { className: cx("dL9c_text", "dL9c_errorText") }, (retry.failure?.code !== undefined ? "[" + retry.failure.code + "] " : "") + (retry.failure?.message ?? "")),
					),
				),
				call.attempts.length > 0
					? h("div", { className: cx("dL9c_section") },
						h("div", { className: cx("dL9c_sectionHead") }, t("retries.failedAttempts")),
						call.attempts.map((attempt, index) =>
							h("details", { key: attempt.seq, className: cx("dL9c_toolItem") },
								h("summary", { className: cx("dL9c_toolSummary") },
									h("span", { className: cx("dL9c_chevron"), "aria-hidden": "true" }, "›"),
									h("span", { className: cx("dL9c_toolName") }, t("retries.attempt", { index: index + 1 })),
									h("span", { className: cx("dL9c_toolDesc") }, formatClock(attempt.time) + " · " + t("stream.records", { count: attempt.stream.length, chunks: formatCount(streamChunkCount(attempt.stream)) })),
								),
								h("div", { className: cx("dL9c_toolBody") },
									h(StreamChunksView, { chunks: expandStream(attempt.stream), t, originTime: call.startTime }),
								),
							),
						),
					)
					: null,
			);
		}

		/** Tool catalog of one request. */
		function ToolsView({ tools, t }) {
			if (tools === undefined || tools.length === 0) return h("div", { className: cx("dL9c_note") }, t("tools.none"));
			return h("div", null,
				h("div", { className: cx("dL9c_sectionHead") },
					h(CopyButton, { getValue: () => prettyJson(tools), label: t("tools.copy"), t }),
				),
				tools.map((tool) =>
					h("details", { key: tool.name, className: cx("dL9c_toolItem") },
						h("summary", { className: cx("dL9c_toolSummary") },
							h("span", { className: cx("dL9c_chevron"), "aria-hidden": "true" }, "›"),
							h("span", { className: cx("dL9c_toolName") }, tool.name),
							h("span", { className: cx("dL9c_toolDesc") }, tool.description ?? ""),
						),
						h("div", { className: cx("dL9c_toolBody") },
							h("div", { className: cx("dL9c_blockLabel") }, t("tools.description")),
							h("pre", { className: cx("dL9c_text") }, tool.description ?? ""),
							h("div", { className: cx("dL9c_blockLabel") }, t("tools.parameters")),
							h("pre", { className: cx("dL9c_json") }, prettyJson(tool.parameters ?? {})),
						),
					),
				),
			);
		}
		//#endregion
		//#region main view
		/** Calls rendered per page before the show-older control appears. */
		const VISIBLE_LIMIT_STEP = 200;

		/** Per-request detail tabs. */
		function CallDetail({ call, t, loadImage, foldInput }) {
			const [tab, setTab] = useState("overview");
			const isAssistant = call.purpose === "assistant";
			const isCompaction = call.purpose === "compaction";
			const isTitle = call.purpose === "title";
			const tools = call.header?.header?.tools;
			const hasStream = call.settled?.stream !== undefined || call.live !== null;
			const inputView = useMemo(
				() => (isTitle ? { messages: titleMessages(call), incomplete: false } : foldInput(call.anchor)),
				[foldInput, call.anchor, call.inputCount, call.inputChars, call.inputIncomplete, isTitle, call.title],
			);
			const tabs = [["overview", t("tab.overview")]];
			if (isAssistant || isTitle) tabs.push(["input", t("tab.input")]);
			tabs.push(["output", t("tab.output")]);
			if (isAssistant && hasStream) tabs.push(["stream", t("tab.stream")]);
			if (isAssistant && (call.retries.length > 0 || call.attempts.length > 0)) tabs.push(["retries", t("tab.retries", { count: call.retries.length })]);
			if (tools !== undefined) tabs.push(["tools", t("tab.tools", { count: tools.length })]);

			return h("div", { className: cx("dL9c_detail") },
				h("div", { className: cx("dL9c_tabs"), role: "tablist" },
					tabs.map(([id, label]) =>
						h("button", {
							key: id,
							className: cx("dL9c_tab"),
							type: "button",
							role: "tab",
							"data-active": tab === id,
							onClick: () => setTab(id),
						}, label),
					),
				),
				h("div", { className: cx("dL9c_body") }, renderTab(tab, { call, t, loadImage, inputView, tools })),
			);
		}

		/** Synthesize the title request's input message list. */
		function titleMessages(call) {
			const messages = [];
			if (call.title.system !== undefined && call.title.system !== "") {
				messages.push({ seq: -1, role: "system", content: [{ type: "text", text: call.title.system }], source: { kind: "system-prompt" }, isError: false });
			}
			for (const message of call.title.messages) messages.push({ seq: messages.length, role: message.role, content: message.content, source: message.source, isError: false });
			return messages;
		}

		/** Render the active detail tab body. */
		function renderTab(tab, { call, t, loadImage, inputView, tools }) {
			if (tab === "input") {
				return h("div", null,
					call.inputIncomplete === true ? h("div", { className: cx("dL9c_note", "dL9c_warnText") }, t("input.incomplete")) : null,
					h(InputMessagesView, { messages: inputView.messages, t, loadImage }),
				);
			}
			if (tab === "output") return h(OutputTab, { call, t, loadImage });
			if (tab === "stream") {
				const streamRecords = call.settled?.stream ?? call.live?.records;
				const streamChunkTotal = call.settled?.stream !== undefined ? streamChunkCount(call.settled.stream) : (call.live?.records.length ?? 0);
				const chunks = call.settled?.stream !== undefined ? expandStream(call.settled.stream) : call.live?.records ?? [];
				const dropped = call.live?.dropped ?? 0;
				return h("div", null,
					h("div", { className: cx("dL9c_sectionHead") },
						t("stream.records", { count: streamRecords?.length ?? 0, chunks: formatCount(streamChunkTotal) }),
						h("span", { className: cx("dL9c_rowActions") },
							h(CopyButton, { getValue: () => prettyJson(streamRecords), label: t("stream.copy"), t }),
						),
					),
					dropped > 0 ? h("div", { className: cx("dL9c_note") }, t("stream.dropped", { count: formatCount(dropped) })) : null,
					chunks.length > 0
						? h(StreamChunksView, { chunks, t, originTime: call.startTime })
						: h("div", { className: cx("dL9c_note") }, t("misc.unavailable")),
				);
			}
			if (tab === "retries") return h(RetriesView, { call, t });
			if (tab === "tools") return h(ToolsView, { tools, t });
			return h(OverviewTab, { call, t });
		}

		/** The settled message blocks, live blocks, or compaction summary. */
		function OutputTab({ call, t, loadImage }) {
			if (call.purpose === "compaction") {
				const settled = call.settled;
				return h("div", null,
					h("div", { className: cx("dL9c_section") },
						h("div", { className: cx("dL9c_sectionHead") }, t("tab.output")),
						h(BlocksView, { content: settled?.summary ?? [], t, loadImage }),
					),
					settled?.rawOutput !== undefined && settled.rawOutput.length > 0
						? h("details", { className: cx("dL9c_toolItem") },
							h("summary", { className: cx("dL9c_toolSummary") },
								h("span", { className: cx("dL9c_chevron"), "aria-hidden": "true" }, "›"),
								h("span", { className: cx("dL9c_toolName") }, t("block.other")),
							),
							h("div", { className: cx("dL9c_toolBody") }, h(BlocksView, { content: settled.rawOutput, t, loadImage })),
						)
						: null,
				);
			}
			if (call.purpose === "title") {
				return h("div", null,
					h("div", { className: cx("dL9c_section") },
						h("div", { className: cx("dL9c_sectionHead") }, t("title.result")),
						h("pre", { className: cx("dL9c_text") }, call.title.result ?? t("misc.unavailable")),
					),
				);
			}
			const settled = call.settled;
			const blocks = settled !== null ? settled.message?.content ?? [] : (call.live?.blocks ?? []).filter(Boolean);
			return h("div", null,
				call.interrupted === true ? h("div", { className: cx("dL9c_note", "dL9c_warnText") }, t("output.interrupted")) : null,
				blocks.length === 0 && settled === null
					? h("div", { className: cx("dL9c_note") }, t("output.noContent"))
					: h("div", { className: cx("dL9c_section") },
						h("div", { className: cx("dL9c_sectionHead") },
							t("tab.output"),
							settled?.message !== undefined
								? h("span", { className: cx("dL9c_rowActions") }, h(CopyButton, { getValue: () => prettyJson(settled.message), label: t("output.copy"), t }))
								: null,
						),
						h(BlocksView, { content: blocks, t, loadImage }),
					),
			);
		}

		/** Overview: status, route, config, timing, usage, and failure facts. */
		function OverviewTab({ call, t }) {
			const config = call.header?.header?.config;
			const model = call.settled?.message?.source?.model ?? config?.model ?? call.compaction?.model ?? call.title?.route?.model ?? t("misc.unknown");
			const provider = call.settled?.message?.source?.provider ?? config?.provider ?? call.compaction?.provider ?? call.title?.route?.provider ?? t("misc.unknown");
			const duration = call.completedTime !== undefined ? call.completedTime - call.startTime : undefined;
			const decode = call.firstTokenTime !== undefined && call.completedTime !== undefined ? call.completedTime - call.firstTokenTime : undefined;
			const throughput = decode !== undefined && decode > 0 && call.usage?.outputTokens !== undefined ? call.usage.outputTokens / (decode / 1000) : undefined;
			const lastFailure = call.retries[call.retries.length - 1]?.failure;
			return h("div", null,
				h("div", { className: cx("dL9c_section") },
					h("div", { className: cx("dL9c_sectionHead") }, t("field.status")),
					h("div", { className: cx("dL9c_kv") }, h("dt", null, t("field.purpose")), h("dd", null, t("card." + call.purpose))),
					call.turn !== undefined && call.turn !== null
						? h("div", { className: cx("dL9c_kv") }, h("dt", null, t("card.turn", { turn: "" }).replace(/\s*$/, "")), h("dd", null, String(call.turn)))
						: null,
					call.step !== undefined
						? h("div", { className: cx("dL9c_kv") }, h("dt", null, t("card.step", { step: "" }).replace(/\s*$/, "")), h("dd", null, String(call.step)))
						: null,
					h("div", { className: cx("dL9c_kv") }, h("dt", null, t("field.status")), h("dd", { className: cx(call.status === "error" && "dL9c_errorText", (call.status === "interrupted" || call.status === "retrying") && "dL9c_warnText") }, t("card." + call.status))),
					h("div", { className: cx("dL9c_kv") }, h("dt", null, t("field.provider")), h("dd", null, provider)),
					h("div", { className: cx("dL9c_kv") }, h("dt", null, t("field.model")), h("dd", null, String(model))),
					call.header !== undefined
						? h("div", { className: cx("dL9c_kv") }, h("dt", null, t("field.config")), h("dd", null, call.header.reason))
						: null,
					lastFailure !== undefined
						? h("div", { className: cx("dL9c_kv") }, h("dt", null, t("field.status")), h("dd", { className: cx("dL9c_errorText") }, (lastFailure.code !== undefined ? "[" + lastFailure.code + "] " : "") + lastFailure.message))
						: null,
				),
				h("div", { className: cx("dL9c_section") },
					h("div", { className: cx("dL9c_sectionHead") }, t("field.config")),
					h("div", { className: cx("dL9c_configChips") },
						h(Chip, { label: "thinking", value: config?.thinking }),
						h(Chip, { label: "reasoningEffort", value: config?.reasoningEffort }),
						h(Chip, { label: "temperature", value: config?.temperature }),
						h(Chip, { label: "maxTokens", value: config?.maxTokens }),
						h(Chip, { label: "stop", value: Array.isArray(config?.stop) ? config.stop.join(", ") : undefined }),
						h(Chip, { label: t("field.contextWindow"), value: call.reqctx?.data?.contextWindow }),
						call.compaction !== undefined ? h(Chip, { label: "maxTokens", value: call.compaction.maxTokens }) : null,
						call.compaction !== undefined ? h(Chip, { label: "shadowed", value: call.compaction.shadowedTokenCount }) : null,
						call.title !== undefined ? h(Chip, { label: t("title.maxTokens"), value: call.title.maxTokens }) : null,
					),
					call.header !== undefined
						? h("pre", { className: cx("dL9c_json") }, prettyJson(call.header.header.config))
						: null,
				),
				h("div", { className: cx("dL9c_section") },
					h("div", { className: cx("dL9c_sectionHead") }, t("field.usage")),
					h(UsageView, { usage: call.usage, t }),
				),
				h("div", { className: cx("dL9c_section") },
					h("div", { className: cx("dL9c_sectionHead") }, t("field.timing")),
					h("div", { className: cx("dL9c_kv") }, h("dt", null, t("field.startedAt")), h("dd", null, formatClock(call.startTime))),
					h(Kv, { label: t("field.completedAt"), value: call.completedTime !== undefined ? formatClock(call.completedTime) : undefined, mono: true }),
					h(Kv, { label: t("field.duration"), value: duration !== undefined ? formatDuration(duration) : undefined }),
					h(Kv, { label: t("field.ttft"), value: call.firstTokenTime !== undefined ? formatDuration(call.firstTokenTime - call.startTime) : undefined }),
					h(Kv, { label: t("field.decode"), value: decode !== undefined ? formatDuration(decode) : undefined }),
					h(Kv, { label: t("field.throughput"), value: throughput !== undefined ? throughput.toFixed(1) + " tok/s" : undefined }),
				),
			);
		}

		/** One call card: summary row plus the expandable detail. */
		function CallCard({ call, number, selected, onSelect, t, loadImage, foldInput }) {
			const config = call.header?.header?.config;
			const model = call.settled?.message?.source?.model ?? config?.model ?? call.compaction?.model ?? call.title?.route?.model ?? t("misc.unknown");
			const inTokens = call.usage !== undefined ? usageInputTotal(call.usage) : undefined;
			const outTokens = call.usage?.outputTokens;
			const duration = call.completedTime !== undefined ? call.completedTime - call.startTime : undefined;
			const dotClass =
				call.status === "complete" ? "dL9c_dotComplete"
				: call.status === "error" ? "dL9c_dotError"
				: call.status === "interrupted" ? "dL9c_dotInterrupted"
				: call.status === "aborted" ? "dL9c_dotAborted"
				: "dL9c_dotLive";
			return h("div", { className: cx("dL9c_card"), "data-selected": selected },
				h("button", {
					className: cx("dL9c_cardHead"),
					type: "button",
					onClick: () => onSelect(call.key),
					"aria-expanded": selected,
				},
					h("span", { className: cx("dL9c_index") }, number),
					h("span", { className: cx("dL9c_purpose", "dL9c_purpose" + call.purpose[0].toUpperCase() + call.purpose.slice(1)) },
						call.purpose === "assistant" ? "T" + call.turn + "·S" + call.step : t("card." + call.purpose),
					),
					h("span", { className: cx("dL9c_model") }, String(model)),
					h("span", { className: cx("dL9c_status") },
						h("span", { className: cx("dL9c_dot", dotClass) }),
						t("card." + call.status),
					),
					h("span", { className: cx("dL9c_meta", "dL9c_cardUsage"), title: t("field.usage") },
						(inTokens !== undefined || outTokens !== undefined)
							? "↑" + formatTokensShort(inTokens ?? 0) + " ↓" + formatTokensShort(outTokens ?? 0)
							: "—",
					),
					h("span", { className: cx("dL9c_meta", "dL9c_cardDuration") }, duration !== undefined ? formatDuration(duration) : "—"),
					h("span", { className: cx("dL9c_meta", "dL9c_cardTime") }, formatClock(call.startTime)),
				),
				selected === true
					? h(CallDetail, { key: call.key, call, t, loadImage, foldInput })
					: null,
			);
		}

		/** Memoized card so streaming frames only re-render the cards that changed. */
		const MemoizedCallCard = react.memo(CallCard);

		/** Root view: toolbar, follow control, card ledger, and history paging. */
		function LlmCallsView({ useSession, useLlmCalls, loadOlder, loadImage, viewRequest, completeViewRequest, t }) {
			const session = useSession((value) => value);
			const snapshot = useLlmCalls((value) => value);
			const calls = snapshot?.calls ?? [];
			const [selectedKey, setSelectedKey] = useState(null);
			const [follow, setFollow] = useState(true);
			const [limit, setLimit] = useState(VISIBLE_LIMIT_STEP);
			const [loadingOlder, setLoadingOlder] = useState(false);
			const listRef = useRef(null);

			useEffect(() => {
				if (viewRequest !== null && viewRequest !== undefined && viewRequest.view === "calls") completeViewRequest();
			}, [viewRequest, completeViewRequest]);

			useEffect(() => {
				if (follow !== true) return;
				// Follow the tail only while nothing earlier is selected.
				if (selectedKey !== null && selectedKey !== (calls.length > 0 ? calls[calls.length - 1].key : null)) return;
				const element = listRef.current;
				if (element !== null) element.scrollTop = element.scrollHeight;
			}, [follow, snapshot, selectedKey, calls]);

			const hasMore = session?.hasMore ?? false;
			const visible = calls.length > limit ? calls.slice(calls.length - limit) : calls;
			const hiddenCount = calls.length - visible.length;
			const firstNumber = calls.length - visible.length + 1;

			let totalIn = 0;
			let totalOut = 0;
			for (const call of calls) {
				if (call.usage === undefined) continue;
				totalIn += usageInputTotal(call.usage) ?? 0;
				totalOut += call.usage.outputTokens ?? 0;
			}

			const onLoadOlder = useCallback(async () => {
				if (loadOlder === undefined) return;
				setLoadingOlder(true);
				try {
					await loadOlder();
				} finally {
					setLoadingOlder(false);
				}
			}, [loadOlder]);

			const onSelect = useCallback((key) => setSelectedKey((current) => (current === key ? null : key)), []);

			return h("div", { className: cx("dL9c_root"), "data-conversation-composer-overlay": "" },
				h("div", { className: cx("dL9c_toolbar") },
					h("span", { className: cx("dL9c_count") },
						h("span", { className: cx("dL9c_countStrong") }, formatCount(calls.length)), " " + t("toolbar.calls"),
					),
					h("span", { className: cx("dL9c_count") }, "· ", h("span", { className: cx("dL9c_countStrong") }, formatTokensShort(totalIn + totalOut)), " tokens"),
					h("span", { className: cx("dL9c_toolbarSpacer") }),
					h("button", {
						className: cx("dL9c_toolButton"),
						type: "button",
						"aria-pressed": follow,
						onClick: () => setFollow(!follow),
					}, t("toolbar.follow")),
					hasMore === true
						? h("button", {
							className: cx("dL9c_toolButton"),
							type: "button",
							disabled: loadOlder === undefined || loadingOlder,
							onClick: onLoadOlder,
						}, loadingOlder ? t("toolbar.loading") : t("toolbar.loadOlder"))
						: null,
				),
				h("div", { className: cx("dL9c_list"), ref: listRef },
					h("div", { className: cx("dL9c_inner") },
						calls.length === 0
							? h("div", { className: cx("dL9c_empty") }, t("toolbar.empty"))
							: h("div", null,
								hiddenCount > 0
									? h("button", {
										className: cx("dL9c_toolButton"),
										type: "button",
										onClick: () => setLimit(limit + VISIBLE_LIMIT_STEP),
									}, t("toolbar.showOlder", { count: formatCount(hiddenCount) }))
									: null,
								visible.map((call, index) =>
									h(MemoizedCallCard, {
										key: call.key,
										call,
										number: firstNumber + index,
										selected: selectedKey === call.key,
										onSelect,
										t,
										loadImage,
										foldInput: snapshot?.foldInput ?? EMPTY_SNAPSHOT.foldInput,
									}),
								),
							),
					),
				),
			);
		}
		//#endregion
		//#region plugin registration
		/** Services this client plugin waits for on the browser root context. */
		const inject = ["slots", "sessions", "uiSession", "uiConversation", "locale"];

		/** Install the llm-calls conversation view. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "llm-calls: dictionaries");
			const t = ctx.locale.bind(NS);
			registerLlmCallsDefinitions(ctx);
			ctx.effect(() => ctx.uiConversation.views.register(llmCallsViewDefinition), "llm-calls: view definition");

			const sources = new WeakMap();
			const sourceFor = (binding) => {
				let source = sources.get(binding);
				if (source === undefined) {
					const target = ctx.uiConversation.binding(binding).target("calls");
					source = {
						getSnapshot: () => target.getSnapshot() ?? EMPTY_SNAPSHOT,
						subscribe: (listener) => target.subscribe(listener),
					};
					sources.set(binding, source);
				}
				return source;
			};
			ctx.effect(
				() =>
					ctx.uiSession.provide({
						hooks: ["llmCalls"],
						resolve: (binding) => ({ hooks: { llmCalls: sourceFor(binding) } }),
					}),
				"llm-calls: session sources",
			);

			ctx.slots.inject("conversation.view", () =>
				ctx.slots.register(
					{
						name: "conversation.view",
						id: "calls",
						order: 15,
						locale: NS,
						label: () => t("view.calls"),
						inject: (sessionId) => {
							const binding = ctx.sessions.binding(sessionId);
							const session = binding?.session;
							if (session === undefined) throw new Error(`llm-calls: session "${String(sessionId)}" is unavailable`);
							const target = ctx.uiConversation.binding(sessionId).target("calls");
							return {
								loadOlder: async () => {
									const before = target.getSnapshot();
									await session.loadOlder();
									return target.getSnapshot() !== before;
								},
								loadImage: Object.assign((attachment) => ctx.uiConversation.imageUrl(sessionId, attachment), {
									peek: (attachment) => ctx.uiConversation.peekImageUrl(sessionId, attachment),
								}),
							};
						},
					},
					LlmCallsView,
				),
			);
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		/** Test-only handles; never consumed by the loader. */
		exports.__internals = {
			LlmCallsView,
			CallDetail,
			renderTab,
			OutputTab,
			OverviewTab,
			RetriesView,
			ToolsView,
			StreamChunksView,
			InputMessagesView,
			MessageRow,
			BlocksView,
			BlockView,
			LlmCallsSnapshotBuilder,
			stepDefinition,
			surfaceDefinition,
			llmCallsViewDefinition,
			registerLlmCallsDefinitions,
		};
		return module.exports;
	},
});
