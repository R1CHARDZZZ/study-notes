# 学习笔记

使用 VitePress 阅读和检索 Markdown 笔记，使用 Git 记录修改历史。站点支持中文全文搜索、课程侧边栏、页内目录、代码高亮和数学公式。

## 课程

| 课程 | 学习主题 |
| --- | --- |
| [嵌入式 Linux](docs/linux/index.md) | 开发环境、文件 I/O、事件监听和进程 |
| [C / C++](docs/cpp/index.md) | 编译调试、指针、对象生命周期和内存管理 |
| [STM32 / DSP](docs/embedded/index.md) | 开发调试、外设、ADC 和数字信号处理实践 |
| [信号处理与仿真](docs/signal/index.md) | 离散信号、采样、频域分析和仿真 |

嵌入式 Linux 已整理入门、工具链、文件 I/O、多路复用与进程基础教程。其余课程提供学习路线，站点演示可用于检查代码和公式渲染。

## 在 Windows 上运行

需要 Node.js 22 或更高版本、npm 和 Git。首次使用时，在 PowerShell 中克隆仓库并启动。

```powershell
git clone https://github.com/R1CHARDZZZ/study-notes.git
Set-Location study-notes
npm.cmd ci
npm.cmd run docs:dev
```

也可以从 [Gitee](https://gitee.com/r1chardzzz/study-notes) 克隆。安装依赖后，双击项目根目录的 [open-notes.vbs](open-notes.vbs)，即可在后台启动站点并打开默认浏览器。也可以为这个脚本创建自己的快捷方式。关闭网页后服务会继续在本机运行，下次打开可以直接复用。

需要查看启动日志时，可双击 [start-notes.cmd](start-notes.cmd) 使用带窗口的启动方式。在该窗口按 `Q` 可停止由它启动的服务。

也可以从 PowerShell 运行 `npm.cmd run docs:dev`，打开终端显示的地址，通常是 `http://127.0.0.1:5173/`。

```powershell
npm.cmd run docs:build
npm.cmd run docs:preview
```

构建输出位于 `docs/.vitepress/dist/`。预览命令用于检查这份构建结果。

## 维护笔记

课程笔记以 `docs/` 中的 Markdown 为准。VitePress 负责阅读和检索，Git 保留修订历史，Agent 根据本次提供的材料整理内容。

1. 提供需要整理的学习记录、代码、典型疑问和已确认结论。原始草稿可放在 `inbox/`，该目录由 Git 忽略，新设备上可按需创建。
2. 先查找相应课程，优先补充已有章节。新增或移动章节时，同步更新课程首页、导航及站内链接。
3. 将图片放到 `docs/public/images/<课程>/`，在正文中用 `/images/<课程>/文件名` 引用。
4. 运行 `npm.cmd run docs:build` 和 `git diff --check`，复核关键结论、示例和待验证事项，再决定是否提交。

### 交给新的 Agent

先让 Agent 阅读 [项目规则](AGENTS.md)和[知识归纳流程](skills/knowledge-curation/SKILL.md)，再提供本次任务的材料。规则和流程随仓库保存，新 Agent 可通过文件路径直接读取。

> 请先读 README.md、AGENTS.md 和 skills/knowledge-curation/SKILL.md，再根据我提供的材料整理笔记。先查找已有章节，优先增量更新，检查导航与链接，运行构建并报告待核查内容。只有在我明确要求时才提交、推送或部署。

换电脑时，获取仓库副本后按上面的 Windows 步骤安装依赖。尚未归档的聊天、草稿和实验记录需要另行提供。

## 仓库同步

GitHub 和 Gitee 都是公开仓库。确认需要同步时，将同一个本地 `main` 提交分别推送到两个远端。个人草稿留在 `inbox/`，推送前检查提交内容。[GitHub](https://github.com/R1CHARDZZZ/study-notes) · [Gitee](https://gitee.com/r1chardzzz/study-notes)
