---
title: ESP32-IDF 非易失性存储 NVS (一) 入门
date: 2022-12-19 13:02:40
tags: [ESP32, IDF]
---

# 介绍

NVS格式就是一种flash的文件管理方式，因为他自身这种键值对的数据结构有较大的空间开销，所有不适合很长的数据（重复的key会浪费空间），而适合一对一对的这种短的数据（优势应该是方便查管理）.在ESP32上NVS是基础，比如WIFI都会使用到NVS来存储配置文件。[乐鑫官方文档](https://docs.espressif.com/projects/esp-idf/zh_CN/latest/esp32/api-reference/storage/nvs_flash.html)

# API

| 函数名                                                       | 描述                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------- |
| nvs_flash_init()                                             | 挂载NVS                                              |
| nvs_flash_deinit()                                           | 卸载NVS                                              |
| nvs_open(const char* namespace_name, nvs_open_mode_t open_mode, nvs_handle_t *out_handle) | 打开对应namespace的NVS                               |
| nvs_close(nvs_handle_t *out_handle)                          | 关闭NVS                                              |
| nvs_get_xx(nvs_handle_t c_handle, const char* key, xx* out_value) | 获取数据(如果对应key数据不存在则out_value不会被修改) |
| nvs_set_xx(nvs_handle_t handle, const char* key, xx value))  | 写入数据                                             |
| nvs_commit(nvs_handle_t handle)                              | 写入所有数据(加在所有set后面)                        |

# 实例

```c
#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs.h"
#include "nvs_flash.h"
#include "esp_log.h"

#define NS_TEST "ns-test"
#define KEY_TEST "key-test"

nvs_handle_t testhandle;

uint16_t count = 0;

void app_main(void)
{
    vTaskDelay(1000/portTICK_PERIOD_MS);
    nvs_flash_init();
    nvs_open(NS_TEST, NVS_READWRITE, &testhandle);
    nvs_get_u16(testhandle, KEY_TEST, &count);
    ESP_LOGI("NVS", "the count %d", count);
    nvs_set_u16(testhandle, KEY_TEST, ++count);
    nvs_commit(testhandle);
    nvs_close(testhandle);
    nvs_flash_deinit();
}
```

# BLOB

可以存放任何类型的数据,如结构体和字符串

```c
esp_err_t nvs_set_blob(nvs_handle_t c_handle,
                       const char* key,
                       const void* value,
                       size_t length)
```

用法:

```c
typedef struct {
    char ssid[50];
    char password[50];
} ap_t;

ap_t ap1;
ap_t aps[max_ap];

nvs_set_blob(my_handle, "test", ap1, sizeof(ap1));
nvs_set_blob(my_handle, "tests", aps, sizeof(aps));
```

