# P7.5B — 产品质感验收（B 项 · 30 分）

> 问题：现在像不像真正会收费的 SaaS？（对标 Linear / Raycast / Stripe / Cursor / Resend）
> 结论：**24 / 30 —— "可以收费"的门槛已过，距离"敢收费"还差三口气。**

## 总评

P7.5 之前，AI Factory 讲"高质量网站工厂"的故事时有一个明显破绽：自己的实验页是 shadcn 默认脸。这个破绽在 `aa7f1d2` 里被彻底补上了——现在从首页进入任何一个实验工具，米白 + 墨绿 + mono + 直角的语言完全连续，**第一次有"同一家公司做的产品"的感觉**。这是本轮质感提升最大的一件事。

对标逐项：

| 对标 | 像的地方 | 还不像的地方 |
|---|---|---|
| Linear | 深色 Command Center 的边框卡 + mono 元数据 + 状态语义 | Linear 的每个可交互元素有 hover/focus 反馈层；本站抽屉打开态直接穿帮，行级 hover 反馈仍未见 |
| Stripe | 奶油/墨绿交替的 section 节奏、字体纪律 | Stripe 的 section 间距是数学（全部 112 的倍数）；本站页尾仍有 96/104/105/100/125 五种漂移值 |
| Raycast | 荧光绿点缀、terminal 气质、工具页的克制 | Raycast 的数字有计数动效、状态有过渡；本站统计数字静态（tabular-nums 也未开） |
| Cursor | Codeflare demo 的终端 playground 可真用 | （demo 层面达标） |
| Resend | 实验工具页"表单即页面"的极简 | Resend 的结果区有入场动效；本站结果一次性弹出 |

## 三口"气"差在哪

1. **破损状态比缺少状态更伤质感。** 移动端抽屉打开后链接悬浮叠在正文上（主站两页实测均复现，深色页更严重），顶部 MENU/CLOSE 两个标签重叠。收费产品可以没有花哨动效，但不能有穿帮。
2. **数据的"活"感缺失。** Command Center 定位是"指挥中心"，但 46px 的统计数字是静态的、非 tabular-nums（`font-variant-numeric: normal` 实测）。Raycast/Linear 的 dashboard 数字至少滚动进场。
3. **停留反馈层仍薄。** 本轮没有验证到统一的行 hover / focus-visible 视觉（commit 声称已加 focus-visible，抽查未逐页验证；建议下一位在补丁后用 Tab 键巡检一遍）。

## 各页质感分

| 页面 | P7-A | P7.5B | 说明 |
|---|---|---|---|
| `/` | 77 | 82 | 吸顶导航 + 46px 按钮系统 + chip 组件，首屏完整度显著提升 |
| `/factory/` | 78 | 81 | 真实任务数据填充了空队列的"虚"；但 H1/H2/数字三项旧值未接 tokens |
| `/radar/` | 76 | 82 | 双绿修复后明暗交替节奏成立，是全站最"Stripe"的一页 |
| experiments 均 | 56 | 79 | 002/003 换肤是本轮最大单项提升（42 → 79） |
| demos 均 | 79 | 81 | tokens 渗入 eyebrow/badge 的 mono 语言，桌面质感微升；移动导航倒退 |
