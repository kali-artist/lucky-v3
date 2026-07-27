# Lucky · 幸运现场（lucky-v3）

沉浸式、可视化、含管理后台的多模块抽奖体验。基于 React 18 + Vite 5，所有奖项配置可本地持久化，并可直接部署到 Cloudflare Pages。

## ✨ 五大抽奖模块

模块入口均可在大屏页面与移动端访问，所有动画与特效在每模块之间独立切换：

| 模块 | 描述 | 主色 | 全屏揭晓特效 |
| --- | --- | --- | --- |
| **幸运转盘** | 经典 conic-gradient 转盘，1440° + 角度精算 | 紫青（`#8b7cff`） | 同心环纹扩散 |
| **星球抽签** | 摇号机风格的弹珠震荡，权重抽取 | 蓝绿（`#45dbca`） | 球泡粒子上升 |
| **幸运时刻** | 三轴老虎机，灯带闪烁，命中震动 | 粉橙（`#ff70a9`） | 放射光柱 |
| **翻开惊喜** | 8 张卡牌三维翻牌，只揭晓选中那张 | 琥珀（`#ffb85c`） | 五彩纸屑 |
| **粒子爆炸** | 火箭升空 + 粒子爆裂，定格奖品 | 朱红（`#ff5d6c`） | 多中心粒子炸弹 |

每个模块的：

- **色彩主题** 在 `.theme-<id>` shell、Ambient `aurora-*`、`star-field`、粒子 `hue` 上整体联动
- **粒子背景** `Ambient` 根据模块 ID 在密度、速度、模糊半径上有不同配置（`VARIANT_PRESETS`）
- **结果弹窗** 在 `ResultOverlay` 注入差异化 keyframes（`result-rings` / `result-bubbles` / `result-rays` / `result-confetti` / `result-firework`）

## 🛠 管理后台

访问 `/admin` 进入：

- 📋 **活动配置** — 活动名称即时同步到抽奖页
- 📊 **统计卡片** — 奖品数 / 启用数 / 总权重（实时计算）
- ⚡ **批量操作** — 全部启用 / 全部停用 / 权重归一
- ➕ **添加 / 编辑 / 删除奖品** — 支持 1–100 权重、自由颜色、ICON 与字符符号
- 📥 **批量导入** — 多行粘贴 `奖品名称, 权重, 奖品说明`，自动分配图标 / 颜色
- 📤 **导出配置** — 下载当前模块的 JSON 配置，方便备份 / 协作
- 🧹 **一键清空** — 二次确认弹窗
- 💾 **localStorage 持久化** — 所有改动即时写入 `lucky-v3-data`，刷新不丢失

## 💾 本地存储

所有数据保存在浏览器 `localStorage` 的 `lucky-v3-data` 键内，含五大模块的 `title` 与 `prizes` 列表。`useLotteryData()` 会自动从老快照合并默认值，缺新增的「粒子爆炸」模块时自动补齐。

## 🚀 本地开发

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # 输出到 dist/
npm run preview      # 本地预览 dist
```

## ☁️ Cloudflare Pages 部署

本仓库已附 `public/_redirects`（SPA 路由回退）与 `public/_headers`（静态资源永久缓存、HTML 实时校验），可直接对接 Cloudflare Pages。

**方式一：连接 Git 仓库（推荐）**
1. Cloudflare Dashboard → Pages → Create → Connect to Git
2. 选择本仓库
3. **Build command**：`npm run build`
4. **Build output directory**：`dist`
5. 部署完成即可在 `https://<project>.pages.dev` 访问，前台访问根路径、`/admin` 访问后台

**方式二：Wrangler CLI（可选）**
```bash
npm install -g wrangler
npx wrangler pages deploy ./dist --project-name lucky-v3
```

`wrangler.toml` 中已声明 `pages_build_output_dir = "./dist"`，与上述方式保持一致。

## 📦 目录结构

```
.
├── index.html                # Vite 入口
├── package.json
├── vite.config.js
├── wrangler.toml             # Cloudflare Pages 配置
├── public/
│   ├── _redirects            # SPA fallback
│   └── _headers              # 缓存策略
└── src/
    ├── main.jsx              # React 根
    ├── App.jsx               # 路由（抽奖 / admin）
    ├── data.js               # 模块定义 + localStorage hooks
    ├── styles.css            # 全部视觉样式
    └── components/
        ├── LotteryApp.jsx    # 前台页面
        ├── LotteryModules.jsx# 五大抽奖模块实现
        ├── ResultOverlay.jsx # 全屏揭晓层
        ├── Ambient.jsx       # 全屏粒子背景
        └── Admin.jsx         # 管理后台
```

## 🧱 技术栈

- **React 18** + Hooks（无 class）
- **Vite 5** 极速构建
- **lucide-react** 图标
- 原生 Canvas / CSS 动画
- 无后端依赖，所有状态本地化

---

> 设计思路、抽奖哲学可在 `/admin` 内的「系统 → 数据统计」占位页后续扩展。
