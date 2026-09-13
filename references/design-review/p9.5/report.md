# P9.5 — Independent Visual QA（独立视觉验收）

- 基线：`0414084`（p9: production launch kit verification screenshots）
- 审计对象：生产 /factory/、Codeflare demo（Quick Tunnel 存活，HTTP 200，真实浏览器打开）、launch/codeflare 全部资产
- 环境：Desktop 1440×1000 + Mobile 390×844；全部数值来自 `getComputedStyle` / `getBoundingClientRect` 实测
- 证据：本目录（factory-desktop/mobile/full、codeflare-desktop/mobile/pricing/drawer、og/banner/thumbnail、issues/）

## Overall Score

**83 / 100**

| 维度 | 得分 |
|---|---:|
| A. Factory UI | 21/25 |
| B. Demo Product (Codeflare) | 21/25 |
| C. Launch Assets | 19/25 |
| D. Mobile | 13/15 |
| E. Brand / Product Matrix | 9/10 |

---

## A. Factory UI — 21/25

实测确认（生产环境）：H1 **96px / -4.8px / 800**（P7.6 补丁已上线）、六个 H2 全部 **48px / 500**、统计数字 **tabular-nums**、状态 chip 圆点 + 10px mono、导航 79px sticky 毛玻璃、**移动抽屉已修复**（全屏 844px 实心深色底，链接清晰，见 issues/factory-drawer-fixed-pass.png）。

新版 Mission Runtime 六区块（01 Mission Queue / 02 Recently Done / 03 Preview Links / 04 Launch Kit / 05 Memory Loop / 06 Mission CLI）编号节奏统一，任务卡（agent、标题、60% 进度条、3/5 steps、时间戳）是全站信息密度最健康的卡片设计。Memory Loop（1521px，12 文件 + lessons）内容真实可信。

扣分：公开页面携带 4 个 trycloudflare 隧道链接（见 P1-01）；Mission CLI 区仍无任何可点击按钮（全页只有 mono 命令文案）；chip 10px 低于 spec 的 11px；整页 5448px 长页缺少区块内锚点导航。

## B. Demo Product (Codeflare) — 21/25

隧道站实测（非截图复看）：H1 72px/-3.24/760，导航完整（Agent/Playground/Pricing/Changelog/Log in/Download），**Playground 终端可交互**，Pricing 三档（Free/$20 Pro 高亮 "MOST POPULAR"/Custom），CTA 44px/radius 10/品牌紫 #8A5CF6，无横向溢出，footer 完整。

"像收费产品还是 AI 生成的 demo？"——**前者**。理由：可玩的终端（不是截图贴图）、changelog 有具体日期与 commit 语义、定价卡有对比叙事（token 计费说明）、品牌紫贯穿 logo/按钮/高亮而非装饰性渐变。残留扣分：Custom 档卡片明显单薄于另两档；客户 logo 行仍是文字型 wordmark（完成度高但可辨是占位语法）；可访问名 "CCodeflare" 首字母重复。

## C. Launch Assets — 19/25

尺寸全部精确：og-image 1200×630（55KB）、social-banner 1600×900（87KB）、thumbnail 800×450（26KB）。

- **OG**：logo 左上 + "SHIP SOFTWARE FASTER" 大标题 + 终端代码卡 + 紫色 CTA 芯片，层级与留白达到 Resend/Vercel 级；**但左下角烘焙了隧道域名** `guy-billing-routine-reply.trycloudflare.com`（P0，见 issues/P0-01）。缩略到社交 feed ~500px 宽时标题与终端卡仍然可读。
- **Banner**：代码 + 标题 + CTA 的 1600×900 构图成立；用的是虚构品牌域 `codeflare.dev` —— 与 OG 的隧道域名**互相矛盾**（同一产品两套域名叙事）。
- **Thumbnail**：居中标题 + 副标 + 终端图标，200px 缩略下标题仍可辨，合格。

## D. Mobile — 13/15

Factory：2×2 统计带、任务卡信息完整、无溢出、抽屉全屏实底。Codeflare：Menu 按钮 + 全屏深色抽屉（44px 级触达目标）、CTA 堆叠不换行、无溢出。两站移动端都达到"敢发推特"水平。扣分：Factory 任务卡进度条与时间戳在 375px 下一行内略挤；Codeflare hero 终端区在 390 下需滑动才能看到 Play 按钮（首屏只到 CTA）。

## E. Brand / Product Matrix — 9/10

Codeflare（深底 + 紫 + 圆角 10）与 AI Factory（米白 + 墨绿 + 荧光绿 + 直角）是两套完整独立的身份，同时通过 mono 眉标、编号区块、诚实文案共享"同一双手"的 DNA——产品矩阵关系成立，不像贴牌。/factory/ 的 Preview Links + Launch Kit 把 demo 纳入工厂叙事，矩阵感是 p8/p9 最成功的结构性提升。

---

## 问题清单

### P0（发布阻塞）

```
Priority:   P0
Page:       launch/codeflare/og-image.png（社交分享卡）
Element:    左下角域名文案
Observed:   烘焙了临时隧道域名 "guy-billing-routine-reply.trycloudflare.com"
Expected:   稳定品牌域或生产域（codeflare.dev / ai-factory.sgyyyds.qzz.io/sites/codeflare/）
Evidence:   issues/P0-01-og-tunnel-url.png
Fix:        OG/banner 生成器禁止注入 preview_url；改用 metadata.canonical_url 字段，缺失时回退工厂生产域
```

