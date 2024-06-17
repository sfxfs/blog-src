---
title: ESP32-FreeRTOS学习笔记(五)--任务内存优化
date: 2022-10-21 20:24:02
tags: FreeRTOS
---

 介绍了如何获取剩余内存堆空间，如何准确分配内存。

## 1.获取剩余内存堆空间

下面两个是由ESP官方提供的函数

```c++
int ESP.getHeapSize()	//获取ESP32的总堆空间，返回int

int ESP.getFreeHeap()	//获取ESP32剩余堆空间，返回int
```

下面介绍获取单个任务的剩余堆空间

```c++
int uxTaskGetStackHighWaterMark(taskHandle)	//获取指定任务的剩余内存，参数为NULL时获取当前任务的剩余内存
```

下面是一个例子

```c++
int heapSize = ESP.getHeapSize();
Serial.print("Total Heap Size:  ");
Serial.print(heapSize);
Serial.println(" Bytes");

int heapFree = ESP.getFreeHeap();
Serial.print("Free Heap Size:  ");
Serial.print(heapFree);
Serial.println(" Bytes");
Serial.println("");

int taskMem = 1024;

xTaskCreate(task, "", taskMem, NULL, 1, &taskHandle);

vTaskDelay(2000);	//如果在任务刚创建就获取剩余内存那么结果将会不准
int waterMark = uxTaskGetStackHighWaterMark(taskHandle);
Serial.print("Task Free Memory: ");
Serial.print(waterMark);
Serial.println(" Bytes");
Serial.print("Task Used Memory: ");
Serial.print(taskMem - waterMark);
Serial.println(" Bytes");
```

## 2.正确分配内存

提供获取剩余内存来算出任务使用的内存，再将xTaskCreate的对应参数设置为使用内存的2倍是较为保险的设置。
