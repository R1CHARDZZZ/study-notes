---
title: I/O 多路复用：select、poll 与 epoll
description: 比较三种 I/O 就绪接口，理解 poll 返回事件以及 epoll 的 LT 和 ET。
---

# I/O 多路复用：select、poll 与 epoll

> 学习状态：已讨论。示例和练习用于复习。

## 学习目标

- 理解就绪事件怎样帮助一个线程等待多个文件描述符。
- 按 `select`、`poll`、`epoll` 的顺序理解接口和数据结构。
- 在边缘触发模式中正确处理非阻塞读取。

## 为什么要等待就绪事件

依次阻塞读取多个 FD 可能卡在第一个无数据的 FD，反复检查每个非阻塞 FD 又可能消耗 CPU。多路复用让线程先等待一组感兴趣的事件，再处理相应的 FD。就绪只表示某种操作可以着手处理。读取可能得到部分数据或 EOF，就绪后也可能因其他线程先读等原因遇到 `EAGAIN`。

## select：位集合

`select`（`<sys/select.h>`）接受读、写、异常条件三组 `fd_set`。用 `FD_ZERO` 初始化，`FD_SET` 加入 FD，调用返回后用 `FD_ISSET` 检查对应集合中的结果。

- `nfds` 是最大受监视 FD 加一。上限约束的是 FD 的数值；Linux 上 glibc 的 `FD_SETSIZE` 通常为 1024。
- 正数为返回的各集合中置位的总数，同一 FD 出现在两个集合时可计两次。`0` 表示超时，`-1` 表示失败。
- 返回时集合会被改成就绪结果，下一轮需重新填充。Linux 也可能修改超时结构，循环时应重新计算或初始化。

## poll：数组与返回事件

`poll`（`<poll.h>`）接收 `struct pollfd` 数组。每项的 `fd` 指定对象，`events` 声明感兴趣的位，例如 `POLLIN`、`POLLOUT`，`revents` 返回实际事件位。正数表示 `revents` 非零的项数，`0` 表示超时，`-1` 表示失败。

`POLLHUP` 可能与 `POLLIN` 同时出现。以管道为例，写端关闭时，缓冲区里还可能有数据，应读取并依据结果判断 EOF。另需处理 `POLLERR` 和 `POLLNVAL`。

### 示例：等待标准输入

保存为 `poll_demo.c`，在 Linux 终端运行。这个程序只展示一次等待和一次读取，适合观察超时、数据和 EOF。

~~~c
#define _POSIX_C_SOURCE 200809L
#include <poll.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(void)
{
    struct pollfd input = { .fd = STDIN_FILENO, .events = POLLIN };
    int ready = poll(&input, 1, 5000);
    if (ready < 0) {
        perror("poll");
        return EXIT_FAILURE;
    }
    if (ready == 0) {
        puts("timeout");
        return EXIT_SUCCESS;
    }
    if (input.revents & (POLLERR | POLLNVAL)) {
        fputs("stdin is unavailable\n", stderr);
        return EXIT_FAILURE;
    }
    if (input.revents & (POLLIN | POLLHUP)) {
        char buffer[128];
        ssize_t count = read(STDIN_FILENO, buffer, sizeof buffer);
        if (count < 0) {
            perror("read");
            return EXIT_FAILURE;
        }
        if (count == 0)
            puts("EOF");
        else
            printf("read %zd bytes\n", count);
    }
    return EXIT_SUCCESS;
}
~~~

~~~bash
gcc -Wall -Wextra -std=c11 -g poll_demo.c -o poll_demo
./poll_demo
printf 'hello\n' | ./poll_demo
./poll_demo </dev/null
~~~

在典型终端中保持五秒不输入，预期看到 `timeout`。管道示例预期读取 6 字节，`/dev/null` 示例预期读取 EOF。收到信号中断时，本例报告错误并退出；有总时限的事件循环可重算剩余时间再等待。

## epoll：持续管理关注集合

`epoll` 是 Linux 专有接口，主要流程如下。

~~~text
epoll_create1(EPOLL_CLOEXEC)
    ↓
epoll_ctl：ADD、MOD、DEL 管理关心的 FD 和事件
    ↓
epoll_wait：取出已就绪事件
    ↓
根据每项的 data 和 events 执行处理
    ↓
继续等待，结束后关闭 epoll 实例
~~~

内核维护关注列表和就绪列表。大量 FD 中只有少数活跃时，避免每轮反复传入和扫描完整集合可能带来收益，实际性能取决于负载。某些类型无法注册，例如普通磁盘文件上 `epoll_ctl` 可能报告 `EPERM`。练习可使用管道、FIFO 或套接字。

### LT 与 ET

- **LT（水平触发）**是默认模式。只要就绪条件仍成立，后续等待通常还能观察到事件。
- **ET（边缘触发）**使用 `EPOLLET`。收到读事件时通常在非阻塞 FD 上循环读，直到 `EAGAIN` 或 `EWOULDBLOCK`。读到 `0` 时处理 EOF，遇到 `EINTR` 可按调用语义重试，其他错误进入错误处理。
- 回到 `epoll_wait` 之前，如果只读取了少量数据，剩余数据可能长时间留在缓冲区。对流式协议，读取次数和消息边界是两回事。

## 接口对比

| 项目 | `select` | `poll` | `epoll` |
| --- | --- | --- | --- |
| 可用环境 | POSIX 与常见类 Unix 系统 | POSIX 与常见类 Unix 系统 | Linux |
| 关注集合 | 位集合，每轮重建 | 每轮传入数组 | 内核持续管理 |
| 就绪结果 | 检查返回的各集合 | 扫描数组的 `revents` | 读取就绪事件数组 |
| 学习顺序 | 先理解就绪与超时 | 再理解事件位 | 最后比较 LT 与 ET |

## 常见问题与自测

**三者的主要区别是什么？** 它们都等待 I/O 就绪，主要区别是关注集合和就绪结果的管理方式。`select` 使用位集合，`poll` 使用数组，`epoll` 让内核持续管理关注集合并返回就绪事件。

**ET 为什么通常要读到 `EAGAIN`？** 数据还留在缓冲区时，下一次等待可能没有新的边缘通知。读到暂不可用，才能确认当前这一轮已经排空可读数据。

待运行的练习：用 `select` 改写标准输入示例，再用管道对照 `epoll` 的 LT 与 ET。可用 `strace` 观察不同版本发出的系统调用。错误分支可复习[阻塞与非阻塞 I/O](./06-blocking-and-nonblocking.md)。

## 参考手册

- [select(2)](https://man7.org/linux/man-pages/man2/select.2.html)
- [poll(2)](https://man7.org/linux/man-pages/man2/poll.2.html)
- [epoll(7)](https://man7.org/linux/man-pages/man7/epoll.7.html)
- [epoll_ctl(2)](https://man7.org/linux/man-pages/man2/epoll_ctl.2.html)
