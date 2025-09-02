---
title: Nanopi neo core 作为下位机首次配置流程
date: 2023-05-03 20:18:30
tags: [Linux, NanoPi, SBC]
---

 [原本的配置流程链接](https://detail.yinxiang.com/index.html?guid=ba0bc618-4d29-4d47-ac6c-94ee43c146a3&loginName=zz&token=V1-5045541-MYjTa8q0ZLek6LeI38RvqD5jI24sVIuET6GRx9SRx%2B6LylYFWfpEohLy%2FGvK2k1C4rP7Xzg8KW3ITmaY3ABkQrRRKV0qmmvJzOQxupLrrBHjOgO1kKvbb0qVhVeAmkvE%2F4Zh8sYgbnZuLLj0qaPvTHhnkf37MKJ7Y2i%2FCt54j8WhHzSEjBmO0qGrJSZVbxJ0&at=false&platformType=1&deviceinfo=%7B%22application%22%3A%22android_miniapp%22%2C%22applicationVersion%22%3A%221.1.22%22%2C%22platform%22%3A%22microsoft%22%2C%22platformVersion%22%3A%22Windows%2011%20x64%22%2C%22locale%22%3A%22zh_CN%22%7D&unionId=f5d82db79639969b9e276eb18f7d6c98&userId=36590286&sessionId=011Yboll2OePB94SKHll2I8bMS3Ybol1&channelId=wx75425a38a3ed6402)

# 准备工作

## 硬件准备

1. NanoPi NEO Core 板子
2. 4G 及以上的 TF 卡和读卡器
3. USB 转串口
4. 水下机器人主板（提供网口和供电）

## 软件准备

1. 安装 SSH 软件（较新的 Windows 系统一般自带，也可以去下载专门的 SSH 软件，如：`putty` 、`finalshell`、`MobXterm`等等）
2. 串口终端（如 `putty` 、`MobXterm` 等等）
3. 前往 [官方 WiKi](https://wiki.friendlyelec.com/wiki/index.php/NanoPi_NEO_Core/zh) 下载系统镜像，注意要下载 带 eflasher 的 Ubuntu xenial 4.14 ，即文件名类似于 `h3_ eflasher friendlycore-xenial_ 4.14_ armhf 20210618.img.zip` 的镜像文件

# 开始烧录固件

（全新的 Nano Pi 会内置该固件，可以直接跳到**系统配置**）

## 向 SD 卡写入镜像

使用镜像写入工具（如 `win32diskimager`），选择指定镜像烧录（烧录前请确保 SD 卡只有一个分区）

## 使用串口连接 Nano Pi

请将 USB 转串口连接到 Nano Pi 的 RX0 和 TX0 引脚，并且共地，引脚图如下：

![](https://wiki.friendlyelec.com/wiki/images/5/53/NEO_Core_pinout-02.jpg)

## 电脑连接SBC

1. 将烧录好的 SD 卡插入 Nano Pi

2. 使用 Nano Pi 上的 USB 给板子供电

3. 将 USB 转串口连接到电脑的串口终端

4. 输入账户密码进行登陆（用户账号和密码都是 `pi` ，root 用户密码是 `fa`），进入系统后在终端输入 `su root` 切换 root 用户，后执行 `eflasher` 命令进入如下界面：![](https://wiki.friendlyelec.com/wiki/images/0/09/Eflasher_friendlycore1.jpg)

5. 输入“１”后按回车，选择烧写 friendlycore 系统到 eMMC 上后，会提示如下信息：![](https://wiki.friendlyelec.com/wiki/images/6/60/Eflasher_friendlycore2_h3.jpg)

6. 输入“yes”，确定进行烧写：

   ![](https://wiki.friendlyelec.com/wiki/images/0/0c/Eflasher_friendlycore3.jpg)

7. 等待烧写完毕后，断电并从卡槽中取出 TF 卡。

# 系统配置

## 硬件连接

将 Nano Pi 插入调试主板后，给其供电并连接网口至路由器

## 电脑端操作

1. 到路由器后台查看 Nano Pi 的 IP 地址，使用 SSH 工具连接至 Nano Pi （用户账号和密码都是 `pi` ，root 用户密码是 `fa`）

2. 更换国内软件源，终端输入 `sudo nano /etc/apt/sources.list` 后修改为如下内容：

   ```
   deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial main restricted universe multiverse
   deb http://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/ xenial-updates main restricted universe multiverse
   ```

3. 更新软件源（依次输入以下命令）：

   ```bash
   sudo apt-get clean
   
   sudo apt-get update
   
   sudo apt-get upgrade
   
   #可能需要较长时间，期间不能关闭 SSH 连接
   ```

4. 安装必备软件（依次输入以下命令）：

   ```bash
   sudo apt-get install gdb htop cmake unzip i2c-tools autoconf automake libtool
   
   sudo apt-get install libgstreamer*
   
   sudo apt-get install libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-doc gstreamer1.0-tools gstreamer1.0-x gstreamer1.0-alsa gstreamer1.0-pulseaudio
   
   #可能有些软件包找不到了，请在命令中删除那些软件包的名字再尝试安装
   ```

5. 到 Github 下载 rovmaster 的源码 zip 压缩包，使用网络传输到 Nano Pi ，在 SSH 终端中使用 `unzip` 命令进行解压

6. 解压后进入 **rov-master-main** 文件夹，输入 `sudo chmod +x build.sh` 后输入 `sudo ./build.sh` 进行依赖编译

7. 显示 *构建完成* 后，输入命令 `make` 后**没有错误**后，再输入一次 `make` 就会产生可执行文件 `rovmaster`

7. 使能 `spi1` 外设，输入 `udo npi-config` 命令后到 `\> Advanced Options` 中使能相关 SPI 设备

8. 修改静态 IP ，输入命令 `sudo nano /etc/network/interfaces` 后将原文件内容注释掉后加上：

   ```
   allow-hotplug eth0
   iface eth0 inet static
   address 192.168.137.219
   netmask 255.255.255.0
   gateway 192.168.137.1
   dns-nameservers 192.168.137.1
   ```

9. 配置结束
