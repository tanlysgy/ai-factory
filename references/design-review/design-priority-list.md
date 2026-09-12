# Design Priority List — Top 20 Visual Fixes

> AI Factory 视觉总监审查结论（P7-A）。审查覆盖：主站 3 页 + 4 实验页 + 4 demo 站，Desktop 1440 与 Mobile 390 真机截图，所有数值均为浏览器实测。
> 实施顺序即排序：先修"叙事漏洞"（一致性），再修"体系精度"（排版/间距），最后修"质感"（动效/微交互）。
> 工时标签：Quick Win ≈ 5 分钟 / Medium ≈ 30 分钟 / Major ≈ 2 小时。

---

# Top 20 Visual Fixes

## 1. 实验 002 + 003 整体换肤到工厂设计系统
**Major（2 小时，两页共用一个模板，一个 PR 修完）**
现状：`/experiments/seo-checker/` 与 `/experiments/ai-ready-check/` 是白底 + 紫罗兰按钮（`oklch(0.511 0.262 277)`≈#6D28D9）+ 8px 圆角 + 系统字体的 shadcn 默认模板。实测 H1 48px/600，与工厂的米白 #F4F5EF / 墨绿 #173B32 / 直角 / mono 体系完全脱节。
修复：背景 #F4F5EF、卡片 1px #172522 直角边框、主按钮墨绿底白字 radius 0 高 46px、emoji 状态符换 8px 圆点 + 11px mono 标签、H1 700/-0.03em。
影响：这是全站唯一的"叙事漏洞"——网站工厂的自家实验页不能是 AI 默认脸。

## 2. Radar 页双绿统一
**Quick Win（5 分钟）**
第 4 屏 honesty 面板 #315A4C → **#173B32**（第 2 屏与首页同款绿）。一处变量替换。

## 3. 移动端导航折叠（全站 + 四 demo）
**Medium（30 分钟 × 主站 1 次 + 模板 1 次）**
现状：375px 下主站导航链接 9px 且 "Command Center" 被隐藏而其余两条还在（行为不一致）；Codeflare 导航直接换行。
修复：<640px 隐藏全部文字链接，改为 mono "MENU" 按钮 + 全屏抽屉；抽屉链接 16px。

## 4. 导航吸顶 + 毛玻璃
**Quick Win（5 分钟）**
`position: sticky; top: 0; background: rgba(244,245,239,0.92); backdrop-filter: blur(8px);` 底部 1px 墨色描边。深色页（/factory/）用 `rgba(13,21,18,0.92)`。

## 5. 首页 H1 字距修正
**Quick Win（5 分钟）**
126px/-9.45px（-0.075em）→ **-5px（-0.04em）**。当前 "A" 与 "FACTORY" 字形碰撞成墨团。

## 6. 统一 H1 体系档位（跨页）
**Medium（30 分钟）**
现状三种 H1 各自为政：首页 126px/-9.45、Radar 108px/-7.56、Factory 104px/-7.28。
修复：首页 112px、内页 **96px**，字距统一 **-0.05em**，weight 800 不变。

## 7. 状态 chip 组件化（全站复用）
**Medium（30 分钟）**
现状：首页实验卡两种状态形态并存；Factory 状态是纯文本；002/003 用 emoji。
修复：一个组件 = **8px 圆点 + 11px mono 大写标签**。LIVE=荧光绿、SHIPPED=墨、REJECTED=40% 透明、QUEUED=空心。

## 8. CTA 按钮系统修正
**Quick Win（5 分钟）**
字号 12→**13px**，水平内距 17→**22px**，高 46px 不变；hover `translate(-2px,-2px)` + 4px 硬阴影（粗野主义正确姿势），transition 150ms。/factory/ 的 "Create Task" 改荧光绿底墨字。

## 9. 全站 focus-visible
**Quick Win（5 分钟）**
所有链接/按钮/输入：`outline: 2px solid #173B32; outline-offset: 2px;`（深色页用荧光绿）。

