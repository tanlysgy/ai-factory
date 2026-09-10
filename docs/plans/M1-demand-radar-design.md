# M1 — Demand Radar(需求雷达)设计与架构

> 状态:**DESIGN COMPLETE**(2026-09-10)。本文件是 M1 的唯一设计事实源,供后续 Agent 按阶段实施。
> 本文件只做设计,不做实现。所有"未来要做"的内容以 `Future Requirement` 表记录,本轮一律不实施。

---

## 0. 项目真实状态基线(优先于任何旧规划)

以下为 2026-09-10 实际核对结果(代码 / git 优先于文档):

| Area | Actual Status | Evidence |
|---|---|---|
| M0 自动部署 | Implemented + Verified | `.github/workflows/deploy.yml`;push→Actions→Cloudflare→线上更新 已用可逆标记实测 |
| 技术栈 | Astro 7.3.2(static)+ Tailwind 4 + @astrojs/cloudflare + Wrangler 4 | `package.json` / `astro.config.mjs` / `wrangler.jsonc` |
| src | 仅 Astro 默认 starter(index / Welcome / Layout / global.css) | `git ls-files` + `src/` 遍历 |
| UI / Dashboard / 后端 / Agent / 数据库 / 爬虫 | 全部 **Not present** | 代码中不存在 |
| 规划文档 | 仅 `handoff.md`;无 `docs/` | `find docs` 不存在 |

结论:本设计建立在"几乎空白的新项目"之上,不受任何历史 phantom 系统约束。

---

## 1. M1 Objective

> **第一次让我(人类)能系统性发现值得验证的赚钱机会——用证据,不用直觉,也不用大系统。**

具体交付:

1. 一套 Demand Signal Model:把「需求」拆成 5 类可采集信号。
2. 一套 Demand Radar Pipeline:从 Seed 到 Experiment Candidate 的分步流程,每步标注自动化程度。
3. 一套透明的 Opportunity Score + Confidence + Evidence Coverage(禁止伪精确)。
4. 以 Evidence 为一级公民的数据模型,任何判断可追溯到原始证据。
5. Human-in-the-loop:AI 扩大搜索空间,人做最终下注。
6. Kill Mechanism 与 Opportunity → Experiment 通道。
7. V1 明确「做什么 / 什么人工 / 什么推迟」,本轮不写任何业务代码。

---

## 2. Problem Definition

AI Factory 的真正的核心闭环是个人 AI 副业生产线:

```text
发现需求 → 验证需求 → 选择机会 → 快速实验 → 真实用户 → 真实付费 → 迭代 → 产品化 → 复制成功模式
```

瓶颈不在"开发",而在**发现与验证**:独立开发者通常随机选题,用 3~6 个月开发一个没人需要的产品。Demand Radar 要解决的是:

- **发现难**:互联网信号分散在搜索量、评论、外包订单、竞品定价、支付平台中,散落各处。
- **验证慢**:没有结构,人无法快速判断"这个需求是否值得赌上一周"。
- **证据不可追溯**:AI 一句话"这个有潜力",人无法知道它依据什么。
- **投入成本前置**:往往先建站、再验证,顺序颠倒。

Demand Radar **不解决**的事情(定义边界):

- 不替代人做判断 / 下注 / 承担机会成本。
- 不保证找到"必然赚钱的需求"(没人能保证)。
- 不自动抓取一切数据(永远遵守 API / ToS)。
- 不天生就是 SaaS 产品(它是内部决策系统,不是外部产品;未来是否公开待定)。

---

## 3. Product Principles

1. **不做 AI 黑盒决策器。** 禁止输出「AI → 你应该做 X」。必须是:

```text
互联网数据 → 候选需求 → 多信号验证 → 机会评分 → 证据链 → Top Opportunities → Human Decision → Experiment
```

