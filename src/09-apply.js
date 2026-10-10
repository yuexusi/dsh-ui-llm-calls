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
