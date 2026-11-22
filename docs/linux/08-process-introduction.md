---
title: 进程基础
description: 理解进程、PID 和 PPID，以及 fork、exec 和 waitpid 的分工。
---

# 进程基础

> 学习状态：已开始。以下是用于后续复习的参考讲义，进程子主题和实验进度仍待核验。

## 学习目标

- 区分程序、进程和线程，能查看 PID、PPID 和状态。
- 说明 `fork`、`exec`、`waitpid` 的分工。
- 区分僵尸进程和孤儿进程。

## 程序、进程和线程

程序是静态的代码与数据。进程是程序的一次运行实例，具有 PID、虚拟地址空间、打开的文件描述符和运行状态。线程是进程内的执行单元，同一进程的线程通常共享地址空间和部分资源。

在 Linux 上，可用 `ps -ef` 查看进程快照，用 `top` 动态观察进程。要查看某个进程的 PID、父进程 PID（PPID）、状态和命令，可运行 `ps -o pid,ppid,stat,cmd -p 1234`，将 `1234` 换成实际 PID。常见状态包括运行或可运行、睡眠、停止和僵尸，具体含义可查 `ps(1)`。

## fork：创建子进程

| 返回值 | 所处位置 |
| --- | --- |
| 大于 `0` | 父进程，值为子进程 PID |
| 等于 `0` | 子进程 |
| 等于 `-1` | 父进程中创建失败，没有子进程 |

Linux 用写时复制高效实现地址空间复制。父子各有自己的虚拟地址空间，但继承的 FD 仍可能引用同一个打开文件描述，共享文件偏移和文件状态标志。父子进程在 `fork` 之后的执行先后由调度决定。详见[文件描述符与文件 I/O](./04-file-descriptors-and-io.md)。

## exec：替换进程映像

`exec` 系列在当前进程中加载新程序。成功时不会返回到原调用位置；失败才返回 `-1`。`execvp` 可通过 `PATH` 查找不带斜杠的程序名。不同变体在参数表示、路径查找和环境传递上有所区别。

## waitpid：等待并回收

`wait` 或 `waitpid` 可以取得终止状态并回收子进程。`waitpid` 可以指定子进程 PID。先用 `WIFEXITED` 判断是否正常退出，再用 `WEXITSTATUS` 取退出码；如果 `WIFSIGNALED` 成立，用 `WTERMSIG` 取得终止信号。

- **僵尸进程**已经退出，终止状态尚未被回收。
- **孤儿进程**在父进程结束后仍存活，由系统中合适的进程接管，例如子进程收割者或 PID 命名空间中的 init。

## 示例：fork、execvp 与 waitpid

在 Linux 临时目录保存为 `process_demo.c`。子进程执行 `echo`，父进程重试被信号中断的等待，并报告退出状态。子进程若无法执行新程序，调用 `_exit`，避免再次刷新继承的标准库缓冲区。

~~~c
#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/wait.h>
#include <unistd.h>

int main(void)
{
    pid_t child = fork();
    if (child < 0) {
        perror("fork");
        return EXIT_FAILURE;
    }
    if (child == 0) {
        char *const args[] = {"echo", "hello from child", NULL};
        execvp(args[0], args);
        perror("execvp");
        _exit(127);
    }

    int status;
    pid_t result;
    do {
        result = waitpid(child, &status, 0);
    } while (result == -1 && errno == EINTR);

    if (result == -1) {
        perror("waitpid");
        return EXIT_FAILURE;
    }
    if (WIFEXITED(status)) {
        int code = WEXITSTATUS(status);
        printf("child exit status = %d\n", code);
        return code;
    }
    if (WIFSIGNALED(status))
        fprintf(stderr, "child terminated by signal = %d\n", WTERMSIG(status));

    return EXIT_FAILURE;
}
~~~

~~~bash
gcc -Wall -Wextra -std=c11 -g process_demo.c -o process_demo
./process_demo
~~~

在 `PATH` 能找到 `echo` 的 Linux 环境中，预期输出 `hello from child`，随后输出 `child exit status = 0`。

## 常见问题与后续核对

**`fork` 和 `exec` 各做什么？** `fork` 创建子进程，`exec` 替换调用进程的程序映像。常见组合是子进程调用 `exec`，父进程用 `waitpid` 等待并回收。

可进一步核对进程状态切换、`fork` 后的调度顺序、`waitpid` 选项和退出状态编码，以及 `exec` 各变体。IPC、信号、线程和守护进程可另行整理。

## 参考手册

- [fork(2)](https://man7.org/linux/man-pages/man2/fork.2.html)
- [exec(3)](https://man7.org/linux/man-pages/man3/exec.3.html)
- [wait(2)](https://man7.org/linux/man-pages/man2/wait.2.html)