2. **AI 扩大搜索空间,人负责判断。** AI 的职责:搜索、整理、发现关联、归纳痛点、初步评分、暴露不确定性。人的职责:判断、选择、下注、承担后果。
3. **Evidence 是一等公民。** 宁可保留"原始证据 → AI 解释 → 机会判断"三层,也不要只存 AI 总结。判断必须能被审计。
4. **Score 不许伪精确。** 用 `Score + Confidence + Evidence Coverage` 三元组;低于证据门槛的评分自动降 Confidence。
5. **搜索量 ≠ 商业价值。** 高搜索但零付费意图 = 假信号。
6. **低竞争 ≠ 好机会。** 也可能是没有需求。必须同时看到正向证据。
7. **10 分钟人工 < 3 天自动化。** 每一步先问"多久人工、多久重复";不值得自动化的,V1 一律人工。
8. **Less Infrastructure, More Evidence。** 在本项目一句话原则下:更少基础设施、更多证据;更少自动化、更多学习;更少仪表盘、更多决策;更少搭建、更多验证;更少 AI 权威、更多人判断。

---

## 4. Demand Signal Model

五类信号。每类回答一个核心问题,并给出 V1 采集方式(详见第 6 节数据源矩阵)。

### 4.1 Search Signal(搜索信号)

> 有没有人在主动寻找这个东西?

要素:Google Search / Search Volume / Keyword Difficulty / CPC / Trends / SERP / 长尾 / 多语言 / 新出现关键词。

**红线:搜索量 ≠ 商业价值。** 高搜索但零购买意图、或"DIY 自己修"类关键词,不得自动视为需求。

### 4.2 Money Signal(付费信号)

> 有没有人为类似解决方案付过钱?

要素:Stripe / Paddle / Lemon Squeezy / Dodo 等公开 Checkout、App Store / Play 内购、SaaS Pricing 页、订阅墙、广告投放、Toolify 等公开商业数据。

**红线:推测收入不是实际收入。** 除用户明确购买外,收入一律是估值。任何方案不得依赖破解 / 绕过权限 / 私有接口 / 违规抓取。

### 4.3 Pain Signal(痛苦信号)

> 用户在哪里真实地感受到痛苦?

要素:Reddit / X / Product Hunt / GitHub Issues / App Store 评论 / Chrome Store 评论 / G2 / Capterra / YouTube 评论 / 退款原因。

重点句式:`I wish...` / `Too expensive` / `Doesn't work` / `Please add...` / `Need bulk...` / `Slow` / `Alternative` / `Migration`。

### 4.4 Paid Replacement Signal(付费替代信号)

> 用户是否已经花钱让别人解决这个问题?

要素:Fiverr / Upwork / Freelancer / 咨询 / 外包 / Job Description / 国内服务市场。

重点模式:**重复性人工服务 → 标准化 → 软件化**。这是最容易被验证的"需求确实存在且有钱"的信号。

### 4.5 Competition / Validation Signal(竞争/验证信号)

> 市场是否已被验证,同时我们是否存在切入口?

要素:竞品流量、流量增长、SEO 页面、SERP、价格、Paywall、广告、Backlinks、Reviews、Rating、产品增长。

**双向解读**:有竞品 + 有付费 = 市场验证 ✓(同时找切入口);有竞品但无任何付费信号 = 需警惕是"流量生意"而非"价值生意"。

---

## 5. Demand Radar Pipeline

```text
01 Seed / Root        → 一个具体的人群/场景/痛点起点
02 Keyword Expansion  → 候选关键词、搜索意图、长尾
03 Keyword Metrics    → 搜索量 / 难度 / CPC(知悉即可)
04 SERP Analysis      → 商业意图、竞品形态
05 Competitor Discovery → 谁在赚钱、赚什么
06 Traffic / Growth   → 竞品流量与增长(知悉即可)
07 Pricing / Monetization → 谁在收钱、收多少、如何收
08 Pain Mining        → 用户在骂什么、求什么
09 Opportunity Scoring → 5 信号 → Score + Confidence + Coverage
10 Human Review       → Build / Watch / Reject / Need More Evidence
11 Experiment Candidate → 进入实验
```

**每一步必须回答:自动化程度 + 原因。核心原则:如果人工只要 10 分钟,而自动要 3 天,V1 优先人工。**

