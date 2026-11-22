---
title: 终端命令与基本操作
description: Linux 终端的目录、权限、软件包、重定向、管道和系统查看命令。
---

# 终端命令与基本操作

> 学习状态：已讨论。命令按用途整理，可在 Ubuntu 的 Bash 中复习。

## 路径与文件

下表的示例假定相应文件或目录存在。涉及新建、覆盖或删除的练习请在独立临时目录中进行。

| 命令 | 用途 | 示例 |
| --- | --- | --- |
| `pwd`、`ls`、`cd` | 查看和切换工作目录 | `pwd`、`ls -lah`、`cd ~/projects` |
| `mkdir`、`touch` | 创建目录、创建空文件或更新时间戳 | `mkdir -p labs/file_io`、`touch note.txt` |
| `cp`、`mv`、`rm` | 复制、移动或删除 | `cp a.txt b.txt`、`mv old.c new.c`、`rm test.tmp` |
| `find`、`grep` | 按条件定位文件、按内容匹配行 | `find . -name '*.c'`、`grep -n 'main' demo.c` |
| `cat`、`less` | 输出或分页查看文本 | `cat note.txt`、`less README.md` |
| `head`、`tail` | 查看文件开头或结尾 | `head -n 10 app.log`、`tail -n 30 app.log` |

`rm -r` 会递归删除，通常不经过回收站。执行前用 `pwd` 和 `ls` 确认目标路径，避免在路径不明时使用 `-rf`。

## 权限与软件包

~~~bash
ls -l demo.c
chmod u+x run.sh
chmod 644 note.txt
chmod 755 run.sh
~~~

`r=4`、`w=2`、`x=1`，数字的三个位置分别代表所有者、所属组和其他用户。`644` 对应 `rw-r--r--`，`755` 对应 `rwxr-xr-x`。

在 Ubuntu 上，`sudo apt update` 刷新包索引，`sudo apt install gdb` 安装指定软件包，`sudo apt upgrade` 升级已安装的软件。先核对权限和操作范围，再按需使用 `sudo`。

## 重定向与管道

~~~bash
printf 'hello\n' > out.txt
printf 'more\n' >> out.txt
./app 2> error.log
./app > all.log 2>&1
ps aux | grep '[m]yapp'
~~~

- 标准输入、标准输出、标准错误通常对应 FD `0`、`1`、`2`。详见[文件描述符与文件 I/O](./04-file-descriptors-and-io.md)。
- `>` 通常截断原文件，`>>` 追加。重定向按顺序生效，`2>&1` 把标准错误接到当时的标准输出。
- `|` 把前一个命令的标准输出接到后一个命令的标准输入。上例的模式让匹配结果避开通常会出现的 `grep` 自身。

## 进程、系统和网络

| 命令 | 用途 |
| --- | --- |
| `ps aux`、`top` | 查看进程快照或实时变化 |
| `kill -TERM 1234` | 对 PID 1234 发送终止请求，先核对实际目标 |
| `uname -a`、`df -h`、`free -h` | 查看内核信息、磁盘空间和内存使用 |
| `ip addr`、`ss -tuln` | 查看地址和监听中的 TCP/UDP 套接字 |

## 终端快捷键

| 快捷键或命令 | 用途 |
| --- | --- |
| `Tab` | 补全命令或路径 |
| `Ctrl+C`、`Ctrl+Z` | 通常分别向前台进程组发送 `SIGINT`、`SIGTSTP` |
| `Ctrl+D` | 在典型终端输入配置下，当输入缓冲为空时可让读取获得 EOF |
| `Ctrl+R`、`history` | 搜索或查看历史命令 |
| `Ctrl+A`、`Ctrl+E` | 在常见的 Bash 默认按键绑定下，移到行首或行末 |

## 小结与自测

先确认路径和目标，再运行会改动文件的命令。自测：怎样把程序的标准输出与标准错误写入同一个日志，同时保留日志的已有内容？
