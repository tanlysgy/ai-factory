# Experiments Review — `/experiments/*`

> 审查环境：Desktop 1440×900 + Mobile 390×844，四页全部真实打开。
> **这是全站视觉一致性最严重的灾区：四个实验页存在两套完全不同的设计语言。**

## 总体判定

| 页面 | 主题 | 判定 |
|---|---|---|
| /experiments/site-intelligence/ | 米白+墨绿+荧光绿（工厂体系） | ✅ 在体系内 |
| /experiments/ai-visibility/ | 米白+墨绿+荧光绿（工厂体系） | ✅ 在体系内 |
| /experiments/seo-checker/ | 纯白底+紫罗兰按钮+系统字体+8px圆角 | ❌ 完全脱离体系 |
| /experiments/ai-ready-check/ | 纯白底+紫罗兰按钮+系统字体+8px圆角 | ❌ 完全脱离体系 |

实测 seo-checker：body 背景 `oklch(0.985 0 none)`（近白）、按钮 `oklch(0.511 0.262 276.966)`（≈#6D28D9 紫罗兰）、radius 8px、字体 `-apple-system, ...` 系统栈、H1 48px/600。**这是 shadcn/Tailwind 默认模板的"素颜"**，与工厂的直角、mono、米白、墨绿毫无关系。用户从首页点进这两个实验，等于从一个品牌店走进毛坯房。

---

## 1. site-intelligence（EXP 001）

### 评分
Hero 76 / Typography 78 / Spacing 82 / Color 88 / Nav 70 / CTA 74 / Card 80 / Interaction 78 / Mobile 78 → **综合 78**

### 问题
- ✅ 工具页骨架正确：EXP 001 eyebrow + H1 + 表单卡 + 报告区，米白+墨绿+荧光绿全套在岗。
- ❌ **H1 是一句 18 词的长句**（"Analyze your website for AI visibility and t…"），工具页 H1 应该是产品名式的短语（"Site Intelligence"），长句降级为副标题。
- ⚠️ 表单卡（URL 输入 + Analyze 按钮）是右浮卡，而 004 页是通栏表单——**同为在体系内的两页，表单布局模式也不统一**。
- ⚠️ 报告区的分数环/进度条若为 SVG，无入场动画，结果出现得太"硬"。
- 移动端 ✅ 无溢出，报告卡 2×2 堆叠自然。

### 修改建议
1. H1 改为 "Site Intelligence"，原长句变 18px 副标题。
2. 与 004 统一表单模式：**通栏输入行**（输入框 flex-1 + 按钮不换行），输入框直角、1px 墨绿描边、内距 14px 16px。
3. 报告卡分数数字用 44px mono + tabular-nums，进度条改为分段方块（10 段）呼应直角语言。

---

## 2. ai-ready-check（EXP 003）❌ 重灾区

### 评分
Hero 35 / Typography 40 / Spacing 55 / Color 30 / Nav 40 / CTA 40 / Card 45 / Interaction 55 / Mobile 55 → **综合 42**（作为独立页面及格，作为工厂体系成员 30 以下）

### 问题
- ❌ 白底、紫罗兰主按钮、8px 圆角、系统字体——四重脱轨。
- ❌ 结果区使用 emoji（✅/⚠️）做状态符，工厂体系的状态语言是"圆点+mono 标签"。
- ⚠️ 卡片用 Tailwind 默认灰边（gray-200）+ 白卡，与工厂的墨色 1px 边框 + 米白底不同。
- ⚠️ 移动端无溢出（实测 375=375），布局本身响应式没问题——问题纯在皮肤。

### 修改建议
1. **整体换肤到工厂设计系统**（一次组件级替换，不是微调）：背景 #F4F5EF、正文 #172522、卡片 1px #172522 边框 + 直角、标签 JetBrains Mono 11px 大写。
2. 主按钮：紫罗兰 → **墨绿 #173B32 底 + 米白字**，radius 8→**0**，高度 46px。
3. 状态符：emoji → 8px 圆点（通过=荧光绿/警告=琥珀/失败=红棕）+ 11px mono 标签。
4. H1 字重 600→**700**，字距 -0.03em；或直接套用内页 H1 档位（96px 或工具页 44px 档）。

---

## 3. seo-checker（EXP 002）❌ 重灾区

### 评分
与 ai-ready-check 同构，综合 **42**（同样问题，同源模板）。

### 问题
- ❌ 与 003 完全相同的默认模板皮肤（白底/紫罗兰/8px 圆角/系统字体）。
- ⚠️ 输入行 + 结果卡布局与 003 一模一样，说明两页共用一个模板——**好消息：换肤一次修两页**。

### 修改建议
同 ai-ready-check 全部 4 条。预计同一 PR 内完成。

---

## 4. ai-visibility（EXP 004）

### 评分
Hero 74 / Typography 76 / Spacing 78 / Color 86 / Nav 70 / CTA 74 / Card 78 / Interaction 74 / Mobile 76 → **综合 76**

### 问题
- ✅ 体系内：米白 + 墨绿面板 + 荧光绿数据条。
- ⚠️ 与 001 的表单模式不同（通栏 vs 右浮卡）——两页应二选一统一。
- ⚠️ 结果区引用/来源列表的层级（来源名 vs 引文）靠字重区分不够，来源应该是 11px mono 大写。
- 移动端 ✅ 表现良好。

### 修改建议
1. 与 001 统一表单模式（建议都用通栏）。
2. 来源名统一 11px mono 大写 + 荧光绿下划线 hover。
3. 结果入场用 stagger（每卡延迟 60ms 上移 12px 淡入）。

---

## 对标

**主对标：Resend（工具页的极简表单 + 结果呈现）＋ v0.dev 的工具页结构。**
- 001/004 接近 Resend 的地方：表单即页面、克制配色。
- 002/003 是**反面对标**：它们长得像 "shifcn ui default template" 截图——任何一个 AI 生成的落地页都长这样，等于把"AI Factory 自制感"暴露无遗，直接损害"我们是高质量网站工厂"的主张。**Showcase 页把 Codeflare 等demo 做到了 84 分，而自家实验页 42 分，落差即叙事漏洞。**

## 修复优先级

1. **P0**：002 + 003 换肤（同一模板，一个 PR）。
2. **P1**：001 与 004 表单模式统一为通栏行。
3. **P2**：四页共享一个 `ExperimentLayout.astro`：EXP 00X eyebrow / H1 档 / 副标题 / 通栏表单 / 结果卡网格 / 底部 "EXP 00X → 00Y" 上下页导航。
4. **P2**：结果动效 + 状态组件统一。