| Step | Automation Level(V1) | Reason |
|---|---|---|
| 01 Seed | **Human** | 高判断,人的领域知识;无法替代 |
| 02 Keyword Expansion | **Agent-assisted** | AI 批量产出候选,人选(每周一次,自动化价值中等) |
| 03 Keyword Metrics | **V1 Deferred** | 免费可查(Google Trends / Keyword Planner),人工查;付费 API 不值当 |
| 04 SERP Analysis | **Agent-assisted / Human** | 手动浏览器看前 10 条足够;抓 SERP 有 ToS 风险,不做 |
| 05 Competitor Discovery | **Agent-assisted** | AI 引导找竞品,人验证真实性 |
| 06 Traffic / Growth | **V1 Deferred** | Similarweb/SEMrush 付费才准;V1 靠直觉+少量公开数据即可 |
| 07 Pricing / Monetization | **Agent-assisted(人工浏览竞品页)** | 公开页面人工看,记录 PricingObservation |
| 08 Pain Mining | **Agent-assisted** | AI 聚合候选帖/评论,人读原文确认语境 |
| 09 Opportunity Scoring | **Automatic(公式透明)** | 纯函数、低权威,Score 由证据驱动 |
| 10 Human Review | **Human** | 决策点,不可替代 |
| 11 Experiment | **Human + 极简页面** | 单页实验站/人工服务,见第 11 节 |

> 每周重复几十次的步骤才进入自动化候选。V1 只有 09(评分公式)是纯自动,其余都是"AI 辅助 + 人核实"。

---

## 6. Data Source Strategy

最小完整矩阵。V1 只使用标 `High` 优先的来源,所有高成本/高风险项一律 `Deferred`。

| Signal | Data Source | Access Method | Cost | Reliability | Freshness | Legal / ToS Risk | V1 Priority |
|---|---|---|---|---|---|---|---|
| Search | Google Trends | 官方网页,人工/浏览器 | Free | Medium | Day | Low(手工查询) | **High(手工)** |
| Search | Google Keyword Planner | 官方,需 Google Ads 账号 | Free(In Ads) | High | Month | Low | **High(依据型)** |
| Search | SERP(Google 前 10) | 手动浏览器查看 | Free | High | Day | Low-Med(人工) / 自动化禁止 | **High(人工)** |
| SEO | Similarweb / SEMrush | 付费 API | Paid | High | Month | Low | Deferred |
| SEO | GSC(自有站) | 官方 API | Free | High | Day | Low | Deferred(自有站后才用) |
| Pain | Reddit | 手工浏览 + 官方/public 搜索 | Free | Medium | Hour | Low-Med(手工) / 抓取 High | **High(人工)** |
| Pain | GitHub Issues / API | 官方 API | Free Quota | High | Day | Low | **Medium(辅助)** |
| Pain | X / Twitter | API 付费;手工浏览免费 | Paid / Free | Medium | Hour | Low(手工) / 抓取 High | Deferred |
| Pain | App Store / Chrome Store 评论 | 官方公开页,人工查看 | Free | High | Week | Low(人工) | Medium |
| Pain | G2 / Capterra / Trustpilot | 公开网页人工查看 | Free | Medium | Month | Low(人工) | Medium |
| Money | Stripe / Paddle / LS 公开 Checkout | 公开页面人工查看 | Free | High | Hour | Low(仅浏览) | **High** |
| Money | 竞品 Pricing 页 | 公开网页人工查看 | Free | High | Month | Low | **High** |
| Money | Toolify 等公开榜单 | 公开网页人工查看 | Free | Medium | Month | Low | Medium |
| Paid Replacement | Fiverr / Upwork / 服务市场 | 公开页面人工查看 | Free | Medium | Day | Low(人工) / 自动化 High | **High(人工)** |
| Competition | 竞品网站 / 收录量 / 投放 | 公开网页 + 人工判断 | Free | Medium | Month | Low | Medium |

规则:

- Cost 分级:`Free` / `Free Quota` / `Paid API` / `Manual Browser` / `Deferred`。
- V1 默认所有步骤走 `Manual Browser / Free`,**不买任何数据服务**。
- 自动化抓取任何站点的页面 = 需要先核对 robots.txt / ToS;V1 的默认做法是**人工浏览**,自动化一律 Deferred 并单独过 ToS 审查。

---

## 7. Opportunity Score

