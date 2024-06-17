---
title: ESP32-FreeRTOS学习笔记(四)--软件定时器的应用
date: 2022-10-21 19:36:53
tags: FreeRTOS
---

先介绍创建软件定时器的API函数

```c++
TimerHandle_t xTimerCreate( const char * const pcTimerName,
                            const TickType_t xTimerPeriodInTicks,
                            const UBaseType_t uxAutoReload,
                            void * const pvTimerID,
                            TimerCallbackFunction_t pxCallbackFunction )
```

| 参数                | 描述                                                         |
| ------------------- | ------------------------------------------------------------ |
| pcTimerName         | 定时器名字，用于调试目的，方便识别不同的定时器。             |
| xTimerPeriodInTicks | 定时器周期，单位系统时钟Tick。                               |
| uxAutoReload        | 选择周期模式还是单次模式，若参数为pdTRUE，则表示选择周期模式，若参数为pdFALSE，则表示选择单次模式。（自动重装载值） |
| pvTimerID           | 是定时器ID，当创建不同的定时器，但使用相同的[回调](https://so.csdn.net/so/search?q=回调&spm=1001.2101.3001.7020)函数时，在回调函数中通过不同的ID号来区分不同的定时器。 |
| pxCallbackFunction  | 定时器回调函数。                                             |
| 返回值              | 创建成功返回定时器的句柄，由于FreeRTOSCongfig.h文件中heap空间不足，或者定时器周期设置为0，会返回NULL。 |

还有其他的函数配合使用：

```c++
xTimerStart(timerHandle, timeOutTick)
//timerHandle为需要开启的定时器的句柄
//timeOutTick表示如果定时器被占用时需要等待的时间，最大值为portMAX_DELAY
//成功开启定时器返回pdPASS
```

下面是使用实例：

```c++
//使用前准备
TimerHandle_t theTimerHandle;
theTimerHandle = xTimerCreate("the test",
                            2000,	//延迟2000个Tick
                            pdFALSE,	//不要自动重载
                            (void *)0,	//定时器ID，因为要传入void指针，所以要强制转换
                            theTestCallback);	//计时结束后要调用的函数

//正式使用定时器
xTimerStart(theTimerHandle, portMAX_DELAY);
```

