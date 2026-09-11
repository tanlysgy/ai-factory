# AI Factory — Handoff

> **Status file. It records verified facts, not goals.** Update after every completed task.
> No secrets (API tokens, passwords, keys) go in this file. Secret names are described as `configured in <store>`, never as values.

## Project

| | |
|---|---|
| Name | AI Factory |
| Working directory | `/home/sgy/ai-factory` (机器: 小新 Linux / Ubuntu 24.04) |
| Last verified | 2026-09-10 |

## Current Phase

| | |
|---|---|
| Phase | M0 ✅ 完成 / M1 设计阶段(本轮仅文档,不编码) |
| Status | **M0: VERIFIED** · **M1: DESIGN COMPLETE**(2026-09-10)— Demand Radar 设计已沉淀,编码前有 3 项待确认 |

## Current Sprint

M1(Design):Demand Radar — 从互联网公开信号系统性发现可验证的赚钱机会。本轮仅完成产品与架构设计并沉淀文档,零编码。

## Objective(两段)

- **M0(完成)**:系统自动部署链路 — `git push → GitHub Actions → Cloudflare → 线上更新`,已实测通过。
- **M1(本阶段)**:为「个人 AI 副业生产线」的第一环做设计 — Demand Radar:让人类系统性发现、多信号验证、证据可审计的赚钱机会。本轮是设计文档,**不是产品开发**。

## Current Architecture

单 Worker:静态资产 + 1 个按需路由(`/api/analyze`,用于 exp-002 SEO Checker 的实时抓取)。流程:

```
git push (master)
  → GitHub Actions (.github/workflows/deploy.yml)
  → pnpm install → pnpm build
  → wrangler deploy → Cloudflare Workers
  → ai-factory.sgyyyds.qzz.io
```

- `astro build` 输出 `dist/`(`dist/client/` 为静态资产,`dist/server/` 为 SSR entrypoint)。
- Wrangler 在构建时 **redirect** 到 `dist/client/wrangler.json`(源自根目录 `wrangler.jsonc`,Assets 目录为 `./dist`)。这是 Astro + Cloudflare 的正常行为,不是错误。
- 本站按静态站点构建(build output: `static`);个别路由用 `export const prerender = false` 单独开启按需渲染(`src/pages/api/analyze.ts` 是唯一一处)。`env.SESSION`、`env.IMAGES` 绑定会被附加。本地无对应 KV/Images 资源,`wrangler dev` 时由 miniflare 模拟(记录于 `Known Issues`)。
- 含按需路由后,构建产物为 `dist/client/`(静态资源)+ `dist/server/entry.mjs`,Wrangler 使用生成的 `dist/server/wrangler.json`(`main: entry.mjs`,`assets: ../client`)。

## Tech Stack

| 层 | 版本 | 证据 |
|---|---|---|
| Node.js | v22.23.2 (`engines: >=22.12.0`) | `node --version` / `package.json` |
| pnpm | v10.34.5 | `pnpm --version` |
| Astro | ^7.3.2 (build: `output: static`) | `package.json` / build 日志 |
| @astrojs/cloudflare | ^14.3.1 | `package.json` |
| Tailwind CSS | ^4.3.3 | `package.json` + `@tailwindcss/vite` |
| Wrangler | ^4.130.0 | `package.json` / `wrangler whoami` |
| lockfile | v9.0 | `pnpm-lock.yaml` |

## Repository

| | |
|---|---|
| Owner / Name | `tanlysgy/ai-factory` |
| URL | `https://github.com/tanlysgy/ai-factory` |
| Default branch (remote) | `master`(已用 `gh repo view` 验证) |
| Local branch | `master`,tracking `origin/master`,与上游一致 |

## Environment

- `wrangler.jsonc`(已验证可解析、可构建、dry-run 部署成功)。
- `.gitignore` 正确忽略 `dist/`、`.astro/`、`node_modules/`、`.wrangler/`、`.env*`。
- 本地 `~/.config/.wrangler/config/default.toml` 存在 **过期** 的 OAuth token(`wrangler whoami` → "Not logged in. Your auth token has expired")。本地不再能交互式部署,已改为走 CI Token。

## Cloudflare

