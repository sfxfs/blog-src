---
title: ESP32-FreeRTOS学习笔记(十一)--计数信号量
date: 2022-10-29 09:01:12
tags: [ESP32, FreeRTOS]
---

## 1.使用到的API

```c++
SemaphoreHandle_t xHandler; //创建Handler
xHandler = xSemaphoreCreateCounting(uxMaxCount, uxInitialCount); //创建一个计数信号量 失败返回NULL，成功返回handler
xSemaphoreGive(xHandler); //二进制信号量+1
xSemaphoreTake(xHanlder, timeout); //二进制信号量-1 返回pdPASS, 或者pdFAIL
xSemaphoreGiveFromISR(xHandler, portBASE_TYPE *pxHigherPriorityTaskWoken); //中断里面用的give函数，第二个参数的官方解释如下）
```

**pxHigherPriorityTaskWoken**：对某个信号量而言,可能有不止一个任务处于阻塞态在等待其有效。调用 xSemaphoreGiveFromISR()会让信号量变为有效,所以会让其中一个等待任务切出阻塞态。如果调用 xSemaphoreGiveFromISR()使得一个任务解除阻塞,并且这个任务的优先级高于当前任务(也就是被中断的任务),那么 xSemaphoreGiveFromISR()会在 函 数 内 部 将 *pxHigherPriorityTaskWoken 设为pdTRUE。如果 xSemaphoreGiveFromISR() 将 此 值 设 为pdTRUE,则在中断退出前应当进行一次上下文切换。这样才能保证中断直接返回到就绪态任务中优先级最高的任务中。

## 2.具体使用例

```c++
SemaphoreHandle_t xSemaPhone = NULL;
xSemaPhone = xSemaphoreCreateCounting(3, 0);	//创建一个最大为3，初始值为0的计数信号量

void producer(void *paParam) { //制造者 give
  while (1) {

    for (int i = 0; i < random(100, 200); i++) vTaskDelay(10);
    xSemaphoreGive(xSemaPhone);
    Serial.println("...... 手机再放出一台,");
  }
}


void consumer(void *pvParam) { //消费者 take
  String website = *(String *)pvParam;

  while (1) {
    if (xSemaphoreTake(xSemaPhone, portMAX_DELAY) == pdTRUE ) {

      for (int i = 0; i < random(200, 400); i++) vTaskDelay(10);
      Serial.print(website);
      Serial.println("抢到并销售一台: ");

    }
  }
}
```

