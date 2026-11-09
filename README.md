# lynx-svelte

基于 [sveltejs/svelte#18042](https://github.com/sveltejs/svelte/pull/18042) **Custom Renderers API** 的 Svelte 5 + [Lynx](https://lynxjs.org/) 集成，使用 **Bun Workspaces** 拆分为核心渲染器、运行时辅助、构建脚本与演示应用。

## 上游版本

| 项 | 值 |
| --- | --- |
| svelte 仓库 | `../svelte`（本地合并 PR #18042，`--no-ff` 合并提交 `Merge sveltejs/svelte#18042: custom renderers API`） |
| PR 分支 | `sveltejs/svelte:refs/pull/18042/head` |
| Svelte 版本 | `5.57.3` |
| 渲染器 API | `svelte/renderer` 的 `createRenderer`（19 个方法） |
| 编译器开关 | `experimental.customRenderer` |

## 目录结构

```text
lynx-svelte/
├── pkg/
│   ├── core/      @lynx-svelte/core    渲染器、节点树、事件、页面生命周期
│   ├── helper/    @lynx-svelte/helper  样式/类名/transform/事件纯函数
│   └── script/    @lynx-svelte/script  Rspack 配置、Lepus 降级、主线程标记、二维码
├── demo/          Svelte 演示应用（Todo / 动态样式 / 列表）
└── test/          bun test：渲染器单测、编译器测试、端到端挂载测试
```

渲染器契约（PR #18042）与 Lynx PAPI 的对应关系：

| Renderer | Lynx |
| --- | --- |
| `createFragment` | 纯 JS Fragment，插入时展开子节点 |
| `createElement` | `__CreateView/__CreateScrollView/__CreateText/__CreateImage/__CreateList/__CreateElement` |
| `createTextNode` | `__CreateRawText` |
| `createComment` | `__CreateNonElement`（包装为可携带 `before` 的占位节点） |
| `setAttribute` | `__SetInlineStyles/__SetClasses/__SetID/__AddDataset/__SetAttribute` |
| `addEventListener` | `__AddEvent`（`bind`/`catch`/`capture-*`/`global-bind` + worklet） |
| `insert/remove/getParent/...` | 本地有序子树 + `__InsertElementBefore/__RemoveElement` |

## 快速开始

```bash
# 1. 构建合并了 PR #18042 的 svelte
cd ../svelte && bun x pnpm install
cd packages/svelte && bun x rollup -c && bun scripts/process-messages && bun scripts/generate-types.js && bun scripts/check-treeshakeability.js

# 2. 安装 lynx-svelte 依赖
cd ../../../lynx-svelte && bun i

# 3. 单元测试与端到端测试
bun test

# 4. 构建 Lynx 演示包
cd demo && bun run build     # 输出 demo/dist/main.lynx.bundle

# 5. 生成调试二维码（可选）
bun ../pkg/script/bin/qrGen.js --port 8080

# 6. Lynx Web 运行时端到端验证（无需 Explorer）
cd .. && bun run test:web
```

> `bun x` 用于拉取/执行外部包或二进制；项目脚本请使用 `bun run test:web`。

> 上游 `svelte` monorepo 以 pnpm workspace 定义，因此依赖安装通过 `bun x pnpm install` 调用；构建、测试、演示、Web 验证等其余命令全部由 Bun 执行。

`pkg/script/bin/bundleBuild.js` 直接调用 `@rspack/core`，不依赖 `@rspack/cli`/dev-server，构建体积更小、启动更快。

Web 验证会构建 `demo/dist/main.web.bundle`，启动 `demo/webServe.js`，用本机 Chrome 加载 `@lynx-js/web-core` 运行时，检查首屏渲染、Todo 勾选/删除、List 行选择、Tab 切换、计数器点击，并输出 `demo/dist/web-smoke.png` 截图。

用 Lynx Explorer 扫描二维码加载 `main.lynx.bundle`，或手动输入
`http://<局域网地址>:8080/main.lynx.bundle?fullscreen=true`。

## 设计要点

- `experimental.customRenderer` 在 `svelte-loader` 中全局配置为 `@lynx-svelte/core/renderer`，因此组件无需逐个写 `<svelte:options customRenderer>`。
- 组件编译产物会 `import $renderer from '@lynx-svelte/core/renderer'` 并执行 `$.push_renderer($renderer)`；`pageMount` 同时向 `mount(..., { renderer })` 传入渲染器，保证挂载根节点也走 Lynx PAPI。
- `nodeType` 返回字符串 `fragment/element/text/comment`（Svelte 内部映射为 DOM 节点常量）。
- `@lynx-svelte/helper` 对标 `vue-native-helper`：提供 `styleBind/classBind/transformParse/transformParseCss/propMerge/styleMerge/classMerge/propHandle/eventWrap` 等纯函数。
- 所有 PAPI 访问都是运行时 `globalThis` 查找，便于在 Bun 测试中用 `test/mockPapi.js` 替换。
- 自研 JS 遵循 `../js.md`：无 `class`、箭头函数、合并 `const`、`snake_case` 变量、`_li` 列表后缀、常量枚举。

## 跨平台应用与 CI

`app/` 使用字节官方 Lynx 应用框架：**Lynxtron** 承载 macOS/Windows/Linux 桌面端，**Sparkling** 承载 Android/iOS。两者直接加载原生 `main.lynx.bundle`，不经过浏览器内核包装。所有构建流程拆分在 `tool/`，公共逻辑位于 `tool/common.js`、`tool/webBuild.js`、`tool/sparklingEnsure.js`。

```bash
bun run site:build       # dist/web + dist/lynx-svelte-web.zip（可部署静态站点）
bun run desktop:build    # Lynxtron 桌面安装包；--target=mac|win|linux 可指定
bun run android:build    # Sparkling Android APK（debug 签名，可直接安装）
bun run ios:build        # Sparkling iOS 模拟器 App（未签名）
```

GitHub Actions `.github/workflows/appBuild.yml`：

- `workflow_dispatch` 或推送 `v*` tag 触发。
- 复用 `.github/actions/setup/action.yml`：checkout `sveltejs/svelte`、合并 PR #18042、Bun 构建、依赖缓存。
- `web` 任务构建站点并部署 GitHub Pages；`desktop` 矩阵用 Lynxtron 构建 macOS/Windows/Linux；`android`/`ios` 用 Sparkling 官方脚手架生成原生壳并注入 Svelte 产物。
- 所有平台产物上传为 Actions artifact；tag 构建自动创建 GitHub Release 附带全部可下载文件。
- Action 使用当前稳定大版本：`actions/checkout@v7`、`actions/cache@v6`、`actions/upload-artifact@v7`、`actions/configure-pages@v6`、`actions/upload-pages-artifact@v5`、`actions/deploy-pages@v5`、`actions/setup-java@v6`、`android-actions/setup-android@v4`、`ruby/setup-ruby@v1`、`softprops/action-gh-release@v3`、`oven-sh/setup-bun@v2`。

> iOS 产物为模拟器 App，真机 IPA 需要开发者证书与 provisioning profile；签名密钥未放入仓库。Android 产物为 debug APK，Release 签名可在同一脚本中接入。

## 已知限制

- Custom Renderer 模式下不支持 DOM 专属能力：`<svelte:head>`、`<svelte:window>`、`<svelte:body>`、`bind:value`、`css: 'injected'`、`createRawSnippet`。
- 表单输入用 `onbindinput={inputBind(...)}` 代替 `bind:value`。
- CSS 由 `svelte-loader` 抽取，经 Rspack CSS 实验特性与 Lynx 模板插件打包；复杂选择器/动画能力取决于 Lynx 运行时。
- `Lepus` 兼容插件仅降级 `??=`、`&&=`、`||=`，不处理其他新语法。
- `mainThreadPlugin` 已实现于 `pkg/script/src/mainThreadPlugin.js`。原生构建默认不启用：当前 `@rspack/core` + `@lynx-js/template-webpack-plugin` 原生编码在写入 `lynx:main-thread` 资产标记时会触发 native crash（Node 22/26 均复现）。Web 构建则启用该插件，已验证主线程渲染路径。
- Web 构建使用 `rspackWebConfig`：`mainThreadPlugin()` 将 JS 放入 `lepusCode.root`，`webManifestFallbackPlugin()` 补一个空 manifest 入口，满足 `@lynx-js/web-core` 的主线程渲染路径；该组合已在 Chrome + Lynx Web 运行时验证通过。
- Svelte 作用域样式会为后代选择器生成 `:where(.svelte-xxx)`，Lynx CSS 解析器不支持；演示样式统一使用单类选择器，避免后代选择器。
