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