## 10. 首页 section 间距归一
**Quick Win（5 分钟）**
实测 75/84、28/31、112/112、112/112、96/112、104/104 六档漂移 → 除 ticker（28/31）外统一 **112px**。

## 11. Factory 空队列空状态
**Medium（30 分钟）**
Task Queue 的 3 行骨架行 + 大留白 → 显式空状态组件：128px 居中块 + mono 图标 + "Queue is empty" + 次级 "Create Task" 按钮；图例移到底部单行。

## 12. Factory 统计数字精度
**Quick Win（5 分钟）**
数字加 `font-variant-numeric: tabular-nums`，46→44px；标签 10→11px/ls 0.08em。移动端 2×2、数字 36px。

## 13. Factory H2 减重
**Quick Win（5 分钟）**
50px/700 → **48px/500**（与主站 H2 400 的体系对齐，深色页允许 500）。

## 14. Radar 机会卡度量降档 + 网格化
**Quick Win（5 分钟）**
数值 40→34px、标签 10→11px，四组度量改 2×2 网格（移动端自然继承，解决 375px 挤压）。

## 15. 实验页布局模板统一
**Medium（30 分钟）**
新建 `ExperimentLayout.astro`：EXP 00X eyebrow / 短 H1（长句降为 20px 副标题）/ 通栏表单行（输入 flex-1 + 按钮不换行）/ 结果卡网格 / "EXP 00X → 00Y" 上下页导航。001 的右浮表单卡改通栏。

## 16. Showcase 磁贴等高 + hover
**Medium（30 分钟）**
四 demo 磁贴统一缩略图比例 **16:10**、内距 16px、grid 强制等高；hover 上移 4px + 边框加深 + 150ms。

## 17. Demo 站占位资产升级
**Medium（30 分钟）**
假 logo 行（纯文本）→ 单色 wordmark SVG 资产池（进 `sites/templates/`）；testimonial 头像 → 24px 圆形字母块。

## 18. Ledger 移动端表格降级
**Medium（30 分钟）**
看板表格外包 `overflow-x: auto`，首列 sticky + 底色遮罩；行高 ≥52px（同 Radar 实验表修复）。

## 19. 结果/数据入场动效统一
**Medium（30 分钟）**
统一规格：`translateY(12px)→0 + opacity`，500ms，`cubic-bezier(0.22,1,0.36,1)`，列表 stagger 60ms；Factory 统计数字加 800ms 计数上滚；全部包 `prefers-reduced-motion` 降级。

## 20. Footer 与链接 hover 语言
**Quick Win（5 分钟）**
全站链接 hover：`text-decoration: underline; text-underline-offset: 4px;`（mono 小链接适用）；Footer 顶部 padding 提到 96px 与正文换气；卡片/表格行 hover 背景 `rgba(23,59,50,0.04)`（深色页 `rgba(216,242,110,0.04)`）。

---

## 实施分批建议

| 批次 | 内容 | 预期效果 |
|---|---|---|
| **第 1 批（Quick Win 清算，~45 分钟）** | #2 #4 #5 #9 #10 #12 #13 #14 #20 | 体系精度立刻 +10 分 |
| **第 2 批（一致性，~2.5 小时）** | #1（P0）#7 #15 #3 | 消灭叙事漏洞，实验页 42→75 |
| **第 3 批（质感，~2.5 小时）** | #6 #8 #11 #16 #17 #18 #19 | 全站 77→85+，demo 82→87 |

## 各板块当前/目标分

| 板块 | 当前 | 目标（全部修复后） |
|---|---|---|
| Homepage | 77 | 86 |
| Factory | 78 | 86 |
| Radar | 76 | 85 |
| Experiments（均） | 56（42/76/42/78 严重分化） | 80 |
| Demos（均） | 79 | 87 |
