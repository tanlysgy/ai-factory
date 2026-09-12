# AI Factory — Live Production Audit (P7.7)

- 生产域名：https://ai-factory.sgyyyds.qzz.io（Cloudflare，HTTP 200）
- 审计时间：2026-09-12
- 生产版本判定：与 commit `aa7f1d2`（p7.5 design system foundation）一致；P7.5B 审计后的 P7.6 补丁**未部署**（纯审计无代码，符合预期）
- 证据目录：`references/live-audit/<slug>/`（desktop.png / mobile.png / full-page.png / page.html；home 与 factory 附 drawer-open.png）
- 采集方法：Desktop 1440×1000、Mobile 390×844 真实浏览器；DOM 数值全部来自 `getComputedStyle`/`getBoundingClientRect` 实测。整页截图因环境 fullPage 拼接器对 >2000px 页面产生内容重复伪影，改用「视口切片 + 无损拼接」生成 full-page.png（个别切片接缝处有视差元素残影，已在下文标注）。

## DOM 实测汇总（生产环境）

| 页面 | H1 | H2 | CTA 高度 | 最大内容宽 | Nav 高 | 横向滚动 | Drawer |
|---|---|---|---|---|---|---|---|
| / | 112px / -4.48px | 52px/400 | 46px, radius 0 | 1160 | 79, sticky | 无 | ❌ 打开仅 66px |
| /factory/ | **104px / -7.28px** | **50px/700** | 未见主 CTA（仅 mono 命令提示） | 1180 | 31（实测值异常，视觉约 64） | 无 | ❌ 仅 37px 且背景全透明 |
| /radar/ | 96px / -4.8px | 52px/400 | 文字链接（无按钮） | 1160 | 79, sticky | 无 | 未复测（同组件） |
| /experiments/site-intelligence/ | 68px/760 | 36px | **52px** | 1160 | 79 | 无 | — |
| /experiments/seo-checker/ | 44px/700 | 16px | 46px, 墨绿 radius 0 | 720 | 79 | 无 | — |
| /experiments/ai-ready-check/ | 44px/700 | 16px | 46px, 墨绿 radius 0 | 720 | 79 | 无 | — |
| /experiments/ai-visibility/ | 64px/760 | 38px | **52px** | 1160 | 79 | 无 | — |
| /experiments/cost-reduction/ | 48px/600 | 24px | 表单提交钮 | 720 | 79 | 无 | — |

背景色实测：主站/002/003/005 = `#F4F5EF`；**001/004 = `#F1F4F1`**（偏绿的另一档米白）。深色面板已统一 `#173B32`（radar 双绿修复已上线）。

## 每页评分

| 页面 | Hero /20 | Typography /20 | Spacing /15 | Components /15 | Mobile /15 | Polish /15 | 总分 |
|---|---:|---:|---:|---:|---:|---:|---:|
| / | 17 | 16 | 12 | 12 | 12 | 12 | **81** |
| /factory/ | 16 | 14 | 11 | 12 | 11 | 12 | **76** |
| /radar/ | 17 | 16 | 12 | 13 | 12 | 12 | **82** |
| site-intelligence | 16 | 15 | 12 | 12 | 13 | 12 | **80** |
| seo-checker | 14 | 15 | 12 | 12 | 13 | 12 | **78** |
| ai-ready-check | 14 | 15 | 12 | 12 | 13 | 12 | **78** |
| ai-visibility | 16 | 15 | 12 | 12 | 13 | 12 | **80** |
| cost-reduction | 14 | 14 | 12 | 12 | 12 | 11 | **75** |

## UX Checklist 摘要（逐页核对项）

- Hero 完整性：8/8 页完整，无截断、无溢出。
- Navigation：桌面 8/8 正常（sticky + 毛玻璃生效）；移动端按钮存在且可点，但**打开态穿帮**（见 Top 1）。
- CTA 明显度：home/实验页主按钮醒目；**/factory/ 缺一个真实按钮**（只有 `pnpm factory:task:create` 命令文案）；radar 只有文字链接。
- 对比度：深色页荧光绿/白字对比充足；浅色页正文 #172522 于 #F4F5EF 上对比充分；radar 页琥珀警示条可读。未发现不达标组合。
- Hover：桌面 hover 反馈存在但弱（边框加深/箭头位移级别）；行级反馈仍薄。
- Mobile 舒适度：全部页面无横向滚动（8/8）；factory 统计带 4 格单行在 390 下挤压（标签折行至 8-9px 观感）；其余页面堆叠自然。
- 廉价感：002/003 的 shadcn 紫脸已清除；仍存廉价感的位置 = home 抽屉穿帮瞬间、factory 右上 HOME/COMMAND CENTER/RADAR 与其他页信息不一致、cost-reduction 的 "▶" 三角列表符与全站圆点语言不符。
- 参考站残留：无直接残留；demo 站不在本次范围。
- 品牌不一致：两种米白底、7 档 H1、46/52 两档按钮高（详见 Top 10）。