### P1（明显降低专业度）

```
Priority:   P1
Page:       /factory/（生产）
Element:    03 Preview Links + 04 Launch Kit 卡片主链接
Observed:   4 个不同的 *.trycloudflare.com 隧道作为主 "Preview ↗"；隧道轮换后整排 404
Expected:   生产域 /sites/<slug>/ 为主链接，隧道降级为带 TTL 标注的次要链接
Evidence:   issues/P1-01-factory-tunnel-links.png
Fix:        卡片组件交换主/次链接顺序；隧道链接加 "TEMP" 徽标与创建时间
```

```
Priority:   P1
Page:       launch/codeflare/（资产一致性）
Element:    og-image vs social-banner 域名
Observed:   OG 用隧道域，banner 用 codeflare.dev，thumbnail 无域——三件套两套域名叙事
Expected:   一个产品一个 canonical domain，三件套同源
Evidence:   og-image.png 左下 vs social-banner.png 右下
Fix:        launch:create 管线增加 domain 一致性校验（一个字段驱动全部资产）
```

```
Priority:   P1
Page:       /factory/
Element:    06 Mission CLI 区
Observed:   整页 5448px 无一个真实按钮，任务创建引导只有 mono 命令文案
Expected:   至少一个可点击 CTA（"View mission docs" 或 "Create first mission"）
Evidence:   factory-full.png 第 5 屏
Fix:        CLI 区末尾加 46px 按钮（深色页用荧光绿底墨字）
```

### P2（细节优化）

```
Priority:   P2 ｜ Page: /factory/ ｜ Element: StatusChip
Observed: 10px mono（spec 11px）｜ Expected: 11px ｜ Evidence: DOM 实测 ｜ Fix: 组件字号 +1px

Priority:   P2 ｜ Page: Codeflare ｜ Element: logo 可访问名
Observed: "CCodeflare"（字形 C + 文字拼接重复）｜ Expected: "Codeflare" ｜ Evidence: DOM ｜ Fix: 图形 span 加 aria-hidden

Priority:   P2 ｜ Page: Codeflare ｜ Element: Pricing Custom 档
Observed: 卡片高度/内容明显薄于另两档 ｜ Expected: 等高 + 至少两行权益 ｜ Evidence: codeflare-pricing.png ｜ Fix: 补 "SLA / dedicated support / on-prem" 权益行

Priority:   P2 ｜ Page: /factory/ ｜ Element: Memory Loop 区
Observed: 1521px 单区块堆 12 文件 + 全部 lessons ｜ Expected: 折叠或 tab 化 ｜ Evidence: factory-full.png ｜ Fix: 文件列表默认收起 3 行 + "SHOW ALL 12"

Priority:   P2 ｜ Page: /factory/ ｜ Element: 长页导航
Observed: 5448px 无锚点目录 ｜ Expected: 右侧 mono 小节索引或 sticky 区块切换 ｜ Evidence: factory-full.png ｜ Fix: 01-06 编号做成页内锚点导航
```

## 与优秀参考的比较（仅评维度，不评"像谁"）

- Hierarchy：Factory 六区块 + Codeflare hero/pricing 的层级都达到标准（接近 Linear 的 section 纪律）。
- Rhythm / Density：Factory 密度高但有序；Memory Loop 是唯一超载点。Codeflare 密度舒适。
- Typography：96/48 双档 + 72 档 demo 大字都成立；chip 10px 是唯一低于阈值的文本。
- Interaction：终端可玩、抽屉顺滑、进度条有动效——超出同类 landing 平均水准。
- Polish：OG/banner 构图达标；域名烘焙与隧道链接是"最后 5% 的不专业"。

## Visual System Lessons

1. **最成功的视觉模式**：编号区块（01/02/03…）+ mono 眉标 + 圆点状态 chip 的"指挥中心语法"；以及 demo 侧"可交互终端作为 hero"——把产品证据放进首屏。
2. **最失败的视觉模式**：把运行时状态（隧道 URL）烘焙进静态资产与公开卡片——一次性基础设施泄漏进永久性物料。
3. **下一批默认复用**：实验工具页模板、SectionHeader 眉标、StatusChip、移动 MENU 全屏抽屉（现已两站验证）、OG 卡构图（logo/标题/产品截图卡/CTA 芯片）。
4. **下一批避免**：资产内出现 preview_url；居中 H1 页面（破坏左对齐语言）；两种米白底并存；文字型客户 logo 直接裸排。
5. **值得进 `.agent/design-dna/`**：(a) "静态资产只允许 canonical domain"；(b) "隧道/预览链接必须带 TTL 标注且不得作为主链接"。这两条跨页面成立、已造成实际问题、规则化后明显提质。
6. **不应固化**：Codeflare 的圆角 10/品牌紫（产品特例）；Memory Loop 的密度（内容驱动）；Pricing 三档结构（产品决策）。

## Design DNA 修改建议

仅建议**新增一个文件** `.agent/design-dna/launch-assets.md`，内容为上述 5-(a)(b) 两条规则 + OG/banner/thumbnail 的构图基线（当前三件套的构图值得固化）。其余不动机。