### 7.1 维度(8 个,每维 0/1/2 三档)

| 维度 | 0 | 1 | 2 | 反假信号规则 |
|---|---|---|---|---|
| Search Demand | 无搜索证据 | 有长尾/小众搜索 | 搜索+明显商业意图 | 搜索量高但零购买意图 → 封顶 1 分 |
| Money Signal | 未发现付费 | 有部分付费(单笔/个别) | 明确订阅/高价付费 | 推测收入只按"存在付费证据"记分,不算金额 |
| Pain | 无痛点证据 | 有零星抱怨 | 广泛、反复、强情绪痛点 | 只有泛泛负评而无"求方案" → 只给 1 |
| Paid Replacement | 无外包/服务证据 | 有零散服务单 | 大量重复性人工服务 | 高度契合「手工→软件化」模式 |
| Competition Validation | 无竞品(无正证) | 有竞品且验真 | 竞品有付费 + 有切入口 | 无竞品+无付费 = 0(市场不存在),不得因"低竞争"加分 |
| Build Feasibility | 3 个月+ | 1~4 周 MVP | ≤1 周 或 纯整合 | 低估复杂度是高频误判,偏保守 |
| Founder Fit | 不感兴趣/不懂 | 略懂 | 领域熟悉+有渠道 | 个人偏好诚实填,不硬凑 |
| Acquisition | 不知道怎么办 | 有 1 种渠道可能 | 有 1+ 种已验证渠道 | 高竞争 + 高 CPA 行业要扣减 |

### 7.2 计算(透明、可审计)

```text
Score 原始值 = Σ (维度分 × 权重)   # 权重: Money 2, Pain 2,
                                     # Paid Replacement 2, Search 1,
                                     # Competition 1, Build 1, Fit 1, Acquisition 1(共 12 上限)
Score 带标签 = 归一化到 0–100 → 分档:
              0–39  Low(证据不足)
              40–64  Watch(值得观察)
              65–84  Candidate(值得深入)
              85–100 Strong Candidate(进入人类高优先级审查)
```

> 不输出小数。任何"78.3 分"都是伪精确,禁止。

### 7.3 Confidence(三档,而非连续值)

| Confidence | 门槛 |
|---|---|
| High | 证据覆盖 ≥6/8 维;≥3 个独立来源;多数证据 freshness ≤30 天;信号方向一致 |
| Medium | 证据覆盖 4–5/8;2–3 个来源;或有 1 项关键维缺失 |
| Low | 证据覆盖 <4/8;或单来源;或证据 >6 个月;或关键信号互相矛盾 |

规则:

- **证据缺失会封顶 Confidence**:例如 Money 维无证据 → Confidence 强制 ≤ Medium。
- **矛盾信号** → 记录 `conflict` 字段,Confidence 降档,而非"取平均"。
- Confidence 是**对证据的信任**,不是对"这件事一定能成"的信任。两者都必须显式分开写。

### 7.4 Evidence Coverage

```text
Evidence Coverage = (有证据的维度数) / (8)
```

Score 页面必须同时呈现三元组:`Score: 72 (Candidate) | Confidence: Medium | Coverage: 5/8`,并列出**缺失维**。

---

## 8. Evidence Model(一级公民)

> 每个机会必须能回答:"AI 为什么认为它值得做?"—— 答案必须落到可点击的证据条目上。

### 8.1 Evidence 记录字段(V1 必填)

```text
id                    # radar-{yymmdd}-{seq}
opportunity_id        # 归属
source                # 数据源名称
source_type           # search | money | pain | paid_replacement | competition | pricing | distribution
url / reference       # 可点击的原始出处(必须带)
captured_at           # ISO 时间
signal_type           # 同 source_type(便于聚合)
observation           # 原始观察:客观事实,直接引语优先
interpretation        # AI 对这条事实的解读(明确标注是解读)
ai_generated          # true/false —— 凡 AI 生成解读必须标 true
reliability           # L/M/H(来源可信度)
freshness             # recent(≤30d) | dated(≤180d) | stale(>180d)
conflict              # 是否为互相矛盾的证据(可选)
raw_snippet           # 保留原始文字/截图引用(不加工)
```

### 8.2 三层结构(必须保留)

