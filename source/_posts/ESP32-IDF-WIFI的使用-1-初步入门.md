---
title: ESP32-IDF WIFI的使用(1) 初步入门
date: 2023-01-03 13:41:36
tags: [ESP32, IDF]
---

WiFi相关文档参阅 [乐鑫IDF编程文档](https://docs.espressif.com/projects/esp-idf/zh_CN/release-v5.0/esp32/api-guides/wifi.html)

具体启动流程如下:

![](https://docs.espressif.com/projects/esp-idf/zh_CN/release-v5.0/esp32/_images/seqdiag-3539a23193af2f08aeb412fd527f18a5a1b2fd43.png)

```c
ESP_ERROR_CHECK(esp_netif_init());  //创建一个 LwIP 核心任务，并初始化 LwIP 相关工作
    ESP_ERROR_CHECK(esp_event_loop_create_default());   //创建一个系统事件任务，并初始化应用程序事件的回调函数。在此情况下，该回调函数唯一的动作就是将事件中继到应用程序任务中
    ESP_ERROR_CHECK(esp_netif_create_default_wifi_sta());   //创建有 TCP/IP 堆栈的默认网络接口实例绑定 station
    wifi_init_config_t wifi_init_config = WIFI_INIT_CONFIG_DEFAULT;
    ESP_ERROR_CHECK(esp_wifi_init(&wifi_init_config));

    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA));

    ESP_ERROR_CHECK(esp_wifi_start());

    wifi_country_t country_config = {
        .cc = "CN",
        .schan = 1,
        .nchan = 13,
        .policy = WIFI_COUNTRY_POLICY_AUTO,
    };
    ESP_ERROR_CHECK(esp_wifi_set_country(&country_config));

...
```

