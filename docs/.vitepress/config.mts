import { defineConfig, type DefaultTheme } from 'vitepress'

const courses: { text: string; link: string; chapters?: DefaultTheme.SidebarItem[] }[] = [
  {
    text: '嵌入式 Linux',
    link: '/linux/',
    chapters: [
      { text: '嵌入式 Linux 整体认识', link: '/linux/01-linux-introduction' },
      { text: '终端命令与基本操作', link: '/linux/02-terminal-commands' },
      { text: 'Linux C 开发与编译调试', link: '/linux/03-development-toolchain' },
      { text: '文件描述符与文件 I/O', link: '/linux/04-file-descriptors-and-io' },
      { text: '文件偏移与 lseek', link: '/linux/05-lseek-and-errors' },
      { text: '阻塞与非阻塞 I/O', link: '/linux/06-blocking-and-nonblocking' },
      { text: 'I/O 多路复用', link: '/linux/07-select-poll-epoll' },
      { text: '进程基础', link: '/linux/08-process-introduction' },
      { text: '文件接口延伸', link: '/linux/09-io-extensions' },
      {
        text: '站点演示',
        collapsed: true,
        items: [
          { text: '代码块演示', link: '/linux/01-code-demo' },
          { text: '数学公式演示', link: '/linux/02-math-demo' }
        ]
      }
    ]
  },
  { text: 'C / C++', link: '/cpp/' },
  { text: 'STM32 / DSP', link: '/embedded/' },
  { text: '信号处理与仿真', link: '/signal/' }
]

const sidebar: DefaultTheme.Sidebar = Object.fromEntries(
  courses.map(({ text, link, chapters = [] }) => [
    link,
    [{ text, items: [{ text: '课程首页', link }, ...chapters] }]
  ])
)

export default defineConfig({
  lang: 'zh-CN',
  title: '个人学习知识库',
  description: '嵌入式、编程与信号处理学习资料',
  lastUpdated: true,
  markdown: {
    math: true,
    codeCopyButtonTitle: '复制代码'
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/', activeMatch: '^/$' },
      ...courses.map(({ text, link }) => ({ text, link, activeMatch: `^${link}` }))
    ],
    sidebar,
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一节', next: '下一节' },
    lastUpdated: { text: '最后更新' },
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    sidebarMenuLabel: '课程菜单',
    returnToTopLabel: '返回顶部',
    skipToContentLabel: '跳转到正文',
    search: {
      provider: 'local',
      options: {
        miniSearch: {
          options: {
            // 汉字按单字索引，查询再用 AND 匹配，支持无空格的正文。
            tokenize: (text) => text.match(/\p{Script=Han}|[^\p{Script=Han}\s\p{P}\p{Z}]+/gu) ?? []
          },
          searchOptions: { combineWith: 'AND' }
        },
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清除查询',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到相关结果',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '回车键',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '上方向键',
              navigateDownKeyAriaLabel: '下方向键',
              closeText: '关闭',
              closeKeyAriaLabel: '退出键'
            }
          }
        }
      }
    }
  }
})