```text
原始证据(raw snippet + url)
    ↓ AI 解读(interpretation,ai_generated: true)
    ↓ 机会判断(最终 score 落到 opportunity 上)
```

审计要求:任何一条 Opportunity 判据都必须在 2 次点击内回到原始出处。

### 8.3 伪证防御

- AI 生成的任何"总结/洞察"必须 `ai_generated: true` 且附原始出处。
- 无出处的 Evidence 不得参与评分(`coverage` 不计)。
- 定期(每季度)抽查 20% 机会,人工核对证据是否存在、是否被曲解。

---

## 9. Data Model

V1 **不加数据库、不建表**,用 git 管理的文件系统作为证据仓库(evidence-as-code):

```text
radar/
├── README.md               # 使用方法:如何开启一次雷达任务
├── seeds/
│   └── seed-001-{slug}.md  # 一个 Seed(人群/场景/痛点起点)
├── opportunities/
│   └── opp-001-{slug}.md   # 一个 Opportunity(frontmatter 承载结构化字段)
└── evidence/
    └── ev-{yymmdd}-{seq}.md  # 一条原始证据
```

### 9.0 实体与关系

**Opportunity(frontmatter 字段)**

```yaml
id, slug, title, seed_id, status(draft|candidate|watch|build|rejected|killed),
summary, problem_statement, target_user,
score_raw, score_label, confidence, coverage,
evidence_ids: [...], keywords: [...], competitors: [...], pricing_observations: [...],
created_at, updated_at, last_decided, decision(keep), why
```

**Evidence(独立文件,见 §8)**

**Experiment(frontmatter,关联机会)**

```yaml
id, opportunity_id, type(landing|demo|manual_service|fake_door|waitlist),
hypothesis, expected_signal, observed_signal, result, decision(scale|iterate|kill),
cost_hours, launched_at, concluded_at, notes
```

### 9.1 V1 必须实体

```text
Seed, Opportunity, Evidence, Experiment
```

### 9.2 可以推迟实体(V2+)

```text
Keyword(keyword 表)、KeywordMetric(时序数据)、SERPResult、Competitor(独立表)、
TrafficHistory、Score 历史快照
```

### 9.3 不需要单独建模的概念

```text
Pricing → 作为 Opportunity 的 pricing_observations 数组字段
Source/渠道 → Evidence.source 字段
Decision → Opportunity.status + last_decided + why 字段
Score 版本 → 保留 score_version 字段即可
```

### 9.4 成本观点

> 在未来出现"≥50 个机会、需要筛选/聚合/排序"的真实需求之前,文件系统就是 V1 的数据库。迁移门槛极低:frontmatter 是结构化数据,以后可无缝倒入 SQLite / KV / 任何 DB。

---

## 10. Human-in-the-loop

### 10.1 决策流

```text
AI Discover → AI Screen → Human Review → Build / Watch / Reject / Need More Evidence
```

### 10.2 Opportunity 审查页/文件必须展示

- 为什么推荐(summary + 一句话依据)
- 搜索需求(Search 证据)
- 用户痛点(Pain 证据 + 原文)
- 竞品(Competition 证据 + Pricing)
- 商业化(Money + Paid Replacement 证据)
- Pricing 观察
- 数据来源 + 原始证据(全部可点击)
- 风险 + AI 不确定性(Confidence / Coverage / 缺失维)
- Score / Confidence / Coverage 三元组
- 人类决策区:Build / Watch / Reject / Need More Evidence + 理由

### 10.3 人的权限

> **AI 不决定投入开发。** 最终 Build 必须是人明确选择。AI 只负责把证据摆齐、把不确定性标亮。

---

## 11. Opportunity → Experiment

```text
Opportunity
  ├── Experiment A(landing page / 假门)
  ├── Experiment B(manual service / 人工服务)
  └── Experiment C(waitlist / demo)
```

- 一个 Opportunity 可以有多个 Experiment。
- Experiment 生命周期:`launched → running → concluded`,结论必填 `result` + `decision`。
- 实验类型与最小形态:
  - **Landing Page / Fake Door**:单页说明 + 定价 + "Waitlist / Try it",量转化。极简、1 天可搭。
  - **Manual Service**:人在后台手动交付,验证"有人付钱"。最快验证手段。
  - **Demo / Prototype**:最小可用演示,验证行为。
  - **Waitlist**:收集邮箱,验证需求强度的下限。
