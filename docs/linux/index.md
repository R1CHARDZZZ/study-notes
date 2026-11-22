# 嵌入式 Linux

先从硬件、启动、内核、驱动和用户空间建立整体认识，再学习终端操作、文件 I/O、事件等待与进程管理。系统编程示例面向 Ubuntu 等 Linux 环境。涉及文件写入的练习请使用独立临时目录。

## 课程路线

1. [嵌入式 Linux 整体认识](./01-linux-introduction.md)
2. [终端命令与基本操作](./02-terminal-commands.md)
3. [Linux C 开发与编译调试](./03-development-toolchain.md)
4. [文件描述符与文件 I/O](./04-file-descriptors-and-io.md)
5. [文件偏移与 lseek](./05-lseek-and-errors.md)
6. [阻塞与非阻塞 I/O](./06-blocking-and-nonblocking.md)
7. [I/O 多路复用：select、poll 与 epoll](./07-select-poll-epoll.md)
8. [进程基础](./08-process-introduction.md)
9. [文件接口延伸：fcntl、ioctl 与 mmap](./09-io-extensions.md)

## 归档状态

前七章来自已讨论主题。进程基础记录为「已开始」，文件接口延伸为「参考补充」。示例中列出的输出是预期结果，历史实验和学习进度以可核验记录为准。

线程与同步、IPC、网络通信、交叉编译与系统启动、驱动及 Buildroot / Yocto 在第一章作概念导读，相关专题和实操留待另行整理。

## 站点演示

- [代码块演示](./01-code-demo.md)
- [数学公式演示](./02-math-demo.md)
