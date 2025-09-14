---
title: ESP32-FreeRTOS学习笔记(一)--创建FreeRTOS任务
date: 2022-10-21 19:35:49
description: ESP32 FreeRTOS任务创建的基础教程，包括任务的创建方法和参数传递技巧
tags: [ESP32, FreeRTOS, 嵌入式, 任务创建, 实时操作系统, 多任务]
categories: [嵌入式开发, ESP32]
cover: 
top_img: 
---

包括任务的创建和向任务传参

## 1.创建任务

任务调用的函数模板

```c++
void theTestTask(void *pvParam) {
	//your code
}
```

任务是由 C 语言函数实现的。唯一特别的只是任务的函数原型，其必须返回 void， 而且带有一个 void 指针参数。

调用FreeRTOS提供的函数创建任务

```c++
vportBASE_TYPE xTaskCreate( pdTASK_CODE pvTaskCode, 
					const signed portCHAR * const pcName, 
					unsigned portSHORT usStackDepth, 
					void *pvParameters, 
					unsigned portBASE_TYPE uxPriority, 
					xTaskHandle *pxCreatedTask );
```

| 参数名        | 描述                                                         |
| ------------- | :----------------------------------------------------------- |
| pvTaskCode    | 指向你要运行的函数的指针                                     |
| pcName        | 具有描述性的任务名。这个参数不会被 FreeRTOS 使用。其只是单 纯地用于辅助调试。识别一个具有可读性的名字总是比通过句柄来 识别容易得多。 |
| usStackDepth  | 用于告诉内核为它分配多大的栈空间,单位是字节（byte）。注意，这与原版FreeRTOS不同，原版为字（word）。 |
| pvParameters  | 传向任务函数的参数                                           |
| uxPriority    | 指定任务执行的优先级。优先级的取值范围可以从最低优先级 0 到 最高优先级(configMAX_PRIORITIES – 1)。需要注意的是值越大优先级越高。 |
| pxCreatedTask | 用于传出任务的句柄。这个句柄将在 API 调用中对 该创建出来的任务进行引用，比如改变任务优先级，或者删除任务。不需要则可以为NULL。 |
| 返回值        | 成功创建则为 pdTRUE , 若为errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY 则表示栈空间不足无法创建。 |

因为ESP32为双核MCU，所以还提供了 xTaskCreatePinnedToCore 函数用于指定在哪个核心上运行，只需在正常 xTaskCreate 最后参数后面再加个 const BaseType_t xCoreID 参数，函数名改为 xTaskCreatePinnedToCore 即可。

```c++
xTaskCreatePinnedToCore(theTestTask, "For test", 1024, NULL, 1, &theTaskHandle, 1);	//指定到了CORE1运行该任务
```

需要知道的是,ESP32的WiFi相关程序会运行在CORE0，如果在连续使用WiFi时又在CORE0跑任务将会导致WiFi出现各种问题。第二点，Arduino的setup函数和loop函数是运行在CORE1的一个FreeRTOS任务，如果并不需要使用到这几个函数，则也可以删除该任务。

## 2.向任务函数传参

举一个向任务函数传递结构体的例子

```c++
//定义结构体
struct LEDFLASH{
  byte pin;
  int delayTime;
};

//定义任务函数
void ledFlash(void *pt) {
  LEDFLASH * ptLedFlash = (LEDFLASH *)pt;	//将void指针转为结构体指针
  byte pin = ptLedFlash->pin;
  int delayTime = ptLedFlash->delayTime;

  pinMode(pin,OUTPUT);
  while (1) {
    digitalWrite(pin, !digitalRead(pin));
    vTaskDelay(delayTime);
  }
}

//创建任务线程
LEDFLASH led1;
if (xTaskCreate(ledFlash,
                  "FLASH LED",
                  1024,
                  (void *)&led1,
                  1,
                  NULL) == pdPASS)
    Serial.println("led1 flash task Created.");
```

其中出现了 vTaskDelay(delayTick) 函数，表示任务block阻塞指定时间，在ESP32上一个Tick等于一个ms，但是我依然推荐规范写法 vTaskDelay(delayTimeMS / portTICK_RATE_MS) 或者 vTaskDelay(pdTICKS_TO_MS(delayTimeMS))
