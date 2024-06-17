---
title: ESP32-FreeRTOS学习笔记(十五)--任务通知1
date: 2022-11-04 21:46:35
tags: FreeRTOS
---

Direct Task Notification是FreeRTOS 10版本以后的最重要的一个功能。他可以实现大部分二进制信号量，计数信号量，事件组，邮箱等等的功能。而且速度快45%，并且占用更少的内存，所以我们应该尽量使用任务通知这个功能。本集会深层次的讲解什么是notification，以及对他的读，写 和等待。一个任务将会有多个通知，一个通知包含**值（value）**以及**状态（status）**这两个内容，**值**占4个字节，**状态**占一个字节。

## 1.API介绍

### 1.发送通知

```c
BaseType_t xTaskNotifyGive( TaskHandle_t xTaskToNotify );

BaseType_t xTaskNotifyGiveIndexed( TaskHandle_t xTaskToNotify, 
                                    UBaseType_t uxIndexToNotify );

void vTaskNotifyGiveFromISR( TaskHandle_t xTaskToNotify,
                              BaseType_t *pxHigherPriorityTaskWoken );

void vTaskNotifyGiveIndexedFromISR( TaskHandle_t xTaskToNotify, 
                                     UBaseType_t uxIndexToNotify, 
                                     BaseType_t *pxHigherPriorityTaskWoken );
```

|       参数        |                             描述                             |
| :---------------: | :----------------------------------------------------------: |
|  *xTaskToNotify*  |                  通知被发给指定的任务的句柄                  |
| *uxIndexToNotify* | 通知的检索值（一个任务可以有多个通知，可以指定放在哪个位置） |
|      返回值       |                        一定返回pdPASS                        |

### 2.接受通知

```c
uint32_t ulTaskNotifyTake( BaseType_t xClearCountOnExit,
                            TickType_t xTicksToWait );
 
uint32_t ulTaskNotifyTakeIndexed( UBaseType_t uxIndexToWaitOn, 
                                   BaseType_t xClearCountOnExit, 
                                   TickType_t xTicksToWait );
```

|       参数        |                         描述                         |
| :---------------: | :--------------------------------------------------: |
| xClearCountOnExit | 可以为pdTRUE和pdFALSE，为pdTRUE时整个通知会被恢复为0 |
|   xTicksToWait    |                     最大等待时间                     |
|  uxIndexToWaitOn  |                  要等的通知的检索值                  |
|      返回值       |                  返回接受到的通知值                  |

**以上两种发送和接受通知的方式适合作为二进制信号量和计数信号量来使用，因为这相比下面的API来说更加简单。**

### 3.等待通知

```c
BaseType_t xTaskNotifyWait( uint32_t ulBitsToClearOnEntry,
                             uint32_t ulBitsToClearOnExit,
                             uint32_t *pulNotificationValue,
                             TickType_t xTicksToWait );

BaseType_t xTaskNotifyWaitIndexed( UBaseType_t uxIndexToWaitOn, 
                                    uint32_t ulBitsToClearOnEntry, 
                                    uint32_t ulBitsToClearOnExit, 
                                    uint32_t *pulNotificationValue, 
                                    TickType_t xTicksToWait );
```

|         参数         |                     描述                      |
| :------------------: | :-------------------------------------------: |
| ulBitsToClearOnEntry |      进入前清除的位，不清除就填入0x0000       |
| ulBitsToClearOnExit  |      退出前清除的位，不清除则填入0x0000       |
| pulNotificationValue |                 获取通知的值                  |
|     xTicksToWait     |                 最大等待时间                  |
|   uxIndexToWaitOn    |              等待的消息的检索值               |
|        返回值        | 在规定时间获取到则返回pdTRUE，否则返回pdFALSE |

### 4.发送通知

```c
BaseType_t xTaskNotify( TaskHandle_t xTaskToNotify,
                         uint32_t ulValue,
                         eNotifyAction eAction );

BaseType_t xTaskNotifyIndexed( TaskHandle_t xTaskToNotify, 
                                UBaseType_t uxIndexToNotify, 
                                uint32_t ulValue, 
                                eNotifyAction eAction );
```

