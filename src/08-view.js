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
