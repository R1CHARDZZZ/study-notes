---
title: Linux C 开发与编译调试
description: 用 GCC 编译、用 Make 与 CMake 管理构建、用 GDB 调试，并用 Git 管理版本。
---

# Linux C 开发与编译调试

> 学习状态：已讨论。记录中的环境为历史快照。

## 环境与版本

原稿记录的是 Windows 主机上的 VMware Ubuntu 24.04 虚拟机，工具版本为 GCC 13.3.0、CMake 3.28.3、GDB 15.1 和 Git 2.43.0。使用前可在 Ubuntu 中查看实际版本。

~~~bash
uname -a
gcc --version
cmake --version
gdb --version
git --version
~~~

## GCC 单文件编译

将以下参考示例保存为 `main.c`，在临时练习目录中编译。

~~~c
#include <stdio.h>

int main(void)
{
    const int value = 42;
    printf("value = %d\n", value);
    return 0;
}
~~~

~~~bash
gcc -Wall -Wextra -std=c11 -g -O0 main.c -o app
./app
~~~

预期输出为 `value = 42`。`-Wall -Wextra` 启用常见警告，`-std=c11` 选择 C11，`-g` 生成调试信息，`-O0` 关闭优化，`-o` 指定输出名称。

## Make 与 CMake

GCC 执行编译与链接。Make 根据目标依赖运行相应命令。CMake 根据项目配置生成 Make、Ninja 等构建系统所需的文件，并可管理跨平台或多目录构建。

在 `main.c` 同目录创建 `CMakeLists.txt`。

~~~cmake
cmake_minimum_required(VERSION 3.16)
project(linux_lab C)
set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)
add_executable(linux_lab main.c)
~~~

~~~bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
./build/linux_lab
~~~

这里的执行路径适用于 Ubuntu 上常见的单配置生成器，例如 Unix Makefiles。

## GDB 入门

运行 `gdb ./app`，然后在 GDB 中执行以下命令。示例先停在 `main`，再执行到 `value` 初始化之后读取它。

~~~text
break main
run
next
print value
backtrace
continue
quit
~~~

`next` 单步越过函数调用，`step` 可进入有可用调试信息的函数。调试时如果变量值显示不可用，先确认断点位置、作用域和编译优化级别。

## Git 入门

在已初始化的练习仓库里运行。只暂存本次要归档的文件。

~~~bash
git status
git diff
git add -- main.c CMakeLists.txt
git diff --cached
git commit -m "study: add C toolchain example"
git log --oneline -5
~~~

`git commit` 创建本地历史记录。向已配置的远端同步是独立的操作。

## 小结与自测

先用 GCC 编译一个文件，再用 CMake 重现构建。自测：为什么用 `-g -O0` 编译的程序通常更适合练习 GDB 单步调试？
