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
| Phase | M0 — GitHub Actions 自动部署 |
| Status | **IN PROGRESS** — workflow added, production deployment NOT yet verified via CI |

## Current Sprint

M0: 建立 `handoff.md` + Git Push → GitHub Actions → Cloudflare Workers 自动部署链路。

## Objective

让 `git push` 触发 GitHub Actions 完成 `pnpm install` → `pnpm build` → `wrangler deploy`，使 `https://ai-factory.sgyyyds.qzz.io/` 随 push 自动更新。这是唯一目标；不做产品开发。

## Current Architecture

单 Worker + 静态资产。流程：

```
git push (master)
  → GitHub Actions (.github/workflows/deploy.yml)
  → pnpm install → pnpm build
  → wrangler deploy → Cloudflare Workers
  → ai-factory.sgyyyds.qzz.io
```

- `astro build` 输出 `dist/`（`dist/client/` 为静态资产，`dist/server/` 为 SSR entrypoint）。
- Wrangler 在构建时 **redirect** 到 `dist/client/wrangler.json`（源自根目录 `wrangler.jsonc`，Assets 目录为 `./dist`）。这是 Astro + Cloudflare 的正常行为，不是错误。
- 本站当前按静态站点构建（build output: `static`），SSR entrypoint 仍会被编译并部署，`env.SESSION`、`env.IMAGES` 绑定会被附加。本地无对应 KV/Images 资源，`wrangler dev` 时由 miniflare 模拟（记录于 `Known Issues`）。

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
| Default branch (remote) | `master`（已用 `gh repo view` 验证） |
| Local branch | `master`，tracking `origin/master`，与上游一致 |

## Environment

- `wrangler.jsonc`（已验证可解析、可构建、dry-run 部署成功）。
- `.gitignore` 正确忽略 `dist/`、`.astro/`、`node_modules/`、`.wrangler/`、`.env*`。
- 本地 `~/.config/.wrangler/config/default.toml` 存在 **过期** 的 OAuth token（`wrangler whoami` → "Not logged in. Your auth token has expired"）。本地不再能交互式部署，已改为走 CI Token。

## Cloudflare

| | |
|---|---|
| Worker 名称 | `ai-factory` |
| 线上站点 | `https://ai-factory.sgyyyds.qzz.io/` — **HTTP 200，可访问（2026-09-10 基线验证）** |
| workers.dev | `https://ai-factory.shiguangyue1314.workers.dev/` — HTTP 200 |
| Cloudflare Account ID | 未在本地任何配置文件可读位置记录；wrangler-action v4 会自行获取，CI 中不设 `accountId` |
| API Token `CLOUDFLARE_API_TOKEN` | **未配置** 在 GitHub Actions Secrets（`gh secret list` 为空）。所需权限事后对照 Cloudflare 官方文档：`Edit Cloudflare Workers` 模板。这是 M0 自动化部署的阻塞项 |
| 域名 `ai-factory.sgyyyds.qzz.io` | 自定义域名/自定义域配置来自 Cloudflare 侧前期手工部署，本次未改动 |

## Git

- 最近提交：`c38c8cc` / `611318b` — `feat: initialize Astro + Tailwind + Cloudflare Workers`。
- remote：`origin git@github.com:tanlysgy/ai-factory.git`（SSH）。
- GitHub CLI (`gh`) 已登录（`tanlysgy`，scopes: `admin:public_key, gist, read:org, repo`）— 提交动作使用 git over SSH，不依赖该 token。

## Completed

- [x] 项目真实状态审计（见上表与 `Verification`）。
- [x] `pnpm build` 通过（1 page / 2.12s）。
- [x] `wrangler deploy --dry-run` 通过（redirect 到 `dist/client/wrangler.json`；9 files / 0.34 KiB）。
- [x] 线上基线：`ai-factory.sgyyyds.qzz.io` 与 workers.dev 均返回 200。
- [x] `handoff.md` 初始化真实状态（本文件）。
- [x] GitHub Actions workflow（`.github/workflows/deploy.yml`）已添加并 commit。
- [x] `.codegraph/` 未纳入版本控制（保持 untracked，不提交）。

## In Progress

- M0 — GitHub Actions 自动部署链路：workflow 已配置，尚未验证运行。

## Next

