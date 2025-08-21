---
title: ESP32-FreeRTOS学习笔记(十)--二进制信号量
date: 2022-10-27 22:22:22
tags: [ESP32, FreeRTOS]
---

## 1.使用到的API

```c++
SemaphoreHandle_t xHandler; //创建Handler
xHandler = xSemaphoreCreateBinary(); //创建一个二进制信号量 返回NULL，或者handler
xSemaphoreGive(xHandler); //二进制信号量+1
xSemaphoreTake(xHanlder, timeout); //二进制信号量-1 返回pdPASS, 或者pdFAIL
xSemaphoreGiveFromISR(xHandler, portBASE_TYPE *pxHigherPriorityTaskWoken); //中断里面用的give函数，第二个参数的官方解释如下）
```

**pxHigherPriorityTaskWoken**：对某个信号量而言,可能有不止一个任务处于阻塞态在等待其有效。调用 xSemaphoreGiveFromISR()会让信号量变为有效,所以会让其中一个等待任务切出阻塞态。如果调用 xSemaphoreGiveFromISR()使得一个任务解除阻塞,并且这个任务的优先级高于当前任务(也就是被中断的任务),那么 xSemaphoreGiveFromISR()会在 函 数 内 部 将 *pxHigherPriorityTaskWoken 设为pdTRUE。如果 xSemaphoreGiveFromISR() 将 此 值 设 为pdTRUE,则在中断退出前应当进行一次上下文切换。这样才能保证中断直接返回到就绪态任务中优先级最高的任务中。

## 2.使用案例（按键控制LED开关）

```c++
void flashLED(void *pvParam) {

  pinMode(23, OUTPUT);
  while (1) {
      //当信号量为1时则take就会返回pdPASS，并且信号量-1变为0
    if (xSemaphoreTake( xSemaLED, timeOut) == pdPASS )
    {
      if ((xTaskGetTickCount() - btnDeounce) < 100) { //用于button debounce
        digitalWrite(23, !digitalRead(23));
        vTaskDelay(1000);
      }
    }
  }
}

void readBtn(void *pvParam) {

  pinMode(22, INPUT_PULLUP);

  while (1) {
    if (digitalRead(22) == LOW) {
      xSemaphoreGive(xSemaLED);	//信号量+1（1+1还是1）当信号量已经为1时还give就会返回pdFAIL
    }
  }
}

//OR 写成中断
attachInterrupt(22, ISR, FALLING);
void IRAM_ATTR ISR() {
  btnDeounce = xTaskGetTickCountFromISR();
  xSemaphoreGiveFromISR(xSemaLED, NULL);
}
```

