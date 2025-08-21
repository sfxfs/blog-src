---
title: ESP32-FreeRTOS学习笔记(六)--任务的状态和管理
date: 2022-10-21 20:40:36
tags: [ESP32, FreeRTOS]
---

 介绍了任务的全部状态和对相关任务进行管理。

## 1.任务的状态

- Blocked阻塞态

  任务会在进入block的函数处停止，并且不占用CPU资源

- Suspended挂起态

  任务会完全暂停，不占用CPU资源

- Ready就绪态

  准备运行该任务

- Running运行态

  任务运行中

## 2.任务的管理

会使用到如下函数API：

```c++
BaseType_t xTaskCreate(,,,,,); //任务创建
void vTaskDelete( TaskHandle_t xTask ); //任务删除 
void vTaskSuspend( TaskHandle_t xTaskToSuspend ); //任务暂停
void vTaskResume( TaskHandle_t xTaskToResume ); //任务恢复
//相关参数都为要操作任务的句柄，为NULL时则操作当前任务
```

下面是使用实例：

```c++
TaskHandle_t theTestHandle = NULL; //Task Handler

xTaskCreate(radioBilibili, "The　test code", 1024 * 8, NULL, 1, &theTestHandle);	//创建任务
vTaskSuspend(theTestHandle);	//挂起任务
vTaskDelay(1000);
vTaskResume(theTestHandle);	//恢复任务
vTaskDelete(theTestHandle);	//删除任务
theTestHandle = NULL; //最后还需要手动将handler设置为空
```
