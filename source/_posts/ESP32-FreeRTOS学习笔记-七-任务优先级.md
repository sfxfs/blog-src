---
title: ESP32-FreeRTOS学习笔记(七)--任务优先级
date: 2022-10-21 21:01:13
tags: [ESP32, FreeRTOS]
---

 在ESP32上的FreeRTOS上优先级越高其值越大

```c++
API：
    //设置优先级
    void vTaskPrioritySet( TaskHandle_t xTask, UBaseType_t uxNewPriority );
    
    //获取TashHandle任务优先级
    UBaseType_t uxTaskPriorityGet( TaskHandle_t xTask );

    //获取当前任务优先级
    UBaseType_t uxTaskPriorityGet(NULL);

    //退让资源，任务调度器会重新评估任务，将资源分配给同等级或者更高等级任务
    //注意不会把资源给低等级任务
    tastYIELD();
```

当高优先级的任务没有阻塞或者挂起时，同一核心的低优先级的任务将得不到运行，这就是为什么要用 vTaskDelay 的原因了 ——— 让任务进入阻塞，而普通的delay将没有这样的效果。
