# lynx-svelte

基于 [sveltejs/svelte#18042](https://github.com/sveltejs/svelte/pull/18042) **Custom Renderers API** 的 Svelte 5 + [Lynx](https://lynxjs.org/) 集成。

项目用 **Bun Workspaces** 拆分为核心渲染器、运行时辅助、构建脚本和演示应用，并提供 Lynxtron 桌面端、Sparkling Android/iOS、Web 静态站点三条构建链路。

## 技术栈

| 项 | 值 |
| --- | --- |
| Svelte | `5.57.3`，本地合并 PR #18042 |
| 渲染器 API | `svelte/renderer` 的 `createRenderer`，19 个方法 |
| 编译器开关 | `experimental.customRenderer` |
| 原生打包 | `@rspack/core` 2.x + `@lynx-js/template-webpack-plugin` |
| Web 运行时 | `@lynx-js/web-core` |
| 桌面端 | `@lynx-js/lynxtron` + `lynxtron-builder` |
| 移动端 | `sparkling-app-cli` 生成的 Sparkling 工程 |
| 包管理/运行 | Bun |

## 目录结构

```text
lynx-svelte/
├── pkg/
│   ├── core/      @lynx-svelte/core    渲染器、节点树、属性、事件、页面生命周期
│   ├── helper/    @lynx-svelte/helper  样式/类名/transform/属性合并/事件包装
│   └── script/    @lynx-svelte/script  Rspack 配置、Lepus 降级、主线程脚本、二维码
├── demo/          Svelte 演示应用（Todo / 动态样式 / 列表 / 响应式布局）
├── app/
│   └── lynxtron/  Lynxtron 桌面壳
├── tool/          各平台构建脚本、CI 准备脚本、静态站点模板
├── test/          bun test 单测、端到端测试、Web smoke
└── dist/          构建产物（git 忽略）
```

`app/sparkling/`、`app/lynxtron/node_modules/`、`app/lynxtron/dist/` 由构建脚本生成，不提交。

## 环境要求

- Bun `1.4+`
- Node.js `22+`（Lynxtron 运行时要求）
- Git
- macOS 桌面构建需要 Xcode Command Line Tools
- Android 构建需要 JDK 17 + Android SDK
- iOS 构建需要 macOS、Xcode、CocoaPods
- Web smoke 需要本机安装 Chrome

## 初始化

`lynx-svelte` 默认通过本地路径引用合并后的 Svelte：

```json
"svelte": "file:../svelte/packages/svelte"
```

因此首次使用需要让 `lynx-svelte` 和 `svelte` 处于同级目录：

```bash
git clone <lynx-svelte 仓库> lynx-svelte
git clone <svelte 仓库> svelte
cd lynx-svelte
bun run ci:prepare
```

`ci:prepare` 会执行 `tool/prepare.js`：

1. 检查 `../svelte` 是否存在
2. 拉取并合并 `pull/18042/head`
3. 构建 Svelte 包
4. 安装 `lynx-svelte` 依赖

如果本地已经准备好合并后的 Svelte，可以直接：

```bash
bun install
```

手动构建 Svelte 的命令：

```bash
cd ../svelte
bun x pnpm install
cd packages/svelte
bun x rollup -c
bun scripts/process-messages
bun scripts/generate-types.js
bun scripts/check-treeshakeability.js
```

## 常用命令

所有命令都在 `lynx-svelte` 根目录执行。

| 命令 | 作用 |
| --- | --- |
| `bun test` | 运行单元测试和渲染器端到端测试 |
| `bun run test:web` | 构建 Web bundle，启动本地服务，用 Chrome 做运行时 smoke |
| `bun run demo:build` | 构建原生 Lynx 演示包 |
| `bun run demo:dev` | 生成二维码并构建原生包 |
| `bun run site:build` | 构建可部署的 Web 静态站点和 zip |
| `bun run desktop:build --target=mac` | 构建 Lynxtron 桌面安装包，可选 `mac/win/linux` |
| `bun run android:build` | 生成 Sparkling Android debug APK |
| `bun run ios:build` | 生成 Sparkling iOS 模拟器 App |
| `bun run ci:prepare` | CI/首次初始化：合并 Svelte PR 并构建 |

### 原生 Lynx 包

```bash
bun run demo:build
# 输出：demo/dist/main.lynx.bundle
```

本地调试：

```bash
bun run demo:dev
```

或手动生成二维码：

```bash
bun pkg/script/bin/qrGen.js --port 8080
```

用 Lynx Explorer 扫描二维码，或访问：

```text
http://<局域网地址>:8080/main.lynx.bundle?fullscreen=true
```

### Web 站点

```bash
bun run site:build
# 输出：
# dist/web/
# dist/lynx-svelte-web.zip
```

直接运行 Web smoke：

```bash
bun run test:web
```

它会：

1. 构建 `demo/dist/main.web.bundle`
2. 启动 `demo/webServe.js`
3. 用 Playwright + 本机 Chrome 加载 `@lynx-js/web-core`
4. 检查首屏、Todo、Tab、List、计数器
5. 截图到 `demo/dist/web-smoke.png`

### 桌面端

```bash
# 当前平台
bun run desktop:build

# 指定平台
bun run desktop:build --target=mac
bun run desktop:build --target=win
bun run desktop:build --target=linux
```

输出：

```text
dist/desktop/
├── LynxSvelte-...-darwin-*.dmg
├── LynxSvelte-...-darwin-*.zip
├── LynxSvelte-...-win-x64.exe
└── LynxSvelte-...-linux-*.AppImage / .deb
```

脚本会：

1. 构建 `demo/dist/main.lynx.bundle`
2. 复制到 `app/lynxtron/`
3. 安装并准备 Lynxtron 运行时
4. 用 rsbuild 构建主进程
5. 用 `lynxtron-builder` 打包

macOS 本地默认跳过签名；Release 签名需要配置开发者证书。

### Android

```bash
bun run android:build
# 输出：dist/android/lynx-svelte-android.apk
```

需要 JDK 17 和 Android SDK。脚本通过 `sparklingEnsure()` 生成/复用 Sparkling 工程，构建 demo 后把 `main.lynx.bundle` 注入原生 assets，再执行 Gradle `assembleDebug`。

### iOS

```bash
bun run ios:build
# 输出：dist/ios/lynx-svelte-ios-simulator.zip
```

需要 macOS、Xcode、CocoaPods。产物是**未签名模拟器 App**；真机 IPA 需要开发者证书和 provisioning profile。

## 构建实现说明

### 渲染器映射

| Renderer | Lynx PAPI |
| --- | --- |
| `createFragment` | 纯 JS Fragment，插入时展开子节点 |
| `createElement` | `__CreateView/__CreateScrollView/__CreateText/__CreateImage/__CreateList/__CreateElement` |
| `createTextNode` | `__CreateRawText` |
| `createComment` | `__CreateNonElement` |
| `setAttribute` | `__SetInlineStyles/__SetClasses/__SetID/__AddDataset/__SetAttribute` |
| `addEventListener` | `__AddEvent` |
| `insert/remove/getParent/...` | 本地子树 + `__InsertElementBefore/__RemoveElement` |

### 原生构建

`pkg/script/src/rspackConfig.js` 的原生配置：

- 入口 `main-thread` 放 Svelte 应用，由 `mainThreadPlugin` 标记为 Lynx 主线程脚本
- 入口 `main` 放一个空背景模块，`moduleWrapPlugin` 把它包装成 `{ init }` 加载器
- Svelte 产物经 SWC 降到 ES2015，避免 Lepus 编码器处理私有字段时崩溃
- CSS 在 Rspack 2 中显式配置 `{ test: /\.css$/, type: 'css/auto' }`

### Web 构建

`rspackWebConfig` 使用 `LynxTemplatePlugin + WebEncodePlugin` 生成 `main.web.bundle`。主线程入口与应用入口分离，`WebEncodePlugin` 负责把主线程代码和背景代码编码到 Web 运行时需要的 section 中。

### 响应式演示

`demo/src/App.svelte` 用运行时宽度切换布局：

- `>= 720px`：wide，头部横排、Tab 单行、内边距更大
- `520px - 720px`：medium，Tab 自动铺满
- `<= 520px`：narrow，头部竖排居中、Logo/标题缩小
- 页面最大宽度 `1080px`，超过后左右自动居中

宽度来源：Web 用 `window.innerWidth + resize`，原生用 `SystemInfo.pixelWidth / pixelRatio` 兜底。样式使用元素自身类名，避免 Lynx 不支持的后代选择器。

## 测试

```bash
bun test
```

覆盖：

- `@lynx-svelte/helper` 样式/类名/transform/事件纯函数
- 渲染器节点操作
- 页面挂载/卸载端到端
- Svelte 编译器 `customRenderer`
- Lepus 兼容降级
- workspace 与构建配置

## CI 与发布

`.github/workflows/appBuild.yml`：

- `workflow_dispatch` 或 `v*` tag 触发
- 复用 `.github/actions/setup/action.yml`
- `web`：构建站点并部署 GitHub Pages
- `desktop`：macOS/Windows/Linux 三平台矩阵
- `android`：JDK 17 + Android SDK，输出 APK
- `ios`：macOS + Ruby + CocoaPods，输出模拟器 App
- tag 构建自动创建 GitHub Release 并附带全部产物

## 已知限制

- Custom Renderer 模式不支持 DOM 专属能力：`<svelte:head>`、`<svelte:window>`、`<svelte:body>`、`bind:value`、`css: 'injected'`、`createRawSnippet`。
- 表单输入使用 `onbindinput={inputBind(...)}`，不要用 `bind:value`。
- Svelte 作用域样式会生成 `:where(.svelte-xxx)`；Lynx CSS 不支持后代选择器，演示样式统一使用单类选择器。
- `Lepus` 兼容插件只降级 `??=`、`&&=`、`||=`，不处理全部新语法。
- 桌面端本地只在 macOS 验证过 dmg/zip；Windows/Linux 由 CI 矩阵验证。
- Android/iOS 需要本地 SDK/Xcode，未在无 SDK 环境构建。
- `svelte` 依赖目前是 `file:../svelte/packages/svelte`。GitHub git 依赖不能直接指向 monorepo 的 `packages/svelte` 子目录；如需远程安装，需要单独的 package 分支或 npm 包。