| | |
|---|---|
| Worker 名称 | `ai-factory` |
| 线上站点 | `https://ai-factory.sgyyyds.qzz.io/` — **HTTP 200,可访问(2026-09-10 基线验证)** |
| workers.dev | `https://ai-factory.shiguangyue1314.workers.dev/` — HTTP 200 |
| Cloudflare Account ID | 未在本地任何配置文件可读位置记录;wrangler-action v4 会自行获取,CI 中不设 `accountId` |
| API Token `CLOUDFLARE_API_TOKEN` | **已配置** 于 GitHub Actions Secrets(2026-09-10 添加,`gh secret list` 可见;值不出现在任何项目文件)。使用 Cloudflare 官方 **Edit Cloudflare Workers** 模板生成。已通过生产部署验证 |
| 域名 `ai-factory.sgyyyds.qzz.io` | 自定义域名/自定义域配置来自 Cloudflare 侧前期手工部署,本次未改动 |

## Git

- 最近 M0 提交:`d116b81`(ci: add GitHub Actions deployment)、`3ca843a`(docs: update handoff)、`8e67910`(verify marker,已还原)、`65f220e`(remove marker)。
- 更早提交:`c38c8cc` / `611318b` — `feat: initialize Astro + Tailwind + Cloudflare Workers`。
- remote:`origin git@github.com:tanlysgy/ai-factory.git`(SSH)。
- GitHub CLI (`gh`) 已登录(`tanlysgy`,scopes: `admin:public_key, gist, read:org, repo`)— 提交动作使用 git over SSH,不依赖该 token。

## Completed

- [x] 项目真实状态审计(见上表与 `Verification`)。
- [x] `pnpm build` 通过(1 page / 2.12s)。
- [x] `wrangler deploy --dry-run` 通过(redirect 到 `dist/client/wrangler.json`;9 files / 0.34 KiB)。
- [x] 线上基线:`ai-factory.sgyyyds.qzz.io` 与 workers.dev 均返回 200。
- [x] `handoff.md` 初始化真实状态(本文件)。
- [x] GitHub Actions workflow(`.github/workflows/deploy.yml`)已添加并 commit。
- [x] **GitHub Actions 全链路 VERIFIED** — `gh workflow run` 手动触发(run `34443987301`)→ 8 steps 全绿 → `Uploaded ai-factory (2.68 sec)` → Version `e8be234d-65b7-4fe7-b73b-e9039de85ef4`。
- [x] **Push 自动部署 VERIFIED** — push commit `8e67910`(带 `M0-CI-VERIFY-20260910` 标记)→ 线上出现标记;还原 push commit `65f220e` → 标记消失,页面回到 Astro 默认首页(`<title>Astro Basics</title>`)。
- [x] **M1 Demand Radar DESIGN COMPLETE** — `docs/plans/M1-demand-radar-design.md` 已创建(仅文档,零编码;含 5 类信号模型、Pipeline、透明评分、Evidence 模型、V1 范围、Non-goals、成本与 Legal)。
- [x] `.codegraph/` 未纳入版本控制(保持 untracked,不提交)。
- [x] **exp-001 fake-door 落地页已上线** — `/experiments/cost-reduction`(`1207dd1`),仅前端 + 控制台 `track()`,无后端无分析。
- [x] **exp-001 分发冲刺准备完成** — `radar/experiments/exp-001-distribution-{opportunities,drafts,log}.md`(`275f5d7`);15 个已验证渠道 + 3 份话术模板,**尚未发帖**(待人审)。
- [x] **exp-002 SEO Checker 原型已上线** — `/experiments/seo-checker`(`5edb551`),线上实测:页面 200、实时抓取 `example.com` / `astro.build` 返回真实分析、私有地址被服务端拒绝。

## In Progress

- **M1 编码待启动** — 设计已完成;按文档 §22 `Recommended Implementation Order` 实施,但先确认 3 个 Blocking Input。

## Next

```
M1(编码)— 按 docs/plans/M1-demand-radar-design.md §22 顺序实施
```

**编码前需人确认(文档 §22 Blocking Unknowns):**
1. 每周能投入雷达的时间上限(建议默认 3–5 个机会/周)。
2. 一个**真实 Seed**(个人感兴趣的领域/场景/痛点)用于跑通样板与首个雷达周期。
3. V1 是否需要公开只读展示页,还是纯本地文件。

## Architecture Decisions

