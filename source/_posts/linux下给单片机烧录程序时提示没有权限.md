---
title: linux下给单片机烧录程序时提示没有权限
date: 2022-09-21 12:40:22
description: 解决Linux系统下单片机开发时USB串口权限不足的问题，包括用户组配置和udev规则设置
tags: [Arduino, PlatformIO, Linux, 权限管理, USB串口, 开发环境]
categories: [嵌入式开发, Linux]
cover: 
top_img: 
---

  这是因为该用户所在的用户组不包含USB的相关权限，我们可以将用户添加到有权限的用户组，或者将对应串口开放给所有人使用。

## 添加到dialout用户组

打开终端输入:`sudo usermod -aG dialout USERNAME`

## 开放串口权限

添加如下内容到 */etc/udev/rules.d/* 下的rules文件:

```sh
KERNEL==“ttyACM[0-9]*”, MODE=“0666”
KERNEL==“ttyUSB[0-9]*”, MODE=“0666”
```

最好自己创建一个新文件,名称要符合规范。

## 单独给串口开放权限

使用管理员权限:

`sudo chmod 777 /dev/ttyACM0`

缺点是每次插拔设备后都需要重新更改权限。
