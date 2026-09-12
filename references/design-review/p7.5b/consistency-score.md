# P7.5B — Design System 统一性验收（A 项 · 40 分）

> 独立验收人：AI Factory Visual Director。基线 commit `aa7f1d2`（p7.5: design system foundation）。
> 全部结论来自真实浏览器（Desktop 1440 + Mobile 390）实测 DOM 数值与截图，非 CSS 文件阅读。
> 总分：**36 / 40**。核心组件（Button / Chip / Nav / 双绿 / H1 双档）真实落地；三处系统性偏差未达标。

## 分项实测

### 1. H1 统一（112 / 96 双档）— 6/8

| 页面 | 实测 | 档位要求 | 判定 |
|---|---|---|---|
| `/` | 112px / -4.48px / 800 | 112 / -0.04em | ✅ 精确达标 |
| `/radar/` | 96px / -4.8px / 800 | 96 / -0.05em | ✅ 精确达标 |
| `/factory/` | **104px / -7.28px** | 96 / -0.05em | ❌ 仍是 P7-A 旧值，未接 tokens |

Factory 是三页中唯一漏改的 H1。视觉上 Command Center 的 H1 与 Radar 同为"内页"但大了 8px、字距紧了 2.5px，并排打开可感知。

### 2. 字距一致性 — 5/8

- 首页 -4.48px（= -0.04em）✓、Radar -4.8px（= -0.05em）✓、Factory -7.28px（= -0.07em，旧值）✗。
- mono 标签（eyebrow/chip/footer）全站统一 JetBrains Mono + 大写，实测一致 ✓。

### 3. Section 112 节奏 — 5/8

实测 section padding 序列（pTop/pBottom）：

- `/`：`75/84, 28/31, 112/112, 112/112, 96/112, 104/104, 112/125` — 7 段中 3 段离群
- `/radar/`：`70/78, 28/31, 112/112, 105/105, 112/112, 100/100` — 6 段中 3 段离群
- 离群值集中在 hero 区（75/84、70/78 属设计意图可接受）与页尾区（96/112、104/104、105/105、100/100、112/125）——**页尾节奏仍在漂移**，tokens 里的 112 档没有贯穿到 footer 前的区块。

### 4. Button 46px — 8/8

- 首页主 CTA 实测：height **46px** / font-size **13px** / padding `0 22px` / radius **0** / bg #173B32。与 design-system.css 规格完全一致。
- 四个实验页按钮同样直角墨绿（seo-checker 实测 radius 0）。✓
- 深色页（/factory/）按钮同为 46px 高。✓
- 小偏差： Factory 的 "Create Task" 未按 P7-A #8 建议改荧光绿底（深色页存在感弱），属规格未定而非规格未执行，不扣。

### 5. Status Chip 统一 — 7/8

- 首页实验卡：圆点 + mono "Live" 统一组件（四卡一致）✓
- Factory：`COMPLETE` / `DEPLOYED` 均 10px mono、radius 0 ✓（10px 比 spec 的 11px 小 1px，可忽略）
- 实验页结果状态：圆点 + mono，emoji 归零（实测 002/003 无任何 ✅/⚠️ 字符）✓
- Radar 页机会卡状态 "WATCH" mono ✓

### 6. Navigation 统一 — 5/8

- 三页主导航（HOME / COMMAND CENTER / RADAR）+ 实验页（HOME / COMMAND CENTER / RADAR + 右侧 EXP 00X 标签）结构统一 ✓
- `position: sticky` + `rgba(244,245,239,0.92)` + `blur(8px)` 实测生效 ✓
- 移动端 MENU 抽屉：按钮/开合状态/aria-expanded 均正确，**但打开态视觉破损**（见 remaining-fixes #1）——这是唯一拉低此项的缺陷。

## 结论

`aa7f1d2` 的 design system **是真的**：tokens 文件、共享组件、吸顶导航、chip 组件、双绿统一、002/003 换肤全部在部署页可验证。未达标的 4 分集中在三个点：Factory H1 旧值、页尾 section 节奏、抽屉打开态。均为小改动，见 P7.6 Patch List。
