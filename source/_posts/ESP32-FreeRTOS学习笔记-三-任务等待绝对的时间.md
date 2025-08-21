---
title: ESP32-FreeRTOS学习笔记(三)--任务等待绝对的时间
date: 2022-10-21 19:37:49
tags: [ESP32, FreeRTOS]
---

在任务中我们可以使用 vTaskDelay(pdTICKS_TO_MS(delayTimeMS)) 来延时对应时间，但是实际上这个延迟将会有误差，如果我们的任务对频率要求更高的话就可以使用如下函数：

```c++
vTaskDelayUntil(&xLastWakeTime, xFrequency);
//xLastWakeTime为调用该函数时的tickCount，xFrequency为需要等待的tick，期间函数将会阻塞，结束时tickCount的值会为xLastWakeTime + xFrequency
```

下面是使用样例：

```c++
//使用前准备
//最后一次唤醒的tick count，第一次使用需要赋值
//以后此变量会由vTaskDelayUntil自动更新
TickType_t xLastWakeTime = xTaskGetTickCount();

const TickType_t xFrequency = pdTICKS_TO_MS(1000); // 间隔 1000 ms = 3 seconds

//使用延迟函数
Serial.println(xTaskGetTickCount());
vTaskDelayUntil(&xLastWakeTime, xFrequency);
Serial.println(xTaskGetTickCount());	//可以看到TickCount加了xFrequency
```