1. 在 GitHub 仓库配置 Secret：`Settings → Secrets and variables → Actions → New repository secret`：`CLOUDFLARE_API_TOKEN`（用 Cloudflare Account 下按官方模板 **Edit Cloudflare Workers** 生成的 API Token，范围限制到部署账户）。
2. `git push origin master` 触发 workflow。
3. 观察 GitHub Actions 运行结果。
4. 若成功：用一次极小、可逆的页面改动，确认线上真实更新，随后还原。
5. 更新本文件：将 M0 状态改为 `VERIFIED`（或 `BLOCKED` 并写明原因）。

M0 之后的下一阶段（本次不执行）：

```
M1 — Website / Information Architecture
```

## Architecture Decisions

- 生产部署只针对 `master`（当前真实默认分支，未改动）。
- 单 workflow（install → build → deploy），最小可维护，不引入 lint/test 体系（项目当前没有 lint/test script，不为 CI 强行引入）。
- CI 不写 `CLOUDFLARE_ACCOUNT_ID`：wrangler-action v4 自行解析账户，减少一个 Secret 依赖。
- 未修改 `wrangler.jsonc`、未改域名、未重构 Astro —— 现有部署架构已实际工作。

## Constraints

- 不推送 / 不提交任何 Secret 值。
- 不修改 GitHub 默认分支名。
- 不扩大任务范围；不进入 M1。

## Known Issues

1. **`CLOUDFLARE_API_TOKEN` GitHub Secret 未配置** → workflow 会在 deploy 步失败，直到创建该 Secret。这是预期中的配置项，非代码问题。
2. **本地 OAuth token 已过期** → 本地无法再交互式 `wrangler login`/`wrangler deploy`；本地验证走 `--dry-run`，实际部署走 CI。
3. **`wrangler dev`（未在本次验证）**：adapter 默认声明 `SESSION` KV 与 `IMAGES` Images 绑定，本地无对应资源时由 miniflare 模拟；`pnpm build` 与 `--dry-run` 均正常。若日后用 `wrangler dev` 遇到绑定错误，可按需为 KV/Images 建模，不属于 M0 范围。
4. 暂无其他已知问题。

## Verification

2026-09-10 实际执行验证（结果）：

| 命令 / 检查 | 结果 |
|---|---|
| `pwd` = `/home/sgy/ai-factory` | ✅ |
| `git branch --show-current` = `master` | ✅ |
| `git remote -v` = `git@github.com:tanlysgy/ai-factory.git` | ✅ |
| `git log --oneline -10` (head `c38c8cc`) | ✅ |
| `gh repo view` defaultBranchRef = `master` | ✅ |
| `node --version` = v22.23.2; `pnpm --version` = 10.34.5 | ✅ |
| `pnpm build` | ✅ 1 page / 2.12s |
| `wrangler deploy --dry-run` | ✅ 9 files / 0.34 KiB, config → `dist/client/wrangler.json` |
| `curl https://ai-factory.sgyyyds.qzz.io/` | ✅ HTTP 200 |
| `curl https://ai-factory.shiguangyue1314.workers.dev/` | ✅ HTTP 200 |
| `wrangler whoami` | ❌ OAuth token expired（预期，不阻塞 CI Token 方案） |
| `gh secret list` | 空 → CLOUDFLARE_API_TOKEN 未配置 |
| 已知 Secret 模式扫描（tracked files） | ✅ 无命中 |

## Deployment

- 方式：GitHub Actions（`.github/workflows/deploy.yml`）。
- 触发：push 到 `master`。
- 步骤：`actions/checkout@v7` → `pnpm/action-setup@v6`（version 10）→ `actions/setup-node@v7`（node 22, cache pnpm）→ `pnpm install --frozen-lockfile` → `pnpm build` → `cloudflare/wrangler-action@v4`（`command: deploy`, `apiToken: CLOUDFLARE_API_TOKEN`）。
- 状态：`CONFIGURED` — **NOT yet production-verified**。

## Agent Instructions

接替者进入项目时，按序做：

1. 读取本 `handoff.md`（事实源，优先于记忆/聊天记录）。
2. 读取 `AGENTS.md` / `CLAUDE.md`（当前内容相同，指 Astro 开发与文档约定）。
3. `git status` / `git branch --show-current` 确认分支与工作区。
4. 以本文件 `Verification` 表格的命令重新核对关键状态，再开始工作。
5. 切勿把 Secret 写入本文件 / 代码 / `.env` 并提交；Secret 一律走 GitHub Actions Secrets。
6. 每完成一个任务，更新本文件 `Change Log` 与状态字段。

## Change Log

- 2026-09-10 — 初始化本文件。状态：M0 进行中；workflow 已配置未验证；线上基线 200。