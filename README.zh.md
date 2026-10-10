# dsh-ui-llm-calls

DSH Web 客户端的「调用」视图插件：在对话页的「对话 / 轨迹」旁新增第三个标签页，
按模型调用展示完整的 AI 请求过程。纯客户端投影，从会话持久化事件重建，
历史会话同样可见，零额外存储开销。

## 功能

每次模型调用一张卡片（普通步骤 / 压缩摘要 / 会话标题生成），点击展开详情：

- **概览**：状态、提供方/模型、请求参数（thinking、reasoningEffort、temperature、
  maxTokens、stop、上下文窗口）、计时（开始/完成/总时长/首字延迟/解码耗时/输出速度）、
  token 用量（输入/缓存读/缓存写/输出/思考/总计）、失败原因。
- **输入消息**：该次请求发给模型的完整输入消息数组，逐条折叠展开（角色徽标、来源、
  内容块：文本/思考/图片/文件/工具调用/工具结果），可切换整块原始 JSON，一键复制。
  压缩后的请求正确显示摘要替换（系统提示词保留、被压缩区间折叠为摘要消息）。
- **输出**：结算后的助手消息内容块（含被打断的标记），可复制消息 JSON；
  压缩调用显示摘要与完整原始输出；生成中时实时显示已到达的内容块。
- **原始流**：无损的逐 chunk 时间线（时间、偏移、类型、内容），来自持久化的紧凑
  流记录，可复制流 JSON；生成中时实时追加。
- **重试**：每次重试的调度（序号/延迟/策略）与失败原因（错误码+消息）、失败尝试的
  完整原始流。
- **工具**：该请求携带的完整工具清单（名称、说明、参数 JSON Schema），可复制。

顶部工具栏：调用总数、累计 token、跟随最新开关、加载更早历史。
历史按需加载（宿主 `loadOlder` 分页），列表每页 200 张卡片。

## 数据来源

会话日志中的持久化事件：`step/start|end`、`assistant/message`（含无损流记录与用量）、
`assistant/attempt`、`llm/retry(-started)`、`request/header`、`request/context`、
`system/message`、`user/message`、`developer/message`、`tool/result`（surface 折叠重建
输入）、`image/offload`（图片卸载标记）、`compaction/summary`、
`session/title-llm-request`、`session/title`。

## 文件结构

- `src/01-09*.js` — 按序拼接的手工 bundle 源码（`build.sh` 生成 `lib/client.js`）
- `lib/index.js` — 宿主侧空插件入口
- `cordis.patch.yml` — 组合条目（`- insert: llm-calls`）
- `test/smoke.mjs` — 真实会话日志驱动定义与快照构建器的冒烟测试
- `test/render.mjs` — 全部标签页的渲染树走查测试
- `build.sh` — 拼接 + 语法检查
- `sync.sh` — 重建并同步进 profile，触发运行中宿主的 live 重组

## 开发与更新

```sh
./build.sh          # 重建 lib/client.js
./sync.sh           # 同步到 web profile 并触发 HMR 重组（改完后浏览器刷新即可）
node test/smoke.mjs /tmp/session-sample.jsonl   # 数据层测试
node test/render.mjs /tmp/session-sample.jsonl  # 渲染层测试
```

## 安装（其他机器）

要求 DSH `>= 0.2.0-rc.2`。在目标 profile 目录（默认 `~/.dsh/profiles/web`）执行：

```sh
pnpm add github:yuexusi/dsh-ui-llm-calls
```

然后把包名加进 profile `package.json` 的 `dsh.profile.bundles` 列表：

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

重启 `dsh web`（若 manifest 里 `patchReload: "live"`，touch 一下 manifest 后刷新页面即可），
「对话 / 轨迹」旁就会出现「调用」标签。

本机开发位置：`/home/xusi/dsh-plugins/dsh-ui-llm-calls`（profile 依赖指向本地 `file:` 路径）。
profile 使用 hoisted linker，更新后必须 `sync.sh` 同步，否则 node_modules 里是旧拷贝。

## 已知限制

- 未记录 HTTP 层原文（请求头/API Key 不落盘）；「输入消息」是引擎装配发给模型的
  完整逻辑输入，与 wire JSON 语义一致。
- 窗口边界截断的替换事件按容错策略就近插入，并把该调用的输入标记为「可能不完整」；
  点「加载更早」即可补全。
- 压缩调用不重建其输入区间（显示摘要、原始输出、用量与模型）。
- 实时流记录有 20000 条保险上限（超出部分丢弃并提示）。