- 每个实验必须写 `hypothesis → expected_signal → observed_signal → decision`,与第 12 节 Kill 机制共用同一张表。

---

## 12. Kill Mechanism

### 12.1 基本 Kill Criteria(结构条件)

```text
Search Demand 不足 | Pain 不真实 | 用户无行为 | 用户不愿付费 |
Acquisition 成本不可接受 | 竞争壁垒过高 | Build Cost 过高 |
Experiment 连续失败 | 被新证据推翻
```

### 12.2 不造假阈值

> 不预先声明"低于 2% 转化就杀"。而是为每个 Experiment 预先声明 Hypothesis 与 Expected Signal,用真实观察逐步形成个人化的阈值库。

```text
Hypothesis:       [一句话可证伪陈述]
Expected Signal:  [多少访客 / 多少点击 / 多少邮箱 / 多少付款,时间窗]
Observed Signal:  [真实数据 / 真实行为 / 真实付款]
Evidence:         [URL / 截图 / 数据]
Decision:         Scale | Iterate | Kill(+理由)
```

- 达标 → Scale(进入 MVP);未达标 → 先 Iterate 一次;再 fail → Kill。
- Kill 不是失败记录,是**预算自由的胜利**:它让人把钱/时间从错误机会转走。
- 每季度复盘所有 Opportunity.status,校准个人阈值。

---

## 13. V1 Scope

### 13.1 V1 必须做什么

```text
1. radar/ 证据仓库骨架 + README 操作手册(如何开启一次雷达任务)
2. Seed → Keyword Expansion(AI 辅助生成候选,人工筛选)
3. 5 类信号的证据采集流程(人工浏览 + AI 辅助记录,手工填 evidence 文件)
4. Manufacture of Opportunity:frontmatter 模板 + Score/Confidence/Coverage 计算脚本(纯函数)
5. Opportunity 审查(文件内或极简静态页均可,见 13.2)
6. Experiment 记录 + Kill 判决表
7. 第 1 个真实雷达周期(Dogfood:用本流程跑通 1 个 Seed → 3 个候选机会)
```

### 13.2 可选增强(判据:10 分钟规则)

- 若在编辑器里阅读 markdown 足够,则**静态审查页(UI)推迟**,不做 Dashboard。
- 只有当"每周看 20+ 机会需要在浏览器里排序/过滤"时,才做一个 Astro 静态渲染的只读列表页(纯前端、无 DB、无 SSR runtime 改造)。

### 13.3 明确不做什么(本轮 + V1)

```text
不建数据库、不建 API、不接任何数据方付费 API、不写爬虫/抓取器、
不做 Reddit/X 自动化采集、不做 SEO/Similarweb/SEMrush 集成、
不做支付、不做登录、不做多用户、不部署额外服务、
不引入定时任务、不引入后台框架、不为了"未来扩展"提前工程化。
```

---

## 14. V1 Non-goals(显式清单)

- Business Code ✗
- Database / Schema ✗
- Third-party API Integration ✗
- Paid Data Provider ✗
- Deployment(本轮) ✗
- UI Rewrite / Dashboard ✗
- Keyword Crawler ✗
- Reddit / X Crawler ✗
- Similarweb / SEMrush Integration ✗
- Payment System ✗
- Large Infrastructure ✗
- 任何形式的计划任务后台 ✗

> 以上每项如未来确实需要 → 记录到 `Future Requirement` 表,不实施。

---

## 15. V2 Roadmap

按价值排序(不是固定时间表):

1. **Evidence 目录规模增长后**:Opportunity 自动聚合 / 静态渲染列表页(只读,仍无 DB)。
2. **Keyword 数据**:接入免费官方渠道进阶处理(Google Trends API 走配额)。
3. **重复性 Pain Mining 步骤自动化**的先决条件:先积累 1 个季度人工操作记录,确认"每周 >20 次"后,评估 Reddit/X **官方 API** 的合规自动化。
4. **SQLite / KV** 迁移:当机会 >50 时,把 frontmatter 迁入结构化存储(证据保留文件路径)。
5. **Learning Loop 数据化**:把各 Experiment 结果回喂评分公式,形成个人化权重(仍由人和 AI 共同校准)。

