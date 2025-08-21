---
title: ESP32-FreeRTOS学习笔记(二)--MUTEX互斥量的应用
date: 2022-10-21 19:38:07
tags: [ESP32, FreeRTOS]
---

包括任务函数使用全局变量和添加互斥量避免“冒险与竞争”

```c++
//使用前的准备
SemaphoreHandle_t xMutextheTestTask = NULL; //创建信号量Handler
TickType_t timeOut = 1000; //用于获取信号量的Timeout 1000 ticks
xMutextheTestTask = xSemaphoreCreateMutex(); //创建MUTEX

//具体使用
void theTestTask(void *pvParam) {
    //在timeout时间内任务会block来等待获取到密钥(返回NULL则获取失败)
    if (xSemaphoreTake(xMutextheTestTask, timeOut) == pdPASS) {
        //写入被保护的数据，这个过程需要尽可能快
        xSemaphoreGive(xMutextheTestTask); //释放钥匙
    }
}
```

使用到的函数

```c++
xSemaphoreCreateMutex();
//创建信号量，返回 SemaphoreHandle_t 句柄用于调用该互斥量

xSemaphoreTake(xMutextheTestTask, timeOut);
//获取互斥量，xMutextheTestTask为互斥量的句柄，timeOut为最长等待获取时间，等待期间任务会block

xSemaphoreGive(xMutextheTestTask);
//释放互斥量，xMutextheTestTask为互斥量的句柄，之后别人才能获取到互斥量
```

