---
title: ESP32-FreeRTOS学习笔记(十二)--事件标志组
date: 2022-10-29 19:47:23
tags: [ESP32, FreeRTOS]
---

## 1.概念

事件组就是所有任务共享的3个字节(24个位)。事件 "标志 "是一个布尔值（1或0），用于指示一个事件是否发生。事件 "组 "是一组事件标志。事件标志只能为1或0，允许事件标志的状态存储在单个位中，事件组中所有事件标志的状态存储在单个变量中；事件组中每个事件标志的状态由类型为EventBits_t的变量中的单个位表示。因此，事件标志也被称为事件“位”。如果EventBits_t变量中的一位被设为1，则该位表示的事件已经发生。如果在EventBits_t变量中一个位被设置为0。那么由该位表示的事件没有发生。

## 2.使用到的API

### 1.创建与删除

```c++
EventGroupHandle_t xEventGroupCreate( void );	//创建事件组，返回的是创建的事件组的句柄

void vEventGroupDelete( EventGroupHandle_t xEventGroup );	//删除事件组，传入要删除事件组的句柄
```

### 2.等待事件组

```c++
EventBits_t xEventGroupWaitBits(
                       const EventGroupHandle_t xEventGroup,
                       const EventBits_t uxBitsToWaitFor,
                       const BaseType_t xClearOnExit,
                       const BaseType_t xWaitForAllBits,
                       TickType_t xTicksToWait );
```

|       参数        |                    描述                     |
| :---------------: | :-----------------------------------------: |
|   *xEventGroup*   |            要等待的事件组的句柄             |
| *uxBitsToWaitFor* | 要等待事件组的位，如（111）即为等bit0到bit2 |
|  *xClearOnExit*   |          是否在等到该位后清除该位           |
| *xWaitForAllBits* |    当要等多个位时是否要等全部还是等一个     |
|  *xTicksToWait*   |                最大等待时间                 |
|      返回值       |            返回当前事件组的内容             |

### 3.设置事件组

```c++
// set 给对应位置 1
EventBits_t xEventGroupSetBits( EventGroupHandle_t xEventGroup,
                                 const EventBits_t uxBitsToSet );

BaseType_t xEventGroupSetBitsFromISR(
                          EventGroupHandle_t xEventGroup,
                          const EventBits_t uxBitsToSet,
                          BaseType_t *pxHigherPriorityTaskWoken );


// clear 给对应位置 0
EventBits_t xEventGroupClearBits(
                                 EventGroupHandle_t xEventGroup,
                                 const EventBits_t uxBitsToClear );

BaseType_t xEventGroupClearBitsFromISR(
                                EventGroupHandle_t xEventGroup,
                                const EventBits_t uxBitsToClear );
```

返回值：**BaseType_t **返回pdPASS，或者pdFAIL；**EventBits_t** 返回当前事件组。

### 4.同步事件组

相当于**set**和**wait**的组合

```c++
EventBits_t xEventGroupSync( EventGroupHandle_t xEventGroup,
                              const EventBits_t uxBitsToSet,
                              const EventBits_t uxBitsToWaitFor,
                              TickType_t xTicksToWait );
```

|       参数        |         描述         |
| :---------------: | :------------------: |
|   *xEventGroup*   | 要操作的事件组的句柄 |
|   *uxBitsToSet*   |      要设置的位      |
| *uxBitsToWaitFor* |      要等待的位      |
|  *xTicksToWait*   |     最大等待时间     |
|      返回值       |   返回当前的事件组   |

## 3.使用实例

### 1.不使用sync

