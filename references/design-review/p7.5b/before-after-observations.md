# P7.5B — Before / After 观察记录

> 对照基线：P7-A 审查（commit `f26d79d` 时的设计状态）→ 本次 P7.5B 验收（commit `aa7f1d2`）。
> 全部为浏览器实测观察，含未修复项的"原地踏步"记录。

## ✅ 真实发生的改变（After 验证通过）

### 1. 实验 002/003 换肤：shadcn 紫脸 → 工厂系统（P7-A #1）
- Before：`oklch(0.511 0.262 277)` 紫罗兰按钮、radius 8px、`-apple-system` 字体栈、emoji 状态符、白底。
- After：米白 #F4F5EF 底、墨绿直角按钮（radius 实测 0）、44px/700 H1、mono 标签、圆点状态、分段进度条、虚线 HONEST NOTE 卡保留但换墨色。
- 验证方式：1440 与 390 双端截图 + DOM 色值采样。**P7-A 的叙事漏洞已闭合。**

### 2. Radar 双绿统一（P7-A #2）
- Before：`#173B32`（hero/method）与 `#315A4C`（honesty）并存。
- After：三个深色面板（hero-stamp / method-section / honesty-section）实测均为 `rgb(23,59,50)`。

### 3. H1 双档位（P7-A #6）
- Before：126 / 108 / 104 三种规格、字距 -9.45/-7.56/-7.28 各自为政。
- After：首页 112/-4.48、Radar 96/-4.8，精确落在 -0.04em/-0.05em。
- 未完：Factory 104/-7.28 原地踏步。

### 4. 吸顶 + 毛玻璃导航（P7-A #4）
- Before：`position: static`，滚动后无路标。
- After：sticky + `rgba(244,245,239,.92)` + `blur(8px)`，深色页同步深色变体。

### 5. 移动端 MENU 按钮（P7-A #3，部分完成）
- Before：9px 链接、Command Center 隐藏而其余可见的不一致行为。
- After：mono "MENU" 边框按钮 + aria-expanded 状态切换 + Escape/CLOSE 收起逻辑。
- 破损：打开态面板高度 66px（Factory 37px），链接悬浮叠在正文上——修了入口，没修房间。

### 6. Button 系统（P7-A #8）
- Before：12px 字、17px 内距、无 hover 位移。
- After：13px / `0 22px` / 46px 高，全站统一。hover 位移未验证（本轮未逐页 hover 测试）。

### 7. Status Chip 组件化（P7-A #7）
- Before：首页两种形态、Factory 纯文本、002/003 emoji。
- After：圆点 + mono 全站一种组件。10px（spec 11px）差 1px。

### 8. 实验页布局统一（P7-A #15）
- Before：001 右浮表单卡 vs 004 通栏，两套模式。
- After：四页统一"短 H1 + 通栏表单行 + EXP 00X 眉标 + 共享 footer"。001 的 H1 从 18 词长句改为 "Site Intelligence" 产品名。

## ⏸️ 原地踏步（P7-A 提出、本轮未动）

| P7-A 编号 | 事项 | 本次实测状态 |
|---|---|---|
| #10 | Section 112 归一 | 页尾仍 96/112、104/104、105/105、100/100、112/125 五种漂移 |
| #12 | Factory 数字 tabular-nums + 移动 2×2 | `font-variant-numeric: normal`，46px；390 下四格单行挤压 |
| #13 | Factory H2 50/700 → 48/500 | 仍 50px/700 |
| #3(demo) | Demo 移动端 MENU 抽屉 | 四站皆无，链接 width=0 |
| #16(Lumina) | 眉标/H1 (x=303) 与搜索框 (x=212) 容器错位 | 未动 |
| #18 | Ledger 移动端看板横向滚动 | 未动（本轮 390 扫描确认无溢出但压缩，看板列宽未验证深滚） |
| #19 | 结果区入场动效 | 未动 |
| #17 | Demo 假 logo/头像占位 | 未动 |

## 🔎 本轮新发现（P7-A 未覆盖）

1. **抽屉打开态破损**（主站两页复现）：`.nav-drawer` 实测 height 66px（浅色页）/ 37px（深色页，且深色页上 MENU 与 CLOSE 标签重叠渲染）。面板 bg/z-index 正确，唯独高度塌了。
2. Factory 顶部导航在 390 宽度下按钮 y=0 顶边贴边（Header 内距与浅色页不一致的观感）。
3. 首页最后一个 section padding-bottom 125px（112+13 的莫名余数）。
4. Radar "From signalto decision." 的 DOM 文本缺空格（P7-A 曾提，仍未修）——屏读读作 "signalto"。
5. 实验页 footer 与共享 Navigation 已统一（EXP 00X · NAME / HOME），信息架构比 P7-A 的孤岛状态好。
