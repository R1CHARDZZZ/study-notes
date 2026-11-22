---
title: 文件描述符与文件 I/O
description: 理解文件描述符、打开文件描述、open/read/write/close 与可靠的文件复制循环。
---

# 文件描述符与文件 I/O

> 学习状态：已讨论。文件复制程序是参考补充，由学习稿中的练习思路整理。

## 学习目标

- 区分文件描述符与打开文件描述。
- 正确处理 `open`、`read`、`write` 和 `close` 的返回值。
- 在复制文件时处理短读、部分写入和信号中断。

## 文件描述符与打开文件描述

文件描述符（FD）是进程用于引用打开文件或其他 I/O 对象的非负整数。标准输入、标准输出、标准错误通常对应 `0`、`1`、`2`。

~~~text
进程内的文件描述符（例如 3）
    ↓
内核中的打开文件描述（当前偏移、文件状态标志等）
    ↓
底层文件或其他 I/O 对象
~~~

一次成功的 `open` 创建新的打开文件描述。同一文件独立打开两次，通常有独立的偏移；由 `dup` 复制或由 `fork` 继承的 FD 可引用同一打开文件描述，因而共享偏移和文件状态标志。详见[文件偏移](./05-lseek-and-errors.md)和[进程基础](./08-process-introduction.md)。

## 打开、读取、写入和关闭

| 调用 | 成功返回 | 失败返回 | 注意点 |
| --- | --- | --- | --- |
| `open` | 非负 FD | `-1` | 检查路径、权限和标志。 |
| `read` | 实际读取字节数 | `-1` | 请求长度大于零时，普通文件返回 `0` 表示 EOF。短读仍是成功。 |
| `write` | 实际写入字节数 | `-1` | 写入字节数可能少于请求长度。 |
| `close` | `0` | `-1` | 报告错误；在 Linux 上不要盲目重试，以免关闭已被复用的 FD。 |

`O_RDONLY`、`O_WRONLY`、`O_RDWR` 分别指定只读、只写和读写。`O_CREAT` 可创建文件，并需要提供权限参数，例如八进制 `0644`，实际权限还受 `umask` 等因素影响。`O_TRUNC` 会在满足条件时把已有普通文件截断为零长度。`O_APPEND` 使每次写入按追加语义定位到文件末尾。

错误处理只在接口报告失败时读取 `errno`。与信号中断和非阻塞有关的错误见[阻塞与非阻塞 I/O](./06-blocking-and-nonblocking.md)。

## 示例：循环复制文件

在 Linux 临时目录把程序保存为 `file_copy.c`。这个版本只创建新目标文件，以 `O_CREAT | O_EXCL` 拒绝覆盖已有目标，包括输入文件本身。程序面向普通文件，不复制权限和时间戳等元数据。若复制中途失败，新建的目标可能保留部分数据。

~~~c
#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

static int copy_data(int source, int destination)
{
    char buffer[4096];

    for (;;) {
        ssize_t count = read(source, buffer, sizeof buffer);
        if (count < 0) {
            if (errno == EINTR)
                continue;
            perror("read");
            return -1;
        }
        if (count == 0)
            return 0;

        ssize_t offset = 0;
        while (offset < count) {
            ssize_t written = write(destination, buffer + offset,
                                    (size_t)(count - offset));
            if (written < 0) {
                if (errno == EINTR)
                    continue;
                perror("write");
                return -1;
            }
            if (written == 0) {
                fputs("write made no progress\n", stderr);
                return -1;
            }
            offset += written;
        }
    }
}

int main(int argc, char **argv)
{
    if (argc != 3) {
        fprintf(stderr, "usage: %s SOURCE DEST\n", argv[0]);
        return EXIT_FAILURE;
    }

    int source = open(argv[1], O_RDONLY);
    if (source < 0) {
        perror("open source");
        return EXIT_FAILURE;
    }

    int destination = open(argv[2], O_WRONLY | O_CREAT | O_EXCL, 0644);
    if (destination < 0) {
        perror("open destination");
        if (close(source) < 0)
            perror("close source");
        return EXIT_FAILURE;
    }

    int result = copy_data(source, destination);
    if (close(destination) < 0) {
        perror("close destination");
        result = -1;
    }
    if (close(source) < 0) {
        perror("close source");
        result = -1;
    }

    return result == 0 ? EXIT_SUCCESS : EXIT_FAILURE;
}
~~~

在独立临时目录运行以下命令。预期首次复制后 `cmp` 成功且没有输出；再次使用同一目标名时，程序应报告目标已存在并以非零状态退出。

~~~bash
gcc -Wall -Wextra -std=c11 -g file_copy.c -o file_copy
printf 'hello Linux\n' > input.txt
./file_copy input.txt output.txt
cmp input.txt output.txt
~~~

## 系统 I/O 与标准 I/O

| 维度 | `read`、`write` | `fread`、`fwrite`、`printf` 等 |
| --- | --- | --- |
| 操作对象 | 文件描述符 `int` | 标准库流 `FILE *` |
| 数据缓冲 | 调用者提供缓冲区 | C 标准库的流通常有额外的用户态缓冲 |
| 典型用途 | 套接字、设备和底层 I/O | 格式化文本与通用的文件处理 |

一次 `printf` 不一定触发一次 `write`。输出何时离开标准库缓冲取决于缓冲模式、刷新和关闭等条件。可在 Linux 上使用 `strace` 观察程序实际发出的系统调用。

## 常见问题与小结

**为什么成功的 `write` 仍要检查返回值？** 返回的正数是本次实际写入的字节数。若小于请求长度，应推进偏移，继续写入余下数据。不能从缓冲区开头重写已经写入的部分。

FD 提供统一接口，具体的读写、阻塞和定位行为仍取决于 I/O 对象。

## 参考手册

- [open(2)](https://man7.org/linux/man-pages/man2/open.2.html)
- [write(2)](https://man7.org/linux/man-pages/man2/write.2.html)
- [close(2)](https://man7.org/linux/man-pages/man2/close.2.html)