## Top 10 Problems

**P0**
1. **移动端抽屉打开态破损且已上生产**（home：66px 高链接悬浮叠字；factory：37px + 全透明背景 + MENU/CLOSE 标签重叠）。证据：`home/drawer-open.png`、`factory/drawer-open.png`。移动用户点开 MENU 即看到穿帮画面。
2. **/factory/ 未接设计 tokens**：H1 104px/-7.28px（应为 96/-4.8）、H2 50/700（应 48/500）、统计数字无 tabular-nums、移动端统计带 4 格单行挤压。旗舰深色页是全站一致性最差的一页。

**P1**
3. **全站 H1 共 7 档**（112/104/96/68/64/48/44），宣称为「112/96 双档系统」实际只在主站三页中的两页成立；工具页 68/64 与 44 之间也互不统一（001/004 是 68/64，002/003 是 44）。
4. **CTA 两档高度**：标准 46px（home/002/003）vs 工具页 52px（001/004），且 001/004 的底色 `#F1F4F1` 与其余页 `#F4F5EF` 不同——同一「工厂系统」内两个子体系并行。
5. **/factory/ 无主 CTA**：任务队列为空时唯一引导是 mono 命令文案，无「Create Task」按钮（P7.5B 建议未实施）。
6. **Section 节奏页尾漂移**：home 实测 padding 含 96/112、104/104、112/125；radar 含 105/105、100/100。112 档未贯穿。

**P2**
7. cost-reduction 的 H1 居中排版，与全站左对齐语言不一致；"▶" 列表符偏离圆点/mono 语言。
8. Radar 页 "From signalto decision." DOM 文本缺空格（屏读损）。
9. home 导航第三项标签为 "Research"，radar 页自称 "Research System"——命名不统一（home 历史上为 "Research System"）。
10. /factory/ History 网格 3+2 布局留下空第六格；Loops 左栏 MEMORY 面板底部留白失衡。

## Best Page

**/radar/（82）**。三个深色面板统一 `#173B32`、H1 96/-4.8 精确达标、机会大卡（41/100 WATCH + 四格度量 + 琥珀警示）是全站信息设计最成熟的一屏，明暗交替节奏最接近 Stripe。它的存在证明这套设计系统可以达到的水位。

## Worst Page

**/factory/（76）**。作为「旗舰指挥中心」却是 tokens 接入的漏网之鱼：H1/H2/数字三处旧值、无主 CTA、移动端统计挤压、抽屉在深色主题下穿帮最严重（37px 全透明）。它同时承担最高流量预期与最低系统服从度。

## Most Like（对标重合点）

- **Linear**：/factory/ 的深色数据面板、mono 元数据、边框卡片语言——最接近 Linear 的 Issues/Projects 视图。
- **Stripe**：/radar/ 的奶油底与墨绿面板交替、大数字 + 细标签的度量呈现。
- **Raycast**：荧光绿 acid accent 的克制使用、mono 命令提示（`pnpm factory:task:create`）、terminal 气质。
- **Cursor**：首页 112px display 大字 + 深绿 stamp 面板的 hero 构图。
- **Resend**：四个实验工具页的「表单即页面」极简结构 + HONEST NOTE 诚实文案。

## Product Feeling

> 如果这是 Product Hunt 新产品，我愿意给它点 Upvote 吗？

**愿意——但要点开评论区写三条措辞谨慎的 bug 反馈后再点。** 诚实理由：这个产品的差异化是真实的（可公开验证的研究日志 + 能真跑的工具 + 自我复制的工厂叙事，这些在 PH 上罕见），四个工具全部可用、无账号无追踪的立场也加分。但第一印象里有两处会立刻被 PH 用户抓到：移动端抽屉打开即穿帮（P0，人人可见），以及 /factory/ 旗舰页与首页之间可感知的字号漂移。**产品故事值 Upvote，工程完成度目前只值 7/10**——把 Top 10 的两条 P0 修掉，我会毫无保留地推荐。
