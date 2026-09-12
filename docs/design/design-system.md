# AI Factory — Design System

> 全站设计体系(P7.5)。任何新页面、实验、模板、站点都必须继承本系统,不得逐页发明新的视觉语言。

## 来源

- P7A Visual Director Top 20 Design Review(`references/design-review/`)
- 对标:Linear / Raycast / Stripe / Cursor / Resend
- 设计 DNA(可执行规范):`.agent/design-dna/`

## Token

单一来源:`src/styles/design-system.css`(经 `src/styles/global.css` 全局导入)。

| 分组 | Token 示例 | 值 |
| --- | --- | --- |
| Color | `--color-ink` / `--color-cream` / `--color-acid` | #173B32 / #F4F5EF / #B9D957 |
| Color (dark) | `--color-ink-strong` / `--color-line-dark` | #0D1512 / #274031 |
| Color (states) | `--color-warn` / `--color-danger` | #C89431 / #D98A6F |
| Typography | `--text-h1-home` / `--text-h1-page` / `--text-h1-tool` | 112 / 96 / 44 px |
| Typography | `--text-h2` / `--text-h3` / `--text-mono-label` | 48 / 22 / 11 px |
| Spacing | `--space-16/24/40/64/96/112` | 16→112px 梯度 |
| Component | `--button-h` / `--card-pad` / `--nav-h` | 46 / 22 / 78 px |
| Motion | `--duration-enter` / `--ease-out` / `--stagger` | 500ms / cubic-bezier(0.22,1,0.36,1) / 60ms |

规则:

- 浅色页背景只能是 Cream;深色页背景只能是 #0D1512。禁止再出现 #315A4C 第二绿、violet #6D28D9、shadcn 圆角卡片。
- H1 字距恒为 -0.04em(首页)/ -0.05em(内页),禁止 -0.07em 以下的粘连。
- section 节奏:浅色 112px、密集/深色 96px;ticker/band 例外使用 28/31。
- 图标/状态只用 8px 圆点 + 11px mono 大写标签,禁止 emoji 状态符。

## Components

- `src/components/design/Button.astro` — 46px 直角按钮,primary(墨绿)/secondary(描边)/dark(荧光绿底墨字),hover translate(-2px,-2px) + 4px 硬阴影
- `src/components/design/StatusChip.astro` — 圆点 + mono 标签,live/shipped/rejected/queued/warn/error
- `src/components/design/SectionHeader.astro` — eyebrow + H2 + 可选 aside
- `src/components/design/Card.astro` — 1px 边框直角卡片,featured 双线
- `src/components/design/Divider.astro` — 1px 线
- `src/components/design/Navigation.astro` — 吸顶毛玻璃;Desktop mono 链接;Mobile <640px 换成 MENU 按钮 + 全屏抽屉(Escape/点击关闭),light/dark 主题
- `src/components/design/Footer.astro` — mono meta + hover 下划线

全部组件:keyboard-friendly、focus-visible(2px ink / acid)、mobile-first。

## 接入清单

已接入共享 Navigation/Footer:

- `/`(home)、`/factory/`(dark)、`/radar/`
- `/experiments/*`:seo-checker、ai-ready-check、cost-reduction、site-intelligence、ai-visibility

实验页皮肤:

- seo-checker / ai-ready-check / cost-reduction:完成紫罗兰 → 工厂换肤(body Cream、墨绿按钮、直角、状态圆点、进度条工厂色)
- radar:honesty 面板 #315A4C → #173B32,H1 → 96px/-0.05em
- factory:body 增加 `data-theme="dark"`,正确命中深色 focus/chip token

模板面(`sites/templates/`):

- `saas-landing` / `ai-tool-landing` / `seo-tool` / `dashboard`:根变量全部换成工厂 token(墨绿/奶油/酸性绿、直角、46px 按钮、112/96 节奏)
- `saas-landing` / `ai-tool-landing` / `seo-tool`:新增移动端 MENU 全屏抽屉(与主站同模式)

## Future websites must inherit this system

任何新站点/模板必须做到:

1. `styles.css` 的 `:root` 使用本系统的变量名与值(或从 `design-system.css` 导入)。
2. 页面底色 `--color-cream`(或深色 `--color-ink-strong`),不得另造色板。
3. 按钮 46px 直角;链接 hover 下划线 offset 4px;focus-visible 2px 描边。
4. 移动端 390px 无横向溢出;导航 <640px 使用导航组件或同款抽屉。
5. 状态表示用 dot + mono label。
6. 提交前跑 `pnpm test` + `pnpm build`,再浏览器验证 1440/390 并截图入 `references/design-system/`。

## Verification (P7.5)

- Desktop 1440:全站页面 nav/focus/CTA/card 正常,无横向溢出。
- Mobile 390:全站页面 MENU 抽屉可开可关(Escape 生效),clientW == scrollW。
- 截图:`references/design-system/{home,factory,radar,seo,ready}-{desktop,mobile}.png` + `before-seo-checker.png`(换肤前)。
- `pnpm test`:77 pass / 0 fail
- `pnpm build`:success

## 未做(留给下一轮)

- Showcase 磁贴 16:10 比例与 hover 统一
- Demo 站占位资产(logo SVG / 字母块头像)
- Ledger 移动表格降级
- 数字计数动画(prefers-reduced-motion)
