# AI Factory — Factory OS (Mission Runtime)

P8 把 `/factory/` 从 Command Center 升级为 Mission Runtime:可视化任务生命周期,
全部状态来自文件,无数据库、无登录、无 WebSocket。

## Mission 生命周期

状态机:

```text
queued ──start──▶ running ──review──▶ review ──complete──▶ completed
   ▲                  │                                       │
   │                  └──(blocked)────────────────────────────▶ blocked
   └────────────────────────── retry ───────────────────────────┘
```

每个 mission 存在 `.factory/missions/<id>.json`:

```json
{
  "id": "mission-001",
  "title": "Replicate Stripe Landing",
  "status": "running",
  "agent": "codex",
  "steps": [{ "label": "Capture", "time": "00:15" }]
}
```

## Runtime 架构

```text
.factory/missions/*.json ──▶ inspect-state.sh ──▶ state-sync.sh ──▶ .factory/state.json
                                      │                                 │
                                      └── .factory/overlay.json ────────┘
                                                                          ▼
                                                               /factory/ Mission Center
```

- `inspect-state.sh`:只读扫描仓库事实(experiments/sites/missions/lessons/tasks)。
- `state-sync.sh`:`scan(事实) + prev(上次) + overlay(预览)` 合并写入 `state.json`,单来源。
- `preview-overlay.sh`:Quick Tunnel 启动时写 `overlay.json` active,退出时标记 expired。

## CLI Flow

```text
pnpm factory:mission:create   # 写 .factory/missions/mission-XXX.json (queued)
pnpm factory:mission:start     # queued -> running
pnpm factory:mission:review    # running -> review
pnpm factory:mission:complete  # review/running -> completed + 自动写 lesson
pnpm factory:release-check     # 输出 Markdown 发布清单 (test/build 自动, 其余需人工/CI)
```

完成 mission 时自动生成 `lesson-XXX-<slug>.md`(模板
`.agent/memory/templates/lesson.md`),含 what worked / what failed /
reusable pattern / browser issue / deployment lesson / next time。

## 设计约束

- 沿用 P7.5 tokens:H1 page 96px、section rhythm 112px、CTA 46px、
  sticky glass nav、mono label、Ink/Cream/Acid。
- 不发散新视觉系统;参考 Linear / Raycast / Cursor 的深色数据面板语言。

## 浏览器验证

- Desktop 1440 / Mobile 390:无横向溢出、Mission 卡/时间线渲染、
  Drawer 全屏 844px、Escape/aria/scroll lock、focus ring 可见。