- 生产部署只针对 `master`(当前真实默认分支,未改动)。
- 单 workflow(install → build → deploy),最小可维护,不引入 lint/test 体系(项目当前没有 lint/test script,不为 CI 强行引入)。
- CI 不写 `CLOUDFLARE_ACCOUNT_ID`:wrangler-action v4 自行解析账户,减少一个 Secret 依赖。
- 未修改 `wrangler.jsonc`、未改域名、未重构 Astro —— 现有部署架构已实际工作。
- **M1 架构决策(2026-09-10)**:V1 用「git 管理的文件系统 + frontmatter」作为证据仓库(`radar/`),不建数据库;唯一自动部分是透明评分的纯函数脚本;一切抓取自动化 Deferred 且必须先过 ToS 审查;Score 永远以 `Score/Confidence/Coverage` 三元组呈现,禁止小数伪精确。详见 `docs/plans/M1-demand-radar-design.md`。

## Constraints

- 不推送 / 不提交任何 Secret 值。
- 不修改 GitHub 默认分支名。
- 不扩大任务范围;不进入 M1。

## M1 Design Status

| | |
|---|---|
| M1 Status | **DESIGN COMPLETE**(2026-09-10) |
| Design Document | `docs/plans/M1-demand-radar-design.md` |
| 本轮产出 | 纯文档;零业务代码 / 零依赖 / 零 API 接入 / 零部署 / 零 UI 修改 |
| Key Decisions | 5 类信号模型;Table-driven Pipeline(每步 Automation Level + 原因);透明三元组评分;Evidence 一级公民 + 三层可审计;V1 = 文件仓库 + 纯函数脚本;人工下注 |
| Current Scope | V1:Seed→Keyword→证据采集→评分→人审→Experiment 记录 + 第 1 个真实雷达周期 |
| V1 Non-goals | 数据库/API/爬虫/付费数据/支付/登录/Dashboard/部署/大型基础设施 |
| Known Unknowns(编码前) | ①每周可用时间 ②真实 Seed ③是否需公开展示页 |

## Known Issues

1. **本地 OAuth token 已过期** → 本地无法再交互式 `wrangler login`/`wrangler deploy`;本地验证走 `--dry-run`,实际部署走 CI(CI 全链路已验证,不再阻塞)。
2. **`wrangler dev`(未在本次验证)**:adapter 默认声明 `SESSION` KV 与 `IMAGES` Images 绑定,本地无对应资源时由 miniflare 模拟;`pnpm build` 与 `--dry-run` 均正常。若日后用 `wrangler dev` 遇到绑定错误,可按需为 KV/Images 建模,不属于 M0 范围。
3. **本地无法做外网抓取(环境限制,非代码问题)** — 本机出网只能走本地代理(`HTTP(S)_PROXY=127.0.0.1:7897`),直连 DNS 返回 `0.0.0.0`。`curl` 会读代理环境变量,但 **Node `fetch`(undici)与 workerd 都不会**;且本仓库的 `astro dev` 在此环境会被自动判定为 AI agent 环境而强制后台运行,后台进程会丢掉 `NODE_USE_ENV_PROXY`。因此 `POST /api/analyze` 在**本地**必然返回 `unreachable`,在**线上 Worker** 正常(已实测)。
   绕行方式:直接跑纯函数用 `NODE_USE_ENV_PROXY=1 node ...`;本地 UI 验证用 Playwright `route.fulfill` 喂真实抓取到的 payload;浏览器访问外网需给 Chromium 传 `proxy: { server: 'http://127.0.0.1:7897' }`。**结论:涉及真实抓取的端到端验证一律以线上为准。**
4. 暂无其他已知问题。

## Verification

### 本地(2026-09-10)

| 命令 / 检查 | 结果 |
|---|---|
| `pwd` = `/home/sgy/ai-factory` | ✅ |
| `git branch --show-current` = `master` | ✅ |
| `git remote -v` = `git@github.com:tanlysgy/ai-factory.git` | ✅ |
| `git log --oneline -10` (head `d116b81` 后 `c38c8cc`) | ✅ |
| `gh repo view` defaultBranchRef = `master` | ✅ |
| `node --version` = v22.23.2; `pnpm --version` = 10.34.5 | ✅ |
| `pnpm build` | ✅ 1 page / 2.12s |
| `wrangler deploy --dry-run` | ✅ 9 files / 0.34 KiB, config → `dist/client/wrangler.json` |
| `curl https://ai-factory.sgyyyds.qzz.io/` | ✅ HTTP 200(基线,push 前后) |
| `curl https://ai-factory.shiguangyue1314.workers.dev/` | ✅ HTTP 200(基线) |
| `wrangler whoami` | ❌ OAuth token expired(预期,不阻塞 CI Token 方案) |
| `gh secret list` | 配置前:空;配置后:`CLOUDFLARE_API_TOKEN` 可见(值不显示) |
| 已知 Secret 模式扫描(tracked files / staged diff / local env / dotfiles) | ✅ 无命中 |

