# 个人学习知识库

使用 VitePress 阅读和检索本地 Markdown 笔记，使用 Git 记录修改历史。课程包括嵌入式 Linux、C / C++、STM32 / DSP 和信号处理与仿真。

## 在 Windows 上运行

在项目根目录打开 PowerShell。需要 Node.js 22 或更高版本、随 Node.js 提供的 npm，以及 Git。可以用 VS Code 编辑文件。

```powershell
npm.cmd ci
npm.cmd run docs:dev
```

首次安装或依赖变更后运行 `npm.cmd ci`。打开终端显示的本地地址，通常是 `http://127.0.0.1:5173/`。开发服务会自动刷新页面，按 `Ctrl+C` 停止。这里使用 `npm.cmd`，以兼容限制执行 PowerShell 脚本的环境。

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

嵌入式 Linux 课程的两页演示可用于检查章节切换、页内目录、语法高亮和公式。可在搜索框输入「语法高亮」检查中文正文搜索。
