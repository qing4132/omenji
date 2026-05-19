# Handoff — Omenji

给下一段对话/下一个工作区的接力说明。**不要重新发散，直接进入实现。**

---

## 状态

- 项目刚立项，**还没有任何代码**
- 名字、调性、生成器架构、Roadmap 都已经在 README.md 里定稿
- 用户准备切换到这个工作区开始动手

---

## 用户的偏好（必读）

- **Python**：永远用 `uv`（不用 pip/venv/poetry）
- **前端 dev server**：不要用 `mode: async` 跑 `npm run dev`，会触发 VS Code 假通知。正确做法：
  ```bash
  mkdir -p .dev-logs && nohup npm run dev > .dev-logs/dev.log 2>&1 &
  ```
  且 `.dev-logs/` 加进 `.gitignore`。
- **每次任务完成 + commit + push 之后自动启动 dev**，不要问。
- 沟通：**简短**，不要客套，不要长篇 framing。

---

## 下一步该做什么

### Step 1：脚手架
建议用 Next.js + TypeScript + Tailwind（已与用户偏好对齐）。包管理用 `pnpm`。

```bash
pnpm create next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

初始化完成后立刻：
- 加 `.gitignore` 项：`.dev-logs/`
- `git init` + 首个 commit

### Step 2：签文生成器骨架（这是项目的核心，先做这个，再做 UI）

目录结构建议：
```
/lib/oracle/
  skeletons.ts       // 句式骨架定义（20+ 种）
  slots/             // 槽位词库 JSON
    imagery.json     // 意象（动植物/食物/天气/家电）
    actions.json     // 动作（沉默/翻身/出走/打嗝）
    abstracts.json   // 抽象名词（福报/业力/班味）
    doDont.json      // 宜忌（具体当代生活）
    ...
  goldens.json       // 200 句手写金句（先放 20 句占位）
  rare.ts            // 罕见签 / 元签事件
  context.ts         // 时间/天气感知
  generate.ts        // 主入口：generate(seed, context) => OracleResult
  types.ts
```

**核心数据结构**（建议）：

```typescript
type OracleResult = {
  emoji: string;
  number?: string;        // 签号 1-100，可选
  level?: '上上' | '上' | '中' | '下' | '下下' | '无';
  body: string;           // 主签文
  note?: string;          // 小字注解
  do?: string;            // 宜
  dont?: string;          // 忌
  direction?: string;     // 方位
  lucky?: string;         // 数字
  rare?: 'common' | 'uncommon' | 'hidden' | 'sequence' | 'meta';
  seed: string;
};

type Skeleton = {
  id: string;
  weight: number;
  render: (slots: SlotPicker) => string;
};
```

**关键实现点**：
- `seed` 决定所有随机：`日期 YYYY-MM-DD + localStorage 中的随机 fingerprint` hash 一下当种子
- 用 seeded PRNG（如 `mulberry32`），不要直接用 `Math.random()`
- emoji 与签文**独立采样**，只在 20% 时让 emoji 主题影响骨架/槽位选择
- 每个槽位有"是否出现"的概率，不是必填

### Step 3：UI（在生成器跑通之后）
- 首页：签筒 + 按钮
- 按住手势：PointerEvents + `setPointerCapture`（跨鼠标/触控/笔统一处理）
- 桌面：长按空格"晃动"，松开掉签
- 出签动画：emoji 缩放浮现 → 签文 typewriter
- 长图分享：用 `html-to-image`

### Step 4：内容
- 先用占位词库跑通机制
- 再请用户花时间写 200 句金句 + 完整槽位词（这是后续质量的核心）

---

## 不要做的事

- ❌ 不要先写 UI，再回头补生成器 —— 生成器是项目的灵魂，要先验证它生成的东西好玩
- ❌ 不要让 LLM 在运行时生成签文（成本 + 延迟 + 不稳定），LLM 只在**离线生成内容入库**时用
- ❌ 不要做 emoji → 签文池的硬映射 —— 错配才是笑点
- ❌ 不要做账号系统、不要做后端、不要存数据库 —— MVP 纯前端 + localStorage

---

## 验收 MVP 是否"有意思"的方法

写完生成器之后，连续生成 **50 支签**打印到控制台，自己读一遍。判断标准：

1. 50 支里有没有让你笑出来的（至少 5 支）
2. 50 支里相邻两支结构看起来像不像（不像才算合格）
3. 50 支里有没有"看起来好像有点意思想截图发朋友圈"的（至少 3 支）

不达标就回去调骨架/词库，**不要急着做 UI**。

---

## README.md 是产品定义文档，HANDOFF.md 是交接执行文档

两个文件分工清楚。下一段对话先读 HANDOFF.md，需要查产品细节再翻 README.md。
