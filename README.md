# 学习笔记

使用 VitePress 阅读和检索 Markdown 笔记，使用 Git 记录修改历史。站点支持中文全文搜索、课程侧边栏、页内目录、代码高亮和数学公式。

## 课程

| 课程 | 学习主题 |
| --- | --- |
| [嵌入式 Linux](docs/linux/index.md) | 开发环境、文件 I/O、事件监听和进程 |
| [C / C++](docs/cpp/index.md) | 编译调试、指针、对象生命周期和内存管理 |
| [STM32 / DSP](docs/embedded/index.md) | 开发调试、外设、ADC 和数字信号处理实践 |
| [信号处理与仿真](docs/signal/index.md) | 离散信号、采样、频域分析和仿真 |

当前包含四门课程的学习路线，以及两页用于验证代码和公式渲染的演示。

## 在 Windows 上运行

需要 Node.js 22 或更高版本、npm 和 Git。首次使用时，在 PowerShell 中克隆仓库并启动。

```powershell
git clone https://github.com/R1CHARDZZZ/study-notes.git
Set-Location study-notes
npm.cmd ci
npm.cmd run docs:dev
```

也可以从 [Gitee](https://gitee.com/r1chardzzz/study-notes) 克隆。已有本地副本时，直接在项目根目录运行 `npm.cmd run docs:dev`。打开终端显示的地址，通常是 `http://127.0.0.1:5173/`。按 `Ctrl+C` 停止服务。

```powershell
npm.cmd run docs:build
npm.cmd run docs:preview
```

构建输出位于 `docs/.vitepress/dist/`。预览命令用于检查这份构建结果。

## 维护笔记

1. 把原始草稿保存到项目根目录的 `inbox/`。该目录由 Git 忽略，从其他副本还原时可自行创建。
2. 检索相应课程目录，优先补充已有章节。新增章节时，同步更新课程首页和 `docs/.vitepress/config.mts` 中的导航。
3. 将图片放到 `docs/public/images/<课程>/`，在正文中用 `/images/<课程>/文件名` 引用。
4. 运行 `npm.cmd run docs:build` 和 `git diff --check`，检查页面和差异后提交。

## 仓库同步

[GitHub](https://github.com/R1CHARDZZZ/study-notes) 和 [Gitee](https://gitee.com/r1chardzzz/study-notes) 都是公开仓库。维护时先在本地提交，再将同一个 `main` 分别推送至两个远端。推送前检查提交内容，个人草稿留在 `inbox/`。
