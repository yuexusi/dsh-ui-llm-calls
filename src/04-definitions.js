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
