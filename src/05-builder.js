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
