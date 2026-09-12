# Homepage Review — `/`

> 审查环境：Desktop 1440×900 + Mobile 390×844，真实浏览器逐屏截图。
> 设计基调判定：米白纸感（#F4F5EF）+ 墨绿（#173B32）+ 荧光黄绿 + JetBrains Mono 标签 —— 编辑式新粗野主义（Editorial Brutalism）。这是一个**有身份的设计系统**，底子很好，问题在执行精度。

## 视觉评分（100）

| 维度 | 得分 | 一句话判断 |
|---|---|---|
| Hero | 82 | 大字排版有冲击力，但 -9.45px 字距让字形互相碰撞 |
| Typography | 78 | 126/52/14 三级骨架清晰，H1 与正文之间缺一个中间层级 |
| Spacing | 80 | 主体 112px 节奏好，但有 96/104/75 三个离群值 |
| Color System | 88 | 全站最强的资产，奶油+墨绿+荧光绿克制且高级 |
| Navigation | 70 | 不吸顶；移动端 9px 链接不可读 |
| CTA | 72 | 主按钮存在感够，但 hover 无反馈、字太小 |
| Card Design | 78 | 边框卡片语言统一，Experiments 卡内部层级偏平 |
| Interaction | 74 | 入场动画有，但停留态（hover/focus）几乎缺席 |
| Mobile Experience | 72 | 无横向溢出，但导航塌陷、CTA 行折行尴尬 |
| **综合** | **77** | |

## 逐屏问题

### 第 1 屏 — Hero
- ❌ **H1 字距过紧造成字形碰撞。** 实测 H1 126px / weight 800 / letter-spacing **-9.45px**（-0.075em）。首字母 "A" 与 "FACTORY" 的 "F" 视觉上粘在一起，灰底上一坨黑。对标 Linear/Vercel 的 hero 大字通常在 -0.03em ~ -0.045em。
- ❌ **H1 到副文案之间没有视觉呼吸。** 副标题 18px 紧贴 126px 巨字，尺寸跳跃太大（126→18，中间空缺 30-48px 档位）。
- ⚠️ 右侧 "01 OPPORTUNITY → 07 SUSTAIN" mono 列表是好想法，但行高不均，与左侧大字的基线网格无关，像贴上去的。
- ✅ 深绿 "hero-stamp" 面板 + 荧光绿标签的颜色使用很成熟。

### 第 2 屏 — How AI Factory Works
- ❌ **Section 间距离群。** 实测各 section padding：75/84（hero）、28/31（ticker）、112/112、112/112、**96/112**、**104/104**。节奏在页尾开始漂移。
- ⚠️ 三步骤卡片的连接箭头是纯文本 "→"，与卡片的 1px 边框语言相比显得随意。
- ⚠️ 步骤卡内部：mono 序号 13px / 标题 17px / 正文 14px，标题与正文只差 3px，扫读时标题不跳。

### 第 3 屏 — Live Experiments
- ❌ **状态 chip 不统一。** 003 卡是"绿点 + LIVE"，其他卡是纯文本 "SHIPPED"——同一行的四种状态呈现两种组件形态。
- ⚠️ 卡片标题 20px vs 正文 14px/1.6：标题应该升到 22-24px 或正文降到 13px，拉开层级。
- ⚠️ 四张卡高度不一致（内容长度导致），底部对齐被破坏。

### 第 4 屏 — AI Factory Showcase
- ❌ **四个 demo 磁贴视觉重量失衡。** Ledger 有深色看板缩略、Lumina 是浅色对话卡、Codeflare 深色终端、Relay 米色邮件——各自为政时缺少统一的"相框"约束（同一 padding、同一缩略图比例 16:10、同一 hover 行为）。
- ⚠️ 磁贴无 hover 反馈，不知道可点。

### 第 5 屏 — Demand Radar
- ✅ 深绿面板 + 荧光绿数据的对比是全页最好的一屏。
- ⚠️ 面板内 H2 52px 在深色底上用了浅色文字，OK；但该面板绿是 #173B32，而 Radar 页第 4 屏用了 #315A4C（见 radar-review.md）——跨页不一致。

### 第 6 屏 — Footer（"The work, as it is."）
- ✅ 大宣言 + 四栏 mono 链接的收尾节奏好。
- ⚠️ 链接 12px mono 无 hover 下划线，悬停死寂。
- ⚠️ Footer 与上一屏（104px padding）之间只有 1px 分隔线，缺少一次"换气"（建议 footer 顶部 padding 96px）。

### Mobile 390
- ❌ **导航塌陷。** 实测：链接字号 **9px**，且 "Command Center" 链接在此宽度直接消失（w=0），"Experiments" 和 "Research system" 还在——一藏两留，行为不一致。9px 已低于可读下限（11px）。
- ❌ **导航不吸顶**（position: static），长页滚动后无路标。
- ⚠️ Hero CTA 两按钮在 375px 宽度下折成两行且宽度不一。
- ⚠️ H1 移动端 59px / -4.4px 表现良好；步骤网格单列堆叠正常。
- ✅ 无横向溢出（scrollWidth = clientWidth = 375）。

## 对标

**主对标：Linear**（section 节奏、产品叙事结构、克制用色）＋ **Stripe**（字体纪律、深浅 section 交替）。
- 接近 Linear 的地方：112px 的 section 呼吸、边框卡片语言、"宣言式" footer。
- 不像的地方：Linear 的每个可交互元素都有 hover/ocus 态，本页停留反馈几乎为零；Linear 的导航吸顶且毛玻璃，本页导航 static。
- 接近 Stripe 的地方：奶油底+墨绿的优雅配色。
- 不像的地方：Stripe 的按钮系统（高度、内距、hover 位移）是全局一致的，本站按钮 46px 高但字只有 12px，头重脚轻。

## 修改建议（可执行）

1. H1 letter-spacing 从 **-9.45px 改为 -5px**（≈-0.04em）；若 "A"+"FACTORY" 是刻意拼合，改为在两个 span 之间加 8px gap 而不是负字距硬贴。
2. 副标题从 18px 升到 **20px**，且与 H1 间距 24px；在 H2(52) 与正文(14) 之间补一个 **28px/500** 的 h3 层级。
3. 全站 section padding 统一 **112px 上下**（当前 75/84/28/31/96/104 六种值 → 归一为 112，ticker 例外保留 28/31 作为紧凑带）。
4. 状态 chip 统一为一个组件：**8px 圆点 + 11px mono 大写标签**，LIVE 用荧光绿点、SHIPPED 用墨点、REJECTED 用 40% 透明度。
5. 主 CTA：字号 12px→**13px**，水平 padding 17px→**22px**，hover 时 `translate(-2px,-2px)` + 4px 硬阴影（贴合粗野主义），transition 150ms。
6. 所有链接/按钮补 focus-visible：**2px 墨绿 outline + 2px offset**。
7. 导航 `position: sticky; top: 0`，背景 `rgba(244,245,239,0.92)` + `backdrop-filter: blur(8px)`，底部 1px 墨色描边。
8. 移动端（<640px）：隐藏全部文字链接，改为 **"MENU" 文字按钮 + 全屏抽屉**（不要汉堡三线，用 mono "MENU" 更贴品牌）。
9. Showcase 磁贴：统一缩略图比例 **16:10**、内距 16px、hover 上移 4px + 边框加深；四张卡强制等高（grid auto-rows）。
10. Footer 链接加 hover `text-decoration: underline; text-underline-offset: 4px`。
