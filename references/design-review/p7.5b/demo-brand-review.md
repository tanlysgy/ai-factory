# P7.5B — Demo 品牌独立性评审（C 项 · 20 分）

> 问题：Codeflare / Ledger / Relay / Lumina 是四个真品牌，还是同一个模板换色？
> 结论：**16 / 20 —— 桌面端是四家真公司；移动端全体的导航死亡拉低得分。**

## 逐品牌评分

### Codeflare — 17/20（dev-tool，对标 Cursor）
- 深黑底 + 酸性紫 + mono 大写眉标的组合自成一格；Playground 终端窗是"真产品"级别的资产。
- 品牌资产：圆角紫 logo、pill 导航按钮、traffic-light 窗体——**没有一处像工厂**。
- 扣分：移动端导航完全失效（见下）。

### AI Ledger — 17/20（fintech，对标 Linear/Mercury）
- 浅灰蓝底 + 靛蓝 + 大字 H1 四行排布， Linear 味最正。
- 本轮可见 tokens 渗入：badge "The system for focused teams" 已是 mono —— 渗入方式正确（只借字体气质，不借墨绿配色）。
- 扣分：移动端导航失效；看板在 375px 仍挤压。

### Relay — 16/20（email infra，对标 Resend）
- 暖米底 + 亮蓝 + 双栏 REQUEST/PREVIEW 面板，Resend 的结构气质抓住了。
- H1 两行、CTA 双钮、免费层微文案，全是 Resend 语法但品牌色（亮蓝 vs Resend 黑）区分清晰。
- 扣分：移动端导航失效；JSON 代码块在 390 出现横向滚动条。

### Lumina — 15/20（answer engine，对标 Perplexity）
- 近白底 + 深青 + 大搜索框 + 答案卡，Perplexity 的骨架成立，青色 accent 独立。
- **老问题未修**：眉标/H1 左缘 x=303 与搜索框左缘 x=212 两套容器宽度仍在同一屏打架（P7-A #16）。
- 扣分：移动端导航失效；对齐问题。

## "同一模板换色"判定：否

四个站的导航结构（链接数量/命名）、hero 构图（左文右图 / 居中搜索 / 全宽表单）、组件形状（pill vs 直角）、字体气质（衬线混排 vs 全无衬线）都不同。tokens 渗入仅限 mono 眉标这类"工厂暗号"，属于健康的母品牌联系。**桌面端可以说:这是四家不同公司的产品。**

## 移动端导航：四站全灭（唯一系统性倒退）

实测 390 宽度，四站 DOM 中 `header` 内 button 数量为 **0**，导航链接全部 `width: 0` 隐藏：

| 站点 | 可见元素 | MENU 按钮 | 导航可达性 |
|---|---|---|---|
| Codeflare | Logo + Download | 无 | ❌ Agent/Playground/Pricing/Changelog 全部不可达 |
| Ledger | Logo + Start free | 无 | ❌ System/Demo/Pricing/Changelog 全部不可达 |
| Relay | Logo + Start sending | 无 | ❌ Docs/Features/Pricing/Playground 全部不可达 |
| Lumina | Logo + Try Lumina | 无 | ❌ Answers/Features/Pricing 全部不可达 |

`aa7f1d2` 声称 "upgrade 4 site templates to factory tokens + mobile MENU full-screen drawer"——**桌面 tokens 落了，移动抽屉没有落到任何一站**。移动用户除 CTA 外无处可去，这是 demo 层当前唯一的 P0。

## 工厂母品牌联系（D 项铺垫）

四个 demo 的眉标/徽章已统一为 mono 大写（工厂暗号），但配色、组件、布局完全独立——这正是"母公司作品集"应有的关系：**认得出是同一双手做的，认不出是同一家公司贴牌的。**
