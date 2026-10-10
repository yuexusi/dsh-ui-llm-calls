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
