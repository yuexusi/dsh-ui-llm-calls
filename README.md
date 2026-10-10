# dsh-ui-llm-calls

An LLM call-log view plugin for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) Web client. It adds a third **Calls** tab beside **Chat** and **Trajectory** in the conversation view ring — one card per model request with the complete reconstructed request process.

Pure client-side projection over the durable session log: history works retroactively, and there is zero extra storage overhead. English | [中文](README.zh.md)

## Features

Every model request gets a card (ordinary step, compaction summary, or session-title request). Click to expand:

- **Overview** — status, provider/model, request config (thinking, reasoningEffort, temperature, maxTokens, stop, context window), timing (started/completed/duration/TTFT/decoding/throughput), token usage (input, cache read/write, output, reasoning, total), and the last failure reason.
- **Input** — the complete message array sent to the model for that request, one collapsible row per message (role badge, producer source, content blocks: text, reasoning, images, files, tool calls, tool results). Toggle the whole list as raw JSON, copy everything in one click. Compacted requests show the true post-compaction surface (system prompt retained, compacted range folded into the summary message).
- **Output** — the settled assistant message blocks (with the interrupted marker), live while streaming; compaction calls show summary plus complete raw output.
- **Raw stream** — the lossless per-chunk timeline (time, offset, type, content) from the durable compact stream records, appending live; copy as JSON.
- **Retries** — every retry schedule (ordinal, delay, policy) with its failure code and message, plus each failed attempt's complete raw stream.
- **Tools** — the full tool catalog this request carried (name, description, parameters JSON Schema), copyable.

The toolbar shows the call count, cumulative tokens, a follow-latest toggle, and load-older paging.

## Install

Requires DSH `>= 0.2.0-rc.2`. From the target profile directory (`~/.dsh/profiles/web` unless your launcher says otherwise):

```sh
pnpm add github:yuexusi/dsh-ui-llm-calls
```

Then add the package to the `dsh.profile.bundles` list in the profile's `package.json`:

```json
"dsh": {
  "profile": {
    "bundles": [
      "@deepseek-ai/dsh-base",
      "@deepseek-ai/dsh-web-app",
      "dsh-ui-llm-calls"
    ]
  }
}
```

Restart `dsh web` (or, with `patchReload: "live"` in the manifest, touch the manifest and refresh the page). A **Calls** tab appears beside Chat and Trajectory.

## Data sources

Everything is reconstructed from durable session events: `step/start|end`, `assistant/message` (lossless stream records and usage), `assistant/attempt`, `llm/retry(-started)`, `request/header`, `request/context`, `system/message`, `user/message`, `developer/message`, `tool/result` (surface folding rebuilds the request input), `image/offload`, `compaction/summary`, `session/title-llm-request`, and `session/title`.

## Development

```sh
./build.sh                              # rebuild lib/client.js from src/
./sync.sh                               # rebuild + sync into the profile + live recompose
node test/smoke.mjs <session.jsonl>     # data-layer tests against a real log
node test/render.mjs <session.jsonl>    # render-tree walkthrough of every tab
```

## Known limits

- HTTP wire bytes (headers, API keys) are not recorded by the harness; the Input tab shows the complete logical request the engine assembled, which matches the wire JSON body semantically.
- Replacement events cut by a window boundary are applied tolerantly and the call's input is flagged as possibly incomplete; loading older history fixes it.
- Compaction calls show summary/raw output/usage/model but do not reconstruct their summarization input.
- Live in-flight streams keep at most 20,000 raw records per attempt (with a dropped counter).

## License

[MIT](LICENSE)
