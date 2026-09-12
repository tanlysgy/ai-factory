# Demand Radar Review — `/radar/`

> 审查环境：Desktop 1440×900 + Mobile 390×844。
> 基调判定：回到米白+墨绿的双色 section 交替，与首页同宗。"研究产品"的定位用 Perplexity 式的克制呈现。

## 视觉评分（100）

| 维度 | 得分 | 一句话判断 |
|---|---|---|
| Hero | 80 | "DEMAND / RADAR" 双行 108px 有力，右上 mono 元数据构成仪器感 |
| Typography | 78 | H1 108/-7.56 与首页 126/-9.45 同族但不同值，体系漂移 |
| Spacing | 78 | section 节奏好，机会卡内部上下密度不均 |
| Color System | 76 | 两个深绿并存（#173B32 vs #315A4C），最刺眼的不一致 |
| Navigation | 70 | 同主站（static、移动端 9px） |
| CTA | 74 | "View the evidence" 等文字链接清楚，主 CTA 缺席 |
| Card Design | 80 | 机会大卡是全站最复杂的组件，完成度高 |
| Interaction | 72 | 无 hover 状态；信号列表是静态的 |
| Mobile Experience | 76 | 无溢出（实测 375=375），大卡堆叠自然 |
| **综合** | **76** | |

## 逐屏问题

### 第 1 屏 — Hero
- ✅ H1 双行 108px/800 + 右上 "SCAN 047 / HORIZON 90D" mono 仪器面板，气质准确。
- ❌ **H1 与首页 H1 不同规格**（108 vs 126，字距 -7.56 vs -9.45）。内页 H1 应该是同一系统里的档位（如 96px/-5.76 = -0.06em 统一规则），现在是"各自调的"。
- ⚠️ Hero 深绿 stamp 面板 #173B32 高 350px，内文偏少，上下留白不均。

### 第 2 屏 — 01 Opportunity（机会大卡）
- ✅ 信号列表 + 右侧 evidence 计数条的信息架构是全站最好的产品设计。
- ❌ **度量数字 40px mono 与标签 10px 之间 4 倍跳跃**，且四组度量在卡底一行排开时标签被压到换行。
- ⚠️ 信号行 hover 无反馈；evidence 条形无数值标注。

### 第 3 屏 — 02 From signal to decision（深色方法面板）
- ✅ #173B32 深绿面板 + 浅字 52px H2，与首页 Demand Radar 面板同色，一致。
- ⚠️ 四步流程的编号圆点是纯文本，与整体边框语言不符。

### 第 4 屏 — 03 Research becomes real（实验表）
- ❌ **表格无表头悬停/斑马纹，长表扫读困难**；行高不足（<48px），mono 混排挤。
- ⚠️ 与首页 Live Experiments 卡片重复表达了同样的四个实验，信息重复但没有交叉链接。

### 第 5 屏 — 04 A decision system, not a dashboard（honesty 面板）
- ❌ **本屏背景是 #315A4C，第 3 屏是 #173B32。** 同页两个深绿，肉眼看得出"不是同一个绿"。这是本页最高优先级修复。
- ⚠️ 面板高度 386px 内只有一段宣言 + 链接，密度低于其他屏。

### Mobile 390
- ✅ 实测无横向溢出；H1 堆叠、机会卡转纵向都自然。
- ⚠️ 机会卡底部四组度量在 375px 下变成 2×2 但字号未降（40px），与上方正文抢视觉。
- ⚠️ 实验表在移动端未做横向滚动容器，列被压缩换行（建议首列+状态列保留，其余 `display:none` 或横滚）。

## 对标

**主对标：Perplexity（研究产品的克制）＋ Stripe（奶油/深绿交替节奏）。**
- 接近 Stripe：section 明暗交替、52px H2 的节奏感。
- 不像的地方：Stripe 的深色 section 全站只有一种深色，本页出现两种绿；Stripe 表格有统一的行高与 hover。
- 接近 Perplexity：把"研究过程"产品化的叙事。
- 不像的地方：Perplexity 的引用/证据是可交互的（hover 出处），本页 evidence 条是装饰性的静态元素。

## 修改建议（可执行）

1. **#315A4C → #173B32**（honesty 面板改为与 02/首页一致的墨绿），一处变量替换。
2. H1 统一为体系档位：首页 112px、内页 **96px**，字距统一 **-0.05em**（96px 时 = -4.8px）。
3. 机会卡度量：数值 40→**34px**、标签 10→**11px / ls 0.08em**，四组改 **2×2 网格**（移动端自然继承）。
4. evidence 条加数值标注（条右侧 11px mono 计数）。
5. 信号行 hover：背景 `rgba(23,59,50,0.04)` + 左侧 2px 墨绿指示条。
6. 实验表：行高 ≥**52px**，`tr:hover` 背景 `rgba(23,59,50,0.03)`，表头 sticky 在卡片内滚动。
7. 03 表格每行加 "EXP 00X" 链接到对应实验页，与首页卡片信息打通。
8. 流程编号圆点改为 **24px 方形边框块**（呼应全局直角语言）内 12px mono 数字。
9. 移动端实验表：外层 `overflow-x: auto` + 首列 sticky。
10. 页面缺主 CTA：honesty 面板后加一条全宽 CTA 带（"See what the factory shipped →" 指向 /factory/）。
