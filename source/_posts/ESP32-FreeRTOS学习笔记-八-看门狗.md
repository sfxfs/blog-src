---
title: ESP32-FreeRTOS学习笔记(八)--看门狗
date: 2022-10-25 21:44:12
tags: [ESP32, FreeRTOS]
---

 需要知道的是：

- Arduion-ESP32 默认在 Core 0 的 IDLE 任务开启了看门狗 时间为 5000 ticks = 5秒（若IDLE(0)无法运行，所以不能喂狗，将导致系统5秒后重启）
- Core 0 和 Core 1 都运行了 FreeRTOS 的IDLE任务，优先级为 0（IDLE任务是用于清理被删除任务的内存）
- Core 1 loopBack任务就是Arduino的 setup 和 loop 优先级为 1

API：需要包含 *esp_task_wdt.h* 文件

|        函数         |                  描述                  |
| :-----------------: | :------------------------------------: |
|  esp_task_wdt_init  |         初始化任务看门狗计时器         |
| esp_task_wdt_deinit |        取消初始化任务监视计时器        |
|  esp_task_wdt_add   |       将任务订阅到任务监视计时器       |
| esp_task_wdt_reset  | 当前正在运行的任务重置任务看门狗计时器 |
| esp_task_wdt_delete |      从任务监视计时器取消订阅任务      |
| esp_task_wdt_status |  查询任务是否已订阅任务监视程序计时器  |

官方使用例：

```c++
#include "esp_task_wdt.h"

void a_task(void *arg)
{
    esp_task_wdt_add(NULL);	//给当前任务添加看门狗

    while(1){
        esp_task_wdt_reset();	//喂狗
        vTaskDelay(pdMS_TO_TICKS(100));
    }
    esp_task_wdt_delete(NULL);	//删除当前任务的看门狗
    vTaskDelete(NULL);	//删除自身任务
}

void app_mian(void)
{
    esp_task_wdt_init(TWDT_TIMEOUT_S, false);	//arduino上不需要init，因为官方已经写到你程序前面了
    esp_task_wdt_add(xTaskGetIdleTaskHandleForCPU(0));	//为IDLE开启任务看门狗
    esp_task_wdt_delete(xTaskGetIdleTaskHandleForCPU(0));	//删除IDLE任务的看门狗
    esp_task_wdt_status(xTaskGetIdleTaskHandleForCPU(0));	//因为IDLE任务看门狗被删除所以会返回ESP_ERR_NOT_FOUND
    esp_task_wdt_deinit();	//关闭任务看门狗
}
```

下面给出给所有狗喂食的函数：

```c++
//feedTheDogInAllTasks()
//通过寄存器给所有任务的狗喂时
#include "soc/timer_group_struct.h"
#include "soc/timer_group_reg.h"
void feedTheDogInAllTasks() { //通过寄存器给所有任务的狗喂时
  // feed dog 0
  TIMERG0.wdt_wprotect = TIMG_WDT_WKEY_VALUE; // write enable
  TIMERG0.wdt_feed = 1;                     // feed dog
  TIMERG0.wdt_wprotect = 0;                 // write protect
  // feed dog 1
  TIMERG1.wdt_wprotect = TIMG_WDT_WKEY_VALUE; // write enable
  TIMERG1.wdt_feed = 1;                     // feed dog
  TIMERG1.wdt_wprotect = 0;                 // write protect
}
```

