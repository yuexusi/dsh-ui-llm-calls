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
