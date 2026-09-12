# Factory (Command Center) Review — `/factory/`

> 审查环境：Desktop 1440×900 + Mobile 390×844。
> 基调判定：深色 #0D1512 + 荧光绿 + mono —— 指挥中心美学，方向正确，是一套"Linear dark dashboard"的骨架。

## 视觉评分（100）

| 维度 | 得分 | 一句话判断 |
|---|---|---|
| Hero | 80 | "AI FACTORY / COMMAND CENTER" 双行大字成立，104px 气势足 |
| Typography | 82 | 深色底上对比度好，但 H2 用 700 与主站 H2 用 400 体系打架 |
| Spacing | 74 | Task Queue 区有明显的"空仓感"，留白没有承载信息 |
| Color System | 86 | 深底+荧光绿统一，状态色语义清晰 |
| Navigation | 72 | 沿用主站导航（static、移动端 9px 问题同源） |
| CTA | 70 | "Create Task" 存在感弱，作为指挥中心主操作应该更凶 |
| Card Design | 80 | 边框卡片 + mono 表头语言统一 |
| Interaction | 76 | 状态文案语义好，但都是纯文本，缺组件化反馈 |
| Mobile Experience | 72 | 无溢出，但长表在窄屏挤压 |
| **综合** | **78** | |

## 逐屏问题

### 第 1 屏 — Hero + 统计带
- ✅ 双行 H1（104px/800/-7.28px）在深底上冲击力好；"SIGNAL / BUILD / LEARN" 三个 mono 标签构成系统感。
- ❌ **统计数字（46px/700/Inter）没有用 tabular-nums。** "13" 和 "6/6" 等数字混排时基线跳动。
- ⚠️ 统计数字与标签（10px mono）之间尺寸跳跃 4.6 倍，标签可以到 11px + letter-spacing 0.08em。

### 第 2 屏 — Task Queue
- ❌ **空队列的"虚"。** 队列只有 3 行骨架行，行高 ~100px + 大内距，右侧 "Status meanings" 图例框占掉 1/3 宽度——整屏显得空旷而非"忙碌的指挥中心"。空状态应该是一个明确的组件（图标 + "Queue is empty. Create the first task." + CTA），而不是稀疏的表格。
- ❌ **状态是纯文本 mono（QUEUED/DONE），不是组件。** 应统一为 homepage-review 建议的"8px 圆点 + 11px mono"chip。
- ⚠️ 表格列头 10px mono 全大写 OK，但行内主文字 14px 与列头之间缺中间层级。

### 第 3 屏 — History
- ✅ 三张历史卡的状态语义（REJECTED 用降透明度表达"否决"）是全站最聪明的细节之一。
- ⚠️ 卡片标题 16px 偏小，与正文 14px 差距不足。

### 第 4 屏 — Live + Research
- ❌ **深色底上的长文段落不可扫读。** 实验 2×2 卡内正文 13-14px mono/无衬线混排、行宽 ~640px（>75ch），在 #0D1512 底上是耐力测试。
- ⚠️ Radar 嵌入面板与实验卡之间只有 1px 边框区分，层级需要背景色差（面板底 #111A16 vs 卡底透明）。

### 第 5 屏 — Loops
- ✅ 三个循环统计卡 + 教训卡（LESSON）的信息设计好，"13 → 6/6 → 4 LESSONS" 叙事清晰。
- ⚠️ 教训卡正文 13px mono 在深底偏小，升到 14px 或换无衬线。

### 第 6 屏 — How work moves
- ✅ 步骤条收尾与首页 How it works 呼应，系统一致。
- ⚠️ 底部与 footer 衔接处 padding 突变。

### Mobile 390
- ❌ 继承主站导航 9px 链接 + 不吸顶问题。
- ⚠️ 统计带四卡两列布局在 375px 下内距被压缩，数字 46px 与标签换行后挤压。
- ⚠️ Task Queue 表格在窄屏变单列卡片后，列头信息丢失（AGE/SIZE 折进正文），可接受但 AGE mono 时间戳换行难看。

## 对标

**主对标：Linear（Projects/Issues 视图）＋ Raycast（dev-tool dark）。Cursor 的 command-center 叙事。**
- 接近 Linear：深底 1px 边框卡、mono 元数据、状态语义化。
- 不像的地方：Linear 的空状态是设计过的插画/文案组件，本页空队列是"没设计"；Linear 表格行 hover 有背景反馈，本页行悬停无反应。
- 接近 Raycast：荧光绿点缀、terminal 气质。
- 不像的地方：Raycast 的数字统计都有动效（计数上滚），本页数字是静态的——指挥中心应该"活着"。

## 修改建议（可执行）

1. 空队列改为显式空状态组件：**128px 高度居中块**，mono 图标 + "Queue is empty" 16px + "Create Task" 次级按钮；图例框移到区块底部一行。
2. 状态 chip 组件化（同 homepage-review #4），Task Queue/History/Loops 三处复用。
3. 统计数字加 `font-variant-numeric: tabular-nums`，字号 46→**44px**，标签 10→**11px / ls 0.08em**。
4. H2 体系与主站对齐：Command Center 的 H2 从 **50px/700 改为 48px/500**（主站 H2 是 400，深色页可以到 500，但 700 太重）。
5. 实验/教训卡正文统一 **14px 无衬线**（mono 只留给标签与代码），行宽 `max-width: 60ch`。
6. 卡片 hover：背景从透明 → `rgba(216,242,110,0.04)`，transition 120ms。
7. "Create Task" CTA：改荧光绿底 + 墨字（当前墨绿底在深色页存在感不够），高度 46px、字 13px。
8. 统计数字入场加计数动画（800ms ease-out）， honoring `prefers-reduced-motion`。
9. Radar 嵌入面板底色 `#111A16`，与卡片拉开一级层级。
10. 移动端统计带改为 **2×2**，卡片内距 16px，数字 36px。