---

## 16. Future Architecture(仅概念设计)

```text
Signal Ingestion → Normalization → Evidence Store → Opportunity Engine
→ Ranking → Human Review → Experiment Engine → Outcome Data → Learning Loop
```

学习闭环:

```text
Experiment Results → Opportunity Model Improvement → Better Screening
→ Better Experiments → Better Outcomes
```

此架构只描述"如果要长大"的方向。V1 不实现;所有组件都从 V1 的文件结构中自然演化(evidence = Evidence Store,frontmatter = Opportunity Engine 输入,radar/README = 人工流程)。

---

## 17. Risks

| Risk | Mitigation |
|---|---|
| 伪需求(搜索大但无商业价值) | 反假信号规则 + Money/Pain/Paid Replacement 权重压制 |
| AI 幻觉证据 | 强制 url + raw_snippet + ai_generated 标记;季度抽查 |
| 数据源 ToS 违规 | V1 全人工浏览,官方 API 优先;自动化一律先过 ToS 审查 |
| 分数被误读为科学 | 三元组展示 + 分档 + Confidence 封顶规则 |
| 机会过载(选择瘫痪) | Human Review 强制排序:一次只处理 Top 3–5 |
| 沉迷"做研究"不验证 | 每个机会必须 30 天内安排 ≥1 个 Experiment,否则 Watch→Reject |
| 个人偏差硬凑 Founder Fit | Founder Fit 诚实自评,权重仅 1/12 |

---

## 18. Cost Considerations

| 项 | V1 | 说明 |
|---|---|---|
| 外部数据 API | **$0** | 全部免费渠道 / 人工浏览;不买 Similarweb/SEMrush/Ahrefs |
| LLM 成本 | 少量(本地 Claude / API 用量计费) | 主要是日志 token;单次雷达周期预估 <$2 |
| 基础设施 | **$0 新增** | 复用现有 Astro 静态 + Cloudflare Workers(免费额度) |
| 存储 | $0 | 文件系统 + git |
| 人工时间 | 每周 1–3 小时 | AI 辅助检索,人只读证据与决策 |
| Browser/Agent 自动化 | $0(V1 不需要) | 自动化成本归 V2 |

**原则:V1 不该发生的成本 = 所有 API 订阅费、任何爬虫基础设施费。** 若一个数据"人工每周 1 次、10 分钟",而 API 月费 $50 → 人工。

---

## 19. Legal / ToS Considerations

风险分级:`Low` / `Medium` / `High` / `Forbidden`。

| 数据 | V1 方式 | 风险 | 说明 |
|---|---|---|---|
| Google Trends / Keyword Planner | 人工查询/官方 | Low | 手工使用,不批量化抓取 |
| SERP | 手动浏览器 | Low-Med | 人工看 OK;**自动化抓取 SERP 视为 High/Forbidden** |
| Reddit / X | 人工浏览 + 官方 API(未来) | Low-Med | V1 只人工;**抓取= High 且违反其 ToS 的方向不做** |
| 评论站(G2/G2/评论/App Store) | 人工查看 | Low-Med | 只看公开页面,不越过认证墙 |
| 竞品 Pricing/落地页 | 人工查看公开页 | Low | 正常浏览 OK;不复制其资产 |
| Payment 平台公开 Checkout | 人工查看 | Low | 只看公开定价;不尝试绕过支付 |
| Fiverr / Upwork | 人工查看公开页 | Low-Med | 看需求与价格;不抓取、不恶意批量 |

**硬规则:**
- 任何自动化采集(爬虫 / 批量请求)必须先做 robots.txt + ToS 审查,且在 V2+ 单独评审。
- 禁止:绕过权限 / 破解接口 / 规避限制 / 复制受限数据 / 复制竞品品牌、版权内容、私有代码。
- 核心架构永远建立在:官方 API、公开页面人工访问、用户提供数据、合规第三方、人工辅助之上。

