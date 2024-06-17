---
title: ESP32-IDF 自定义分区表的编写
date: 2023-01-02 20:31:05
tags: ESP32 IDF
---

# 内容

```
# Name,   Type, SubType, Offset,  Size, Flags
nvs,      data, nvs,     ,        0x6000,
phy_init, data, phy,     ,        0x1000,
factory,  app,  factory, ,        1M,
```

第一个为NVS分区,大小为24K多一点;第三个就是存放程序的地方,大小为1MByte

我们在底下多加一行NVS

```
my_nvs, data, nvs, , 1M,
```

将这些内容保存为 `partitions.csv` 后放在项目根目录并修改 Manuconfig 里面使用的分区表.

# 使用

这里以NVS为例:

```c
nvs_handle_t testhandle;
nvs_open_from_partition("my_nvs", "test_name", NVS_READWRITE, &testhandle);

...
```