```c++
#define ADDTOCART_0	( 1 << 0 ) //0001 bit0
#define PAYMENT_1	( 1 << 1 )  //0010 bit1
#define INVENTORY_2	( 1 << 2 ) //0100 bit2
#define ALLBITS 0xFFFFFF //24bits都是1

EventGroupHandle_t xEventPurchase = NULL; //创建event handler
xEventPurchase = xEventGroupCreate(); //创建 event group

void purchaseTask(void *pvParam) {

  EventBits_t uxBits;  // Event Group 24Bits 的 值

  while (1) {
    uxBits = xEventGroupSetBits(xEventPurchase, ADDTOCART_0); // 将bit 0 设置为1
    if ((uxBits & ADDTOCART_0)) {
      Serial.println("商品已经添加到了购物车，付款中...");
      Serial.print("   Event Group Value:");
      Serial.println(uxBits, BIN);
    }

    uxBits = xEventGroupWaitBits (xEventPurchase,  //Event Group Handler
                                  ADDTOCART_0 | PAYMENT_1 | INVENTORY_2,     //等待Event Group中的那个Bit(s)
                                  pdFALSE,         //执行后，对应的Bits是否重置为 0
                                  pdTRUE,          //等待的Bits判断关系 True为 AND, False为 OR
                                  xTimeOut);

      //因为有可能在规定时间内还是无法等到该位，此时程序还是会继续向下，所以要加判断
    if ((uxBits & ADDTOCART_0) && (uxBits & PAYMENT_1) && (uxBits & INVENTORY_2)) {
      //随机延迟, 模拟网页显示，恭喜买家入手商品
      for (int i = 0; i < random(100, 200); i++) vTaskDelay(10);

      xEventGroupClearBits(xEventPurchase, ALLBITS); //重置
      uxBits = xEventGroupGetBits(xEventPurchase); //读取

      Serial.println("交易完成, RESET Event Group");
      Serial.print("   Event Group Value:");
      Serial.println(uxBits, BIN);
      Serial.println("");
    }

    vTaskDelete(NULL);
    //vTaskDelay(10000);

  }
}

//         |
//         |
//         V

void paymentTask(void *pvParam) {

  while (1) {

    EventBits_t uxBits;

    uxBits = xEventGroupWaitBits (xEventPurchase,  //Event Group Handler
                                  ADDTOCART_0,     //等待Event Group中的那个Bit(s)
                                  pdFALSE,         //执行后，对应的Bits是否重置为 0
                                  pdTRUE,          //等待的Bits判断关系 True为 AND, False为 OR
                                  xTimeOut);

    // 代表ADDTOCART_0被设置为了 1
    if (uxBits & ADDTOCART_0) {

      //随机延迟, 模拟付款验证过程
      for (int i = 0; i < random(100, 200); i++) vTaskDelay(10);
      uxBits = xEventGroupSetBits(xEventPurchase, PAYMENT_1); // 将bit1 PAYMENT_1 设置为1

      Serial.println("支付宝付款完成,可以出货...");
      Serial.print("   Event Group Value:");
      Serial.println(uxBits, BIN);

      vTaskDelete(NULL);
    }

  }
}

//         |
//         |
//         V

void inventoryTask(void *pvParam) {

  EventBits_t uxBits;

  while (1) {

    uxBits = xEventGroupWaitBits (xEventPurchase,  //Event Group Handler
                                  ADDTOCART_0 | PAYMENT_1,     //等待Event Group中的那个Bit(s)
                                  pdFALSE,         //执行后，对应的Bits是否重置为 0
                                  pdTRUE,          //等待的Bits判断关系 True为 AND, False为 OR
                                  xTimeOut);

    // 判断 Event Group 中 ADDTOCART_0 和 PAYMENT_1 是否被设置为了0
    if ((uxBits & ADDTOCART_0) && (uxBits & PAYMENT_1))  {

      //随机延迟, 模拟仓库出货过程
      for (int i = 0; i < random(100, 200); i++) vTaskDelay(10);
      uxBits = xEventGroupSetBits(xEventPurchase, INVENTORY_2); // 将bit2 INVENTORY_2 设置为1

      Serial.println("仓库出货完成,快递已取货...");
      Serial.print("   Event Group Value:");
      Serial.println(uxBits, BIN);

      vTaskDelete(NULL);
    }

  }
}
```

### 2.使用sync

```c++
#define BOUGHT_PAID_SENT (ADDTOCART_0 | PAYMENT_1 | INVENTORY_2)

void purchaseTask(void *pvParam) {

  EventBits_t uxBits;  // Event Group 24Bits 的 值

  while (1) {


    uxBits = xEventGroupSync (xEventPurchase,  //Event Group Handler
                              ADDTOCART_0,     // 先将这个bit(s)设置为 1,然后再等待
                              BOUGHT_PAID_SENT,  //等待这些bits为 1
                              xTimeOut);

    if ((uxBits & BOUGHT_PAID_SENT) == BOUGHT_PAID_SENT)  {
      //Serial.println("purchaseTask,已经自我了断. ");
      xQueueSend(queueMsg, &"END purchaseTask", 0);
      vTaskDelete(NULL);
    }
  }
}

void paymentTask(void *pvParam) {

  EventBits_t uxBits;

  while (1) {
    //随机延迟, 模拟付款验证过程
    for (int i = 0; i < random(100, 200); i++) vTaskDelay(10);
    //Serial.println("支付宝付款完成,可以出货...");
    xQueueSend(queueMsg, &"Payment Received", 0);
    uxBits = xEventGroupSync (xEventPurchase,  //Event Group Handler
                              PAYMENT_1,     // 先将这个bit(s)设置为 1,然后再等待
                              BOUGHT_PAID_SENT,  //等待这些bits为 1
                              xTimeOut);

    if ((uxBits & BOUGHT_PAID_SENT) == BOUGHT_PAID_SENT)  {
      //Serial.println("paymentTask,已经自我了断. ");
      xQueueSend(queueMsg, &"END paymentTask", 0);
      vTaskDelete(NULL);
    }
  }
}

void inventoryTask(void *pvParam) {

  EventBits_t uxBits;

  while (1) {

    //随机延迟, 模拟仓库出货过程
    for (int i = 0; i < random(100, 200); i++) vTaskDelay(10);
    //Serial.println("仓库出货完成,快递已取货...");
    xQueueSend(queueMsg, &"Inventory Out", 0);

    uxBits = xEventGroupSync (xEventPurchase,  //Event Group Handler
                              INVENTORY_2,     // 先将这个bit(s)设置为 1,然后再等待
                              BOUGHT_PAID_SENT,  //等待这些bits为 1
                              xTimeOut);

    if ((uxBits & BOUGHT_PAID_SENT) == BOUGHT_PAID_SENT)  {
      //Serial.println("inventoryTask,已经自我了断. ");
      xQueueSend(queueMsg, &"END inventoryTask", 0);
      vTaskDelete(NULL);
    }
  }
}
```

