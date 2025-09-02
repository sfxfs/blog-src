---
title: RockPi 5B Armbian 首次开机设置流程
date: 2023-04-03 20:35:03
tags: [Linux, RockPi, Armbian]
---

## 镜像烧录

下载 Armbian 最新镜像 *Armbian_x.x.x_Rock-5b_jammy_legacy_x.x.x_gnome_desktop.img.xz* 烧录到SD内（推荐使用 Raspberry Pi Imager）

## 安装后相关设置

1. 首先启动3D加速

   ```bash
   sudo add-apt-repository ppa:liujianfeng1994/panfork-mesa
   sudo add-apt-repository ppa:liujianfeng1994/rockchip-multimedia
   sudo apt update
   sudo apt dist-upgrade
   sudo apt install kodi
   ```

2. 如果要使用Docker

   ```bash
   update-alternatives --set iptables /usr/sbin/iptables-legacy
   update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
   ```

3. 安装中文字体（后把shell改为中文才不会乱码）

   ```bash
   sudo apt-get install ttf-wqy-microhei
   sudo apt-get install ttf-wqy-zenhei
   ```

   需要GUI(Gnome)也为中文可以到设置里切换语言，会自动安装

4. 安装风扇接口驱动

   ```bash
   git clone https://github.com/lukaszsobala/fan-control-rock5b
   cd fan-control-rock5b
   make package
   sudo dpkg -i fan-control*.deb
   sudo systemctl enable fan-control
   systemctl start fan-control
   ```

5. 安装HDMI采集卡驱动

   ```bash
   sudo apt install gstreamer1.0-rockchip1 gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly
   ```

   4K查看(请在显卡控制菜单中选择yuv420格式输出):

   ```bash
   gst-launch-1.0 -e v4l2src device=/dev/video0 ! videoconvert ! 'video/x-raw,format=NV12,width=3840,height=2160' ! autovideosink
   ```

   4K录制+监看(请在显卡控制菜单中选择yuv420格式输出):

   ```bash
   gst-launch-1.0 -e v4l2src device=/dev/video0 ! 'video/x-raw,format=NV12,width=3840,height=2160' ! tee name=t t. ! mpph265enc bps=20000000 bps-max=40000000 rc-mode=vbr ! h265parse ! mp4mux name=mux ! filesink location=4k60hdmiin.mp4 alsasrc device=default ! opusenc bitrate=192000 ! mux. t. ! queue leaky=1 ! autovideosink sync=false
   ```

想要修改视频码率请更改mpph265enc bps=和bps-max=,单位bit/s
修改音频码率请更改opusenc bitrate=,单位bit/s
不需要录音或开启录制后卡死可以把`alsasrc device=default ! opusenc bitrate=192000 ! mux.` 删掉
不需要监看可以把`t. ! queue leaky=1 ! autovideosink sync=false`删掉
需要h264格式请把mpph265enc改成mpph264enc 并把h265parse改成h264parse
如果报错`streaming stopped, reason not-negotiated (-4)` 首先运行dmesg看看有没有报错刷屏, 如果有,那么建议换一根好点的HDMI线. 否则检查电脑输出分辨率和格式.
想要其它格式和分辨率要把`'video/x-raw,format=NV12,width=3840,height=2160'`作对应修改! 其中format建议NV12/NV16/BGR/RGB挨个试一遍
1080p下采集的刷新率其实不受限于60Hz, 可以在电脑上自行修改.

6. A8型号的蓝牙驱动

   ```bash
   sudo su
   nano /etc/modprobe.d/blacklist.conf
   
   #最后一行加上以下这些
   blacklist pgdrv
   blacklist btusb
   blacklist btrtl
   blacklist btbcm
   blacklist btintel
   
   systemctl restart bluetooth
   ```

7. 其他定制设置

   ```bash
   sudo armbian-config
   ```

   
