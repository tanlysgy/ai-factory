# AI Factory — Release Checklist

> 每次构建前阅读;构建后逐项在浏览器(1440 + 390)验证,全部通过才允许提交/发布。
> 当前基线:P7.6 Product Polish Sprint(目标:84 → 90+,只修真实部署 Bug)。

## 构建前

- [ ] `pnpm test` 全绿(基线:77 pass)
- [ ] `pnpm build` 无错误(允许既有 `texture-btn.png` runtime 警告)
- [ ] 只改目标页面/组件;不触碰 experiment 业务、radar 引擎、部署配置
- [ ] 无新增依赖 / 数据库 / 登录 / analytics / 外部 API

## 设计 Token 一致性

- [ ] H1 Home = 112px, H1 Page = 96px, H1 Tool = 44px(±clamp 断点)
- [ ] H2 = 48px / weight 500;统计数字 = 44px / `font-variant-numeric: tabular-nums`
- [ ] 页尾 section 节奏统一 112px(hero 75/84、70/78 可保留)
- [ ] chip 字号 = 11px(`--text-mono-label`),按钮 CTA = 46px
- [ ] focus-visible 全站可见(`--focus-ring`),深浅主题各一色

## 桌面 1440

- [ ] Hero 首屏完整,无横向滚动(`scrollWidth == innerWidth`)
- [ ] 导航 sticky + 毛玻璃生效;4 个 demo 站桌面无 MENU 按钮(断点外隐藏)
- [ ] Lumina:Hero / 搜索框 / 答案卡同左缘(`220px`)
- [ ] Factory:Create Task 荧光绿底墨字;H1/H2/数字 token 达标

## 移动 390

- [ ] 无横向滚动:Home / Factory / Radar / 4 个 demo 站(`scrollWidth == innerWidth`)
- [ ] 抽屉:全屏(100dvh)、背景不透明、MENU 与 CLOSE 不重叠、链接可点
- [ ] 抽屉:Escape 关闭、aria-expanded 切换、scroll lock(`html.drawer-open { overflow: hidden }`)
- [ ] Factory 统计带 2×2、数字 36px
- [ ] Ledger 看板可横滚(3 列 200px,`board-scroll` overflow-x: auto)
- [ ] Relay JSON 代码块折行,无水平滚动条(`pre-wrap` + `overflow-wrap: anywhere`)

## 内容/可访问性

- [ ] Radar "From signal to decision." 无缺空格
- [ ] 所有导航链接可达(Home / Command Center / Radar / demo 站页面锚点)
- [ ] 按钮/链接有 hover + focus 反馈;reduced-motion 降级存在

## 提交

- [ ] `.codegraph/`、`.v2c/` 不提交
- [ ] 截图存 `references/p7.6/`
- [ ] commit message 标注 P7.6 与修改范围

## 发布后

- [ ] GitHub Actions build + deploy 成功
- [ ] 生产 URL `https://ai-factory.sgyyyds.qzz.io/` 返回 200
- [ ] 生产抽查:移动抽屉打开正常(HOME / FACTORY)

## Launch Kit (P9)

- [ ] `pnpm launch:create <slug>` 生成完整 kit(截图 5 张 + OG/Banner/Thumbnail + copy + metadata + checklist)
- [ ] 截图互不相同(md5 或像素 diff),feature/pricing 锚点真实存在
- [ ] `metadata.json` 含 `preview_url`(从 factory state 填充)
- [ ] `pnpm factory:state:sync` 后 `/factory/` Recent Launches 显示新 kit(1440 + 390 无横向滚动)
- [ ] Launch 文案含 Demo 披露;不伪造用户;OG/Banner/Thumbnail 本地 PIL 生成
