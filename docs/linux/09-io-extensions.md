---
title: 文件接口延伸：fcntl、ioctl 与 mmap
description: 区分描述符控制、设备请求和内存映射，作为后续复习的入口。
next: false
---

# 文件接口延伸：fcntl、ioctl 与 mmap

> 学习状态：参考补充。原稿记录这些接口在早期讨论中出现过，实验细节待核验。

## fcntl：控制描述符及其属性

`F_GETFL`、`F_SETFL` 查询和调整打开文件描述上的文件状态标志，例如 `O_NONBLOCK`；共享打开文件描述的 FD 会看到该变化。`F_GETFD`、`F_SETFD` 操作单个 FD 的标志，例如 `FD_CLOEXEC`，后者使该描述符在成功执行 `exec` 后关闭。设置非阻塞的示例见[阻塞与非阻塞 I/O](./06-blocking-and-nonblocking.md)。

## ioctl：发出设备或内核接口请求

`ioctl` 的请求码、参数类型和效果由具体接口定义。它常用于配置设备或查询状态，调用前应查相应驱动或子系统文档。普通流式数据传输仍应依据该对象所支持的读写接口。

## mmap：建立进程虚拟地址映射

`mmap` 把文件或其他支持映射的对象映射进虚拟地址空间，可用于文件访问和共享内存。使用时应核对映射长度、文件偏移的页对齐、保护权限和映射类型，并在结束时调用 `munmap`。

`MAP_SHARED` 允许共享映射修改，文件映射的写回时机需按接口要求处理。`MAP_PRIVATE` 的修改通常通过写时复制留在私有映射中。映射建好后，程序通过内存访问数据，缺页或写回可能由内核在需要时处理。

## 自测

两个 FD 引用同一个打开文件描述时，修改 `O_NONBLOCK` 会影响哪些 FD？给其中一个 FD 设置 `FD_CLOEXEC` 又会影响哪些？

## 参考手册

- [fcntl(2)](https://man7.org/linux/man-pages/man2/fcntl.2.html)
- [ioctl(2)](https://man7.org/linux/man-pages/man2/ioctl.2.html)
- [mmap(2)](https://man7.org/linux/man-pages/man2/mmap.2.html)
