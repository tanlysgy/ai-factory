# Demo Sites Review — `/sites/*`

> 审查环境：Desktop 1440×900 + Mobile 390×844。四站全部真实打开并滚动截图；Codeflare 的 Playground 已实际点击 Send 验证交互。
> 总判定：**这是工厂最亮的资产。** 四站四种性格、各自成立，平均质量高于主站实验页。共性问题集中在移动端导航与占位元素。

---

## 1. Codeflare — `/sites/codeflare/`（AI coding agent）

### 评分
Hero 86 / Typography 82 / Spacing 80 / Color 88 / Nav 78 / CTA 84 / Card 82 / Interaction 86 / Mobile 70 → **综合 82**

### 问题
- ✅ 深色 #0A0F0D + 酸性绿 + mono：dev-tool 气质纯正；Playground 终端窗实拍可用（点击 Send 后流式输出正常，光标闪烁细节在线）。
- ✅ Hero 左文案右终端的分栏、tabs、行号、状态栏，完成度接近真实产品截图。
- ❌ **移动端导航换行**：375px 下 "Docs Pricing Log in" 掉到第二行且与 Logo 打架，无折叠菜单。
- ⚠️ "Backed by" 假 logo 行是纯文字占位（"YCOMBINATOR" 式文本），与两侧精细的终端窗反差大。
- ⚠️ testimonial 卡的头像也是文字占位。

### 修改建议
1. <640px：导航折叠为 "Menu" 按钮 + 全屏抽屉（四站统一模式）。
2. 假 logo 行改为 **单色 wordmark 风格 SVG**（哪怕仍是虚构名），或加 40% 透明度统一处理。
3. testimonial 头像用 24px 圆形字母块（首字母+底色）。

### 对标
**Cursor / Linear。** 接近：终端 demo 的真实感、酸性绿克制使用、mono 元数据。不像：Cursor 的 hero 终端有打字动效，本页静态；Linear 的移动导航完整。

---

## 2. AI Ledger — `/sites/ai-ledger/`（可审计 AI 记账）

### 评分
Hero 82 / Typography 84 / Spacing 78 / Color 84 / Nav 74 / CTA 78 / Card 84 / Interaction 74 / Mobile 72 → **综合 80**

### 问题
- ✅ 衬线 display 大标题 + 米色底 + 藏青面板的 fintech 编辑风，四站里最有"品牌感"的一套。
- ✅ 深色 dashboard mock 的表格/图表细节可信。
- ❌ **移动端看板表格挤压**：375px 下 Ledger board 列宽被压到 11px 字号才塞得下，无横向滚动容器。
- ⚠️ section 间距有 80/96/120 三档漂移（不如主站规律）。
- ⚠️ 信任区（logo 行）与 Codeflare 同样的占位问题。

### 修改建议
1. 表格外包 `overflow-x: auto`，首列 `position: sticky; left:0` + 底色遮罩。
2. section 间距归一 **96px**。
3. 指标卡数字 tabular-nums。

### 对标
**Mercury / Ramp。** 接近：fintech 的克制优雅、衬线+无衬线混排。不像：Mercury 的表格在移动端有明确降级策略。

---

## 3. Relay Mail — `/sites/relay-mail/`（邮件客户端）

### 评分
Hero 80 / Typography 78 / Spacing 78 / Color 82 / Nav 72 / CTA 80 / Card 78 / Interaction 74 / Mobile 76 → **综合 78**

### 问题
- ✅ 暖米底 + 琥珀/橙 accent 的友好工具风，邮件客户端 mock 的三栏收件箱可信。
- ✅ "Request access" 面板的输入+按钮组合干净。
- ❌ Hero H1 三行偏长（每行都在断行边缘），大字排版不如 Codeflare 利落。
- ⚠️ 功能行的图标+文案+边框分隔用得好，但图标是 emoji 风格线条，与其他站的几何图标语言不同（demo 之间允许，但站内要统一——站内是统一的）。
- ⚠️ 移动端请求面板按钮在 375px 换行后高度不一。

### 修改建议
1. H1 砍到两行（删一个修饰从句）。
2. 移动端输入行 `flex` + 按钮不收缩 `flex-shrink:0`。

### 对标
**Resend / HEY。** 接近：Resend 的暖色工具气质、单一 accent 的纪律。不像：HEY 的移动端是完整重排，本页是简单堆叠。

---

## 4. Lumina Answers — `/sites/lumina-answers/`（问答产品）

### 评分
Hero 78 / Typography 76 / Spacing 76 / Color 80 / Nav 70 / CTA 78 / Card 78 / Interaction 76 / Mobile 76 → **综合 77**

### 问题
- ✅ 墨色底 + 奶油对话卡 + 紫罗兰 accent 的问答产品成立；对话流 mock 的问答节奏真实。
- ⚠️ 紫罗兰 accent 与主站实验页的"紫罗兰事故"撞色——demo 内自洽没问题，但**主站 002/003 换肤时应避开紫罗兰，免得和 demo 混淆品牌边界**。
- ⚠️ 示例 question chips 在 1440 下只显示一行会截断，无横向滚动。
- ⚠️ 移动端对话卡的引用块缩进过深，正文行宽被压到 <30ch。

### 修改建议
1. chips 行加 `overflow-x: auto` + `scroll-snap`。
2. 移动端引用块缩进 24→12px。

### 对标
**Perplexity。** 接近：问答流的呈现、来源引用意识。不像：Perplexity 的来源卡可交互，本页是静态示意。

---

## 跨站共性问题（工厂模板层修复）

1. **四站移动端导航都无折叠**（Codeflare 最严重，直接换行）→ 建议进 `sites/templates/` 的共享头组件。
2. **占位 logo/头像质量参差** → 做一套"虚构 wordmark SVG"资产池进模板。
3. **四站的 footer 字号/栏式各异** → 可以各异（品牌独立），但每站内部链接层级要一致：站名 13px mono + 链接 12px。
4. 四站均未验证 `prefers-reduced-motion`（有动效的 Codeflare/Lumina）。

## 一句话

Demo 站是"工厂能力"的直接证据，目前 77-82 分的水平足以支撑 Showcase 叙事；把移动端导航和占位资产修掉后可以到 85+。而实验页 42 分是唯一拖后腿的板块——**修好 002/003 之后，整个工厂的故事才闭环。**