|      参数       |                             描述                             |
| :-------------: | :----------------------------------------------------------: |
|  xTaskToNotify  |                  通知被发给指定的任务的句柄                  |
|     ulValue     |                  要更改的对方的通知的对应位                  |
|     eAction     | 对对应位的操作，可以为eIncrement（增加一），eNoAction（不变），eSetBits（对应位置于1），eSetValueWithOverwrite（对应位置1，并且将其他原有为1的位置0），eSetValueWithoutOverwrite（对应位置1，但不把其他原有为1的位置0） |
| uxIndexToNotify |                         通知的索引值                         |
|     返回值      |                      只可能会返回pdPASS                      |

## 2.程序实例

### 1. wait与notify

```c
void vAnEventProcessingTask( void *pvParameters )
{
uint32_t ulNotifiedValue;

    for( ;; )
    {
        xTaskNotifyWaitIndexed( 0,         /* 等待第0个通知. */
                                0x00,      /* 在进入时不清除任何位. */
                                ULONG_MAX, /* 在退出前清除所有位. */
                                &ulNotifiedValue, /* 接受到的消息. */
                                portMAX_DELAY );  /* 无限等待. */

        /* 处理接受到的消息. */

        if( ( ulNotifiedValue & 0x01 ) != 0 )
        {
            /* 第0位被置1 - 则触发对应函数. */
            prvProcessBit0Event();
        }

        if( ( ulNotifiedValue & 0x02 ) != 0 )
        {
            /* 第1位被置1 - 则触发对应函数. */
            prvProcessBit1Event();
        }

        if( ( ulNotifiedValue & 0x04 ) != 0 )
        {
            /* 第2位被置1 - 则触发对应函数. */
            prvProcessBit2Event();
        }

        /* Etc. */
    }
}
```

### 2. take和give

```c
/* 这是一个中断句柄. */
void vANInterruptHandler( void )
{
BaseType_t xHigherPriorityTaskWoken;

    /* Clear the interrupt. */
    prvClearInterruptSource();

    /* xHigherPriorityTaskWoken must be initialised to pdFALSE.  If calling
    vTaskNotifyGiveFromISR() unblocks the handling task, and the priority of
    the handling task is higher than the priority of the currently running task,
    then xHigherPriorityTaskWoken will automatically get set to pdTRUE. */
    xHigherPriorityTaskWoken = pdFALSE;

    /* Unblock the handling task so the task can perform any processing necessitated
    by the interrupt.  xHandlingTask is the task's handle, which was obtained
    when the task was created. */
    vTaskNotifyGiveIndexedFromISR( xHandlingTask, 0, &xHigherPriorityTaskWoken );

    /* Force a context switch if xHigherPriorityTaskWoken is now set to pdTRUE.
    The macro used to do this is dependent on the port and may be called
    portEND_SWITCHING_ISR. */
    portYIELD_FROM_ISR( xHigherPriorityTaskWoken );
}
/*-----------------------------------------------------------*/

/* A task that blocks waiting to be notified that the peripheral needs servicing,
processing all the events pending in the peripheral each time it is notified to 
do so. */
void vHandlingTask( void *pvParameters )
{
BaseType_t xEvent;

    for( ;; )
    {
        /* Block indefinitely (without a timeout, so no need to check the function's
        return value) to wait for a notification.  Here the RTOS task notification
        is being used as a binary semaphore, so the notification value is cleared
        to zero on exit.  NOTE!  Real applications should not block indefinitely,
        but instead time out occasionally in order to handle error conditions
        that may prevent the interrupt from sending any more notifications. */
        ulTaskNotifyTakeIndexed( 0,               /* Use the 0th notification */
                                 pdTRUE,          /* Clear the notification value 
                                                     before exiting. */
                                 portMAX_DELAY ); /* Block indefinitely. */

        /* The RTOS task notification is used as a binary (as opposed to a
        counting) semaphore, so only go back to wait for further notifications
        when all events pending in the peripheral have been processed. */
        do
        {
            xEvent = xQueryPeripheral();

            if( xEvent != NO_MORE_EVENTS )
            {
                vProcessPeripheralEvent( xEvent );
            }

        } while( xEvent != NO_MORE_EVENTS );
    }
}
```
