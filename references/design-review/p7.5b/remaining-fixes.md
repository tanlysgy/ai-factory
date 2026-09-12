# P7.5B — 剩余问题清单

> 全部为浏览器实测（1440 + 390）确认的开放问题，按影响排序。前四条有截图证据，其余有 DOM 数值证据。

## P0 — 破损体验（用户会立刻看到）

### 1. 主站移动抽屉打开态穿帮
- 证据：`.nav-drawer` 实测 `height: 66px`（首页）/ `37px`（Factory 深色页），应为全屏。bg #F4F5EF 与 z-index 50 都正确，唯独高度塌陷。
- 症状：抽屉链接（Home / Command Center / Radar）悬浮叠在页面 H1 与正文之上，Factory 深色页上白字叠白字几乎不可读；顶部 MENU 与 CLOSE 标签重叠渲染（深色页）。
- 功能层正常：aria-expanded 切换、CLOSE 点击收起（实测 drawer height → 0）、Escape 处理器存在。

### 2. 四个 Demo 移动端导航死亡
- 证据：390 宽度下 `header` 内 button 数量 = 0，Agent/Playground/Pricing 等 5 类链接全部 `width: 0` 隐藏，四站一致。
- `aa7f1d2` 声称模板层已加 MENU 抽屉——实际未落到任何一站。移动用户唯一可去的是主 CTA。

## P1 — 系统一致性欠账

### 3. Factory H1 未接 tokens
104px/-7.28px（P7-A 旧值）→ 应为 96px/-4.8px。三页中唯一漏网。

### 4. Section 节奏页尾漂移
首页 `96/112, 104/104, 112/125`、Radar `70/78, 105/105, 100/100` 离群。tokens 有 112 档但未贯穿页尾区块。

### 5. Factory H2 / 数字旧值
H2 50px/700（应 48/500）；统计数字 46px、`font-variant-numeric: normal`（应 tabular-nums + 800ms 计数动画）、390 下四格单行应改 2×2。

### 6. Lumina 双容器错位
眉标/H1 左缘 x=303 vs 搜索框/答案卡左缘 x=212，同屏两套栅格。

## P2 — 打磨项

### 7. Radar 缺空格文本："From signalto decision."（屏读损）
### 8. Demo 假 logo 行与 testimonial 头像仍为纯文本占位（Codeflare 最显眼）
### 9. Relay 移动端 JSON 代码块横向滚动条（建议收窄示例值或折行）
### 10. Ledger 移动端看板列压缩（列头信息丢失，无横滚容器）
### 11. 实验结果区无入场动效（design-dna motion spec 已定义未实施）
### 12. Factory "Create Task" 深色页存在感弱（未改荧光绿底）
### 13. chip 字号 10px vs spec 11px（1px 差，顺手修）
### 14. cost-reduction 页不在本次范围（commit 称已换肤，建议下轮顺手验收）

---

# P7.6 Patch List

| Priority | File | Fix | ETA |
| -------- | ---- | --- | --- |
| P0 | src/components/design/Navigation.astro | 抽屉面板高度 66px/37px → `height: 100dvh`（或 `min-height: 100%`），确保覆盖导航行、无透明叠底 | 30 min |
| P0 | src/components/design/Navigation.astro | 修复打开态 MENU/CLOSE 标签重叠（expanded 时隐藏 "Menu+" label），深色页复测 | 15 min |
| P0 | sites/templates/{saas-landing,ai-tool-landing,seo-tool,dashboard}/index.html + styles.css + app.js | 四个 demo 模板真正接入移动 MENU 全屏抽屉（声称已做未落地），复用主站抽屉交互与 Escape 关闭 | 60 min |
| P0 | src/pages/factory.astro（或其样式块） | H1 104px/-7.28px → 96px/-4.8px，接入内页 H1 档位 token | 10 min |
| P1 | src/styles/design-system.css + 各页 section 样式 | 页尾 section padding 归一 112（清理 96/104/105/100/125 五个漂移值；hero 区 75/84、70/78 可保留） | 25 min |
| P1 | src/pages/factory.astro | H2 50/700 → 48/500；统计数字加 `tabular-nums` + 800ms 计数动画（包 prefers-reduced-motion） | 25 min |
| P1 | src/pages/factory.astro（移动样式） | 统计带 390 下 4 格单行 → 2×2，数字 46→36px | 15 min |
| P1 | src/pages/sites/lumina-answers（模板样式） | 眉标/H1 容器与搜索框容器左缘统一（x=303 vs x=212 两套栅格合一） | 15 min |
| P1 | src/pages/radar.astro | "From signal<br>to decision" 补空格（改 `From signal <br/>`），三处同类文本一并检查 | 5 min |
| P2 | src/components/design/StatusChip.astro | chip 字号 10 → 11px（对齐 spec） | 5 min |
| P2 | sites/templates/*/app.js + assets | 假 logo 行与 testimonial 头像 → 单色 wordmark SVG + 圆形字母块资产池 | 30 min |
| P2 | sites/relay-mail styles | 移动端 JSON 示例值缩短或 `white-space: pre-wrap`，去掉横向滚动条 | 10 min |
| P2 | sites/ai-ledger styles | 看板外包 `overflow-x: auto`，首列 sticky | 15 min |
| P2 | src/components/design/Card.astro + 实验结果区 | 结果卡入场 stagger（60ms 延迟，12px 上移淡入，reduced-motion 降级） | 20 min |
| P2 | src/pages/factory.astro | "Create Task" 墨绿底 → 荧光绿底墨字（深色页主操作存在感） | 10 min |

**合计 ≈ 4.5 小时。** 前 4 条（P0）完成后，A 项可从 36/40 → 39/40，C 项 16/20 → 19/20。
