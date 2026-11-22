---
title: 文件偏移与 lseek
description: 理解 SEEK_SET、SEEK_CUR、SEEK_END，以及非法偏移、不可定位对象和文件空洞。
---

# 文件偏移与 lseek

> 学习状态：已讨论。示例为参考补充。

## 学习目标

- 根据 `whence` 和 `offset` 推导最终文件位置。
- 区分非法偏移、不可定位对象和合法的 EOF 之外定位。

## 定位规则

Linux 中的函数原型如下。`lseek` 改变的是 FD 所引用的打开文件描述中的偏移，因而可能影响引用同一打开文件描述的其他 FD。

~~~c
#include <unistd.h>

off_t lseek(int fd, off_t offset, int whence);
~~~

| `whence` | 新偏移 |
| --- | --- |
| `SEEK_SET` | `offset`，从文件开头计算 |
| `SEEK_CUR` | 当前偏移加 `offset` |
| `SEEK_END` | 当前文件长度加 `offset` |

成功返回新的偏移；失败返回 `(off_t)-1`，设置 `errno`，且不改变文件偏移。

## 常见问题：非法偏移会怎样？

- **结果小于零**：对普通文件失败并报告 `EINVAL`。相对偏移为负并不一定出错，例如从长度为 10 字节的文件末尾向前移动 2 字节，结果是 8。
- **结果无法用 `off_t` 表示**：可能返回 `EOVERFLOW`。
- **对象不可定位**：管道、FIFO、套接字上的 `lseek` 失败并报告 `ESPIPE`。
- **位置超过文件末尾**：对可定位的普通文件通常合法。只改偏移不会增加文件长度；在该位置写入数据才可能产生空洞，读取空洞区域会得到零字节值。

## 示例：分辨负偏移和 EOF 之外定位

在 Linux 临时目录保存为 `seek_demo.c`。示例使用 `O_EXCL` 保护已有文件，用 `fstat` 检查定位之后文件长度是否仍是零。

~~~c
#define _POSIX_C_SOURCE 200809L
#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <unistd.h>

static int check_offsets(int fd)
{
    if (lseek(fd, -1, SEEK_SET) != (off_t)-1) {
        fputs("negative position unexpectedly accepted\n", stderr);
        return -1;
    }
    if (errno != EINVAL) {
        perror("negative SEEK_SET");
        return -1;
    }
    puts("negative position rejected with EINVAL");

    off_t position = lseek(fd, 4096, SEEK_SET);
    if (position == (off_t)-1) {
        perror("seek beyond EOF");
        return -1;
    }

    struct stat info;
    if (fstat(fd, &info) < 0) {
        perror("fstat");
        return -1;
    }
    if (position != 4096 || info.st_size != 0) {
        fputs("unexpected file position or size\n", stderr);
        return -1;
    }
    puts("position = 4096, file size = 0");
    return 0;
}

int main(void)
{
    int fd = open("seek_demo.bin", O_CREAT | O_EXCL | O_RDWR, 0644);
    if (fd < 0) {
        perror("open");
        return EXIT_FAILURE;
    }

    int result = check_offsets(fd);
    if (close(fd) < 0) {
        perror("close");
        return EXIT_FAILURE;
    }
    return result == 0 ? EXIT_SUCCESS : EXIT_FAILURE;
}
~~~

~~~bash
gcc -Wall -Wextra -std=c11 -g seek_demo.c -o seek_demo
./seek_demo
~~~

在支持定位的普通文件系统上，预期负偏移被拒绝，随后偏移为 `4096` 而文件大小仍为 `0`。每次重复练习可使用新的临时目录。

## 小结

判断定位是否合法，要同时看对象类型和计算后的最终偏移。先检查返回值，再用 `errno` 区分失败原因。偏移的共享关系见[文件描述符与文件 I/O](./04-file-descriptors-and-io.md)。

## 参考手册

- [lseek(2)](https://man7.org/linux/man-pages/man2/lseek.2.html)
