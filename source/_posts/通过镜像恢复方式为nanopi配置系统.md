---
title: 通过镜像恢复方式为nanopi配置系统
date: 2022-10-27 14:29:44
tags: [underwater, robot, h3, nanopi]
---

## 1.请烧录如下固件

`nanopi-neo-core_eflasher_friendlycore-xenial_4.14_armhf_YYYYMMDD.img.zip`

烧录完的SD卡将会有以下三个分区(SD必须大于16G)

- boot
- rootfs
- FriendlyARM

Windows下可能需要相关软件才能读取到所有分区。

## 2.通过串口控制nanopi

请按照图示连接nanopi，串口请连接到UART0，波特率必须为115200

![](https://wiki.friendlyelec.com/wiki/images/5/53/NEO_Core_pinout-02.jpg)

![](https://wiki.friendlyelec.com/wiki/images/b/b4/USB2UART-NEO-Core.jpg)

插入SD卡，并通过串口连接到电脑进入终端（如果串口显示为空可以尝试回车几次）：

```
普通用户：
	用户名: pi
	密码: pi

Root用户：
	用户名: root
	密码: fa
```

在终端以超级管理员身份执行指令 `eflasher` 后有如下界面：

```shell
----------------------------------------------------------------------
  EFlasher v1.2 b190111 running on NanoPC-T4
    Doc: http://wiki.friendlyelec.com/wiki/index.php/EFlasher
    eMMC: 14.56 GB
----------------------------------------------------------------------
  # Select an OS to install:
    1) Android 8
   
  # Select your backup target device:
     tf) [*] TF card  (/dev/mmcblk0p1 - 4.27 GB free - 5.67 GB total - fuseblk)
    usb) [ ] USB disk  (<none>)
   
  # Backup eMMC flash to TF card:
    Not enough free disk space on your TF card
   
  # Restore eMMC flash from backup file:
    No backup files found
   
  # Configure automatic job:
    aui) Automatic installing (Curr:Off)
    aur) Automatic restoring (Curr:Off)
   
  # Format drive
    ftf) Format TF card back to original size
----------------------------------------------------------------------
>>> Enter an option (1/tf/usb/aui/aur/ftf) :
```

若SD卡为第一次使用请先输入ftf，然后关机转至电脑，向SD第三个分区放入 `nanopi-neo-core-emmc.raw` 备份文件再重新开启并进入 nanopi 执行 `r1` 选项，否则直接输入 `r1` 选项并回车即可烧写镜像。

注意：烧写完后的nanopi为`静态ip 192.168.137.219`
