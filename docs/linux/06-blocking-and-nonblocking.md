---
title: 阻塞与非阻塞 I/O
description: 识别 EOF、EAGAIN 和 EINTR，使用 fcntl 设置 O_NONBLOCK。
---

# 阻塞与非阻塞 I/O

> 学习状态：已讨论。代码片段为参考补充。

## 学习目标

- 区分阻塞、非阻塞、EOF 和暂时无数据。
- 用 `fcntl` 修改非阻塞模式并保留原来的文件状态标志。
- 根据系统调用的返回值选择后续动作。

## 调用什么时候等待

阻塞 I/O 在条件不满足时可能让调用线程等待，例如读入端还没有数据的管道。非阻塞 I/O 在同一情形下通常立即报告暂不可用，让线程可以处理其他工作。实际行为取决于对象类型、标志、接口和当前状态。普通磁盘文件上的 `O_NONBLOCK` 无法保证访问存储时立即返回。

非阻塞调用仍由调用线程发起，并立即取得结果；它不等同于异步 I/O。要等待多个 FD，可以用[I/O 多路复用](./07-select-poll-epoll.md)，避免不断尝试空读。

## 用 fcntl 设置非阻塞

下面是可嵌入 Linux 程序的辅助函数，参数须为已打开的 FD。先读当前文件状态标志，再加入 `O_NONBLOCK`，避免覆盖同样可由 `F_SETFL` 调整的其他标志。共享同一打开文件描述的 FD 会看到这一变化。

~~~c
#include <fcntl.h>

static int set_nonblocking(int fd)
{
    int flags = fcntl(fd, F_GETFL);
    if (flags == -1)
        return -1;

    return fcntl(fd, F_SETFL, flags | O_NONBLOCK);
}
~~~

调用者在返回 `-1` 时检查 `errno` 或用 `perror` 报告失败。`F_GETFD`、`F_SETFD` 处理的是单个描述符的标志，例如 `FD_CLOEXEC`。详见[文件接口延伸](./09-io-extensions.md)。

## 返回值和处理方式

以下以请求读取非零字节数或写入数据为例。

| 结果 | 含义 | 处理方式 |
| --- | --- | --- |
| `read` 返回 `-1` 且 `errno` 为 `EAGAIN` | 非阻塞对象目前无法读取 | 回到事件等待，待就绪后重试。套接字也要考虑 `EWOULDBLOCK`。 |
| 返回 `-1` 且 `errno` 为 `EINTR` | 调用被信号中断 | 按接口语义决定重试还是退出。若等待有总时限，重试前重算剩余时间。 |
| 管道 `read` 返回 `0` | 写端全部关闭且缓冲区已读尽 | 识别 EOF，结束读取。 |
| `write` 返回小于请求长度的正数 | 部分数据已写入 | 记录已写位置，继续处理未写数据。 |

`errno` 不会在每次成功调用后自动清零。只有返回值表明失败时，才按该接口的文档解释它。针对管道等非阻塞读取，当前无数据与明确 EOF 需要走不同分支。

## 常见问题与小结

**阻塞与非阻塞的区别是什么？** 当条件还不满足时，阻塞调用可能等待，非阻塞调用通常立即报告暂不可用。`EAGAIN` 表示当前状态，后续仍可能有数据。

自测：对一个写端仍有进程持有的空管道开启非阻塞读取，收到 `EAGAIN` 后，应该结束读取还是等待新的可读事件？

## 参考手册

- [fcntl(2)](https://man7.org/linux/man-pages/man2/fcntl.2.html)
- [errno(3)](https://man7.org/linux/man-pages/man3/errno.3.html)
