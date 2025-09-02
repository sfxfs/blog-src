---
title: WSL下编译rv110x系列芯片固件
date: 2024-11-20 19:39:55
tags: [Linux, Luckfox, RV110x, WSL]
---

## 介绍

系统使用 Windows 11 WSL2 Ubuntu 24.04

## 遇到的问题

### 一、没有 python 这个命令

是因为安装了 python3 但没有 python 没有指向它

`sudo apt install python-is-python3`

安装该包来解决这个问题

### 二、PATH 包含空格

WSL 把 windows 的 PATH 也一起弄到 Linux 内了

修改 WSL 配置文件 `/etc/wsl.conf` 添加

```
[interop]
appendWindowsPath=false
```

关闭 wsl 八秒以上再启动即可解决

### 三、找不到 cpio 模块

安装一下 `sudo apt install cpio`
