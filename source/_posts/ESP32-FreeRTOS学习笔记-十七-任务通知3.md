---
title: ESP32-FreeRTOS学习笔记(十七)--任务通知3
date: 2022-11-06 10:33:29
tags: FreeRTOS
---

 再额外介绍剩下的几个关于任务通知的函数

## 1.API介绍

- 发送通知

```c
BaseType_t xTaskNotifyAndQuery( TaskHandle_t xTaskToNotify,
                                 uint32_t ulValue,
                                 eNotifyAction eAction,
                                 uint32_t *pulPreviousNotifyValue );
 
BaseType_t xTaskNotifyAndQueryIndexed( TaskHandle_t xTaskToNotify, 
                                        UBaseType_t uxIndexToNotify, 
                                        uint32_t ulValue, 
                                        eNotifyAction eAction, 
                                        uint32_t *pulPreviousNotifyValue );

BaseType_t xTaskNotifyAndQueryFromISR( 
                      TaskHandle_t xTaskToNotify,
                      uint32_t ulValue,
                      eNotifyAction eAction,
                      uint32_t *pulPreviousNotifyValue,
                      BaseType_t *pxHigherPriorityTaskWoken );

BaseType_t xTaskNotifyAndQueryIndexedFromISR( 
                      TaskHandle_t xTaskToNotify,
                      UBaseType_t uxIndexToNotify
                      uint32_t ulValue,
                      eNotifyAction eAction,
                      uint32_t *pulPreviousNotifyValue,
                      BaseType_t *pxHigherPriorityTaskWoken );
```

|          参数          |           描述           |
| :--------------------: | :----------------------: |
|     xTaskToNotify      |   要通知到的任务的句柄   |
|        ulValue         |         通知内容         |
|        eAction         | 要执行的操作，内容如上节 |
| pulPreviousNotifyValue |  返回调用之前的通知内容  |
|    uxIndexToNotify     |  要发送到的通知的索引值  |
|         返回值         |     只可能返回pdPASS     |

- （清除）通知状态

```c
BaseType_t xTaskNotifyStateClear( TaskHandle_t xTask );

BaseType_t xTaskNotifyStateClearIndexed( TaskHandle_t xTask, 
                                          UBaseType_t uxIndexToClear );

uint32_t ulTaskNotifyValueClear( TaskHandle_t xTask, 
                                 uint32_t ulBitsToClear );

uint32_t ulTaskNotifyValueClearIndexed( TaskHandle_t xTask, 
                                        UBaseType_t uxIndexToClear,
                                        uint32_t ulBitsToClear );
```

|      参数      |                             描述                             |
| :------------: | :----------------------------------------------------------: |
|     xTask      |                     要操作通知的任务句柄                     |
| uxIndexToClear |                     操作指定索引值的通知                     |
| ulBitsToClear  |                          要操作的位                          |
|     返回值     | BaseType_t：pdTRUE 或者 pdFALSE ；uint32_t：返回清空之前的通知值 |

通过调用 xTaskNotifyStateClear 可以清除通知的“pending”状态，使其恢复可以使用的状态。

## 2. 程序实例

```c
uint32_t ulPreviousValue;

/* Set bit 8 in the 0th notification value of the task referenced 
by xTask1Handle. Store the task's previous 0th notification 
value (before bit 8 is set) in ulPreviousValue. */
xTaskNotifyAndQueryIndexed( xTask1Handle, 
                            0, 
                            ( 1UL << 8UL ), 
                            eSetBits, 
                            &ulPreviousValue );

/* Send a notification to the task referenced by xTask2Handle, 
potentially removing the task from the Blocked state, but without 
updating the task's notification value.  Store the tasks notification 
value in ulPreviousValue. */
xTaskNotifyAndQuery( xTask2Handle, 0, eNoAction, &ulPreviousValue );

/* Set the notification value of the task referenced by xTask3Handle 
to 0x50, even if the task had not read its previous notification value. 
The task's previous notification value is of no interest so the last 
parameter is set to NULL. */
xTaskNotifyAndQuery( xTask3Handle, 0x50, eSetValueWithOverwrite,  NULL );

/* Set the notification value of the task referenced by xTask4Handle 
to 0xfff,
but only if to do so would not overwrite the task's existing notification
value before the task had obtained it (by a call to xTaskNotifyWait()
or ulTaskNotifyTake()).  The task's previous notification value is saved
in ulPreviousValue. */
if( xTaskNotifyAndQuery( xTask4Handle,
                         0xfff,
                         eSetValueWithoutOverwrite,
                         &ulPreviousValue ) == pdPASS )
{
    /* The task's notification value was updated. */
}
else
{
    /* The task's notification value was not updated. */
}
```