### GitHub Actions(2026-09-10)

| 检查 | 结果 |
|---|---|
| 触发方式 | `git push origin master`(run `34437165804` 失败 / `34444524122` 成功)+ `gh workflow run`(run `34443987301` 成功) |
| `actions/checkout@v7` | ✅ |
| `pnpm/action-setup@v6` (version 10) | ✅ → v10.34.5 |
| `actions/setup-node@v7` (node 22, cache pnpm) | ✅ |
| `pnpm install --frozen-lockfile` | ✅ 235 packages |
| `pnpm build` | ✅ 1 page |
| `cloudflare/wrangler-action@v4` deploy(Secret 配置前) | ❌ 缺 `CLOUDFLARE_API_TOKEN`(预期配置项) |
| 同一步(Secret 配置后) | ✅ `Uploaded ai-factory (2.68 sec)` → Version `e8be234d-65b7-4fe7-b73b-e9039de85ef4` |
| **Push → 线上标记验证** | ✅ 带标记 commit `8e67910` push 后,生产页面出现 `M0-CI-VERIFY-20260910`;还原 commit `65f220e` push 后标记消失 |
| 结论 | **workflow 真实运行 + 生产自动部署 VERIFIED** |

## Deployment

- 方式:GitHub Actions(`.github/workflows/deploy.yml`)。
- 触发:push 到 `master`。
- 步骤:`actions/checkout@v7` → `pnpm/action-setup@v6`(version 10)→ `actions/setup-node@v7`(node 22, cache pnpm)→ `pnpm install --frozen-lockfile` → `pnpm build` → `cloudflare/wrangler-action@v4`(`command: deploy`, `apiToken: CLOUDFLARE_API_TOKEN`)。
- 状态:**`VERIFIED`** — Git Push → GitHub Actions → Cloudflare → 线上网站更新,已用可逆标记在生产域名实测通过(2026-09-10)。

## Agent Instructions

接替者进入项目时,按序做:

1. 读取本 `handoff.md`(事实源,优先于记忆/聊天记录)。
2. 若涉及产品/架构设计:先读 `docs/plans/M1-demand-radar-design.md`(M1 设计唯一事实源)。
3. 读取 `AGENTS.md` / `CLAUDE.md`(当前内容相同,指 Astro 开发与文档约定)。
3. `git status` / `git branch --show-current` 确认分支与工作区。
4. 以本文件 `Verification` 表格的命令重新核对关键状态,再开始工作。
5. 切勿把 Secret 写入本文件 / 代码 / `.env` 并提交;Secret 一律走 GitHub Actions Secrets。
6. 每完成一个任务,更新本文件 `Change Log` 与状态字段。

## Change Log

- 2026-09-10 — 初始化本文件。状态:M0 进行中;workflow 已配置未验证;线上基线 200。
- 2026-09-10 — commit `d116b81` push 触发 GitHub Actions:install+build ✅,deploy 缺 `CLOUDFLARE_API_TOKEN` ❌(预期)。状态改为 **BLOCKED**,下一步=配置 Secret。
- 2026-09-10 — Secret 已配置。`gh workflow run` + push 触发均全绿(`Uploaded ai-factory`,Version `e8be234d`);带标记 commit `8e67910` push → 线上出现标记,还原 commit `65f220e` → 标记消失。**M0 全链路 VERIFIED**,状态改为 ✅。
- 2026-09-10 — **M1 Demand Radar 设计完成**(仅文档)。创建 `docs/plans/M1-demand-radar-design.md`;更新 M1 状态为 DESIGN COMPLETE。下一阶段 = 确认 §22 三个输入后按顺序编码。
- 2026-09-11 — exp-001 fake-door 上线(`1207dd1`,Cloudflare 已部署,headless 验证 10/10)。
- 2026-09-11 — exp-001 分发冲刺准备(`275f5d7`):15 个渠道 + 3 模板 + 追踪表,零发帖。
- 2026-09-11 — **exp-002 SEO Checker 上线并验证**(`5edb551`):首个按需路由 `/api/analyze`;单测 20/20、本地 UI 21/21、线上 UI 11/11、既有 radar 测试 26/26,`pnpm build` 通过,CI deploy success。记录于 `radar/experiments/exp-002-seo-checker.md`。