---

## 20. Example End-to-End Workflow(示例)

```text
场景:第一次用 Demand Radar 发现机会。

1. 人打开 radar/README,选择一个 Seed:"给 Shopify 独立站卖家的发票/税务工具"
2. AI 辅助生成候选关键词:shopify invoice app, shopify tax, automated invoicing...
3. 人核查 Google Trends 与 SERP(人工,5 分钟):发现 "shopify automatic invoicing" 有稳定长尾
4. AI 聚合 Pain 证据(Reddit / 评论,人工确认真实语境):
   "We have to manually send invoices weekly, wish it was automatic" (url, date)
5. 人工浏览竞品 Pricing(Manual):Zapier 类工具 $29/mo;发现 niche 竞品少
6. AI 记录 Paid Replacement:Fiverr 上大量"custom invoicing service" 订单
7. 评分脚本输出:
   Opportunity: opp-001-shopify-auto-invoicing
   Score: 72 (Candidate) | Confidence: Medium | Coverage: 5/8
   Missing: Keyword metrics(第三方),Traffic(Deferred)
8. 人审查:认为 Founder Fit ~1(懂 Shopify app 生态)→ 选 Build
9. 创建 Experiment A(Fake Door):单页 + "Get early access" + $19/mo(mock paywall)
10. 10 天:预期 30 访客 / 0 付费 → 实际 200 访客 / 4 邮箱 / 1 次点击付费尝试
11. Observed 优于预期 → 再迭代 Experiment B(landing + waitlist 收集 50 邮箱)
12. 每季度复盘:该机会结果进入 Learning Loop,校准题库/权重
```

---

## 21. Acceptance Criteria(M1 设计完成验收)

- [ ] 已按 M0 规则读取全部项目状态(代码/git 优先)✅
- [ ] Demand Radar 定义与边界清晰 ✅(§1–3)
- [ ] 五类 Signal Model 完成 ✅(§4)
- [ ] Pipeline + 每步自动化程度 + 原因完成 ✅(§5)
- [ ] Data Source 矩阵 + Cost + Legal 完成 ✅(§6, §18, §19)
- [ ] Opportunity Score 透明、无伪精确 ✅(§7)
- [ ] Evidence 模型 + 三层可审计结构完成 ✅(§8)
- [ ] V1 Data Model(实体/推迟/不建模)完成 ✅(§9)
- [ ] Human-in-the-loop 完成 ✅(§10)
- [ ] Opportunity → Experiment + Kill 完成 ✅(§11–12)
- [ ] V1 Scope / Non-goals / V2 / Future Architecture 明确 ✅(§13–16)
- [ ] Example 端到端 + 成本 + 风险 完成 ✅(§17, §18, §20)
- [ ] 本轮零代码、零依赖、零 API 接入、零部署 ✅
- [ ] `handoff.md` 已同步 M1 设计状态(见下文 §24)✅

---

## 22. Recommendation(给下一个编码 Agent 的实施顺序)

> M1 设计已完成,建议**可以进入分阶段编码**,但 V1 编码本身主要任务是"搭一个证据仓库 + 极简脚本",不是搭系统。

```text
Recommended Implementation Order:
1. radar/ 骨架 + README(操作手册:如何开一场雷达任务)
2. frontmatter 模板 + Score/Confidence/Coverage 纯函数脚本(V1 唯一"自动"部分)
3. 模板示例:1 个 Seed + 1 个 Opportunity + 3 条 Evidence + 1 个 Experiment(样板)
4. (可选)若人工在编辑器筛选不适 → 只读静态 Opportunity 渲染页(Astro,无 DB)
5. 用真实 Seed 跑通第 1 个雷达周期(Dogfood),验收 V1 是否"让人更快发现值得验证的机会"
```

**Blocking Unknowns(编码前无需阻塞,但需在下一次任务确认真实输入):**

```text
1. 人每周能投入的雷达时间(决定每周处理机会数量上限,建议默认 3–5)
2. 人预选的个人领域/瓶颈(Claude 需要 1 个真实 Seed 才能跑通样板)
3. 是否希望 V1 就有一个公开的只读展示页(还是纯本地文件)
```