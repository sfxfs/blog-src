---
title: ESP32-FreeRTOS学习笔记(十四)--信息缓存
date: 2022-11-02 20:29:26
tags: FreeRTOS
---

Message Buffer是基于Stream Buffer的。只是在每一次发送数据的时候多了四个字节的空间用于存放消息的大小。更具这个消息大小，读取放就可以一次读取出全部消息的内容。在视频中，也会对全部三个FreeRTOS的数据类型进行对比，分别是Queue，Stream Buffer 和 Message Buffer。

## 1.API介绍

### 1.创建缓存

```c
MessageBufferHandle_t xMessageBufferCreate( size_t xBufferSizeBytes );

MessageBufferHandle_t xMessageBufferCreateWithCallback( 
                          size_t xBufferSizeBytes,
                          StreamBufferCallbackFunction_t pxSendCompletedCallback,
                          StreamBufferCallbackFunction_t pxReceiveCompletedCallback );

MessageBufferHandle_t xMessageBufferCreateStatic(
                          size_t xBufferSizeBytes,
                          uint8_t *pucMessageBufferStorageArea,
                          StaticMessageBuffer_t *pxStaticMessageBuffer );

MessageBufferHandle_t xMessageBufferCreateStaticWithCallback(
                          size_t xBufferSizeBytes,
                          uint8_t *pucMessageBufferStorageArea,
                          StaticMessageBuffer_t *pxStaticMessageBuffer,
                          StreamBufferCallbackFunction_t pxSendCompletedCallback,
                          StreamBufferCallbackFunction_t pxReceiveCompletedCallback );
```

|            参数             |                             描述                             |
| :-------------------------: | :----------------------------------------------------------: |
|      xBufferSizeBytes       |                           缓存大小                           |
|   pxSendCompletedCallback   |                       发送完成回调函数                       |
| pxReceiveCompletedCallback  |                       接受完成回调函数                       |
| pucMessageBufferStorageArea | 用于存放要写入到缓存的数据，大小必须比xBufferSizeBytes大一个字节。 |
|    pxStaticMessageBuffer    |                      存放缓存的内存空间                      |
|           返回值            |                创建失败返回NULL，成功返回句柄                |

### 2.发送数据到缓存

```c
size_t xMessageBufferSend( MessageBufferHandle_t xMessageBuffer,
                           const void *pvTxData,
                           size_t xDataLengthBytes,
                           TickType_t xTicksToWait );

size_t xMessageBufferSendFromISR( MessageBufferHandle_t xMessageBuffer,
                                  const void *pvTxData,
                                  size_t xDataLengthBytes,
                                  BaseType_t *pxHigherPriorityTaskWoken );
```

与 **stream buffer** 的参数同理。

### 3.从缓存接受数据

```c
size_t xMessageBufferReceive( MessageBufferHandle_t xMessageBuffer,
                              void *pvRxData,
                              size_t xBufferLengthBytes,
                              TickType_t xTicksToWait );

size_t xMessageBufferReceiveFromISR( MessageBufferHandle_t xMessageBuffer,
                                     void *pvRxData,
                                     size_t xBufferLengthBytes,
                                     BaseType_t *pxHigherPriorityTaskWoken );
```

### 4.删除和重置缓存

```c
void vMessageBufferDelete( MessageBufferHandle_t xMessageBuffer );

BaseType_t xMessageBufferReset( MessageBufferHandle_t xMessageBuffer );
```

### 5.查询状态

```c
size_t xMessageBufferSpacesAvailable( MessageBufferHandle_t xMessageBuffer );

BaseType_t xMessageBufferIsEmpty( MessageBufferHandle_t xMessageBuffer );

BaseType_t xMessageBufferIsFull( MessageBufferHandle_t xMessageBuffer );
```

## 2.代码实例

```c
#include <freertos/message_buffer.h>

MessageBufferHandle_t xMessageBuffer = NULL;

const size_t xMessageBufferSizeBytes = 100;
xMessageBuffer = xMessageBufferCreate( xMessageBufferSizeBytes );

String randomGPS() {
  char gps[30];

  static int counter = 100;
  counter++;
  switch (random(0, 3)) {
    case 0:
      // 返回 经度 纬度 海拔
      sprintf(gps, "%d-%d-%d-%d", counter, random(100, 999), random(100, 999), random(100, 999));
      break;
    case 1:
      // 返回 经度 纬度
      sprintf(gps, "%d-%d-%d", counter, random(100, 999), random(100, 999));
      break;
    case 2:
      // 返回 海拔
      sprintf(gps, "%d-%d", counter, random(100, 999));
      break;
    default:
      break;
  }

  return String(gps);
}

void readGPS(void * pvParam) {
  size_t xBytesSent; //The number of bytes written to the message buffer.
  String gpsInfo;
  while (1) {
    gpsInfo = randomGPS(); //随机发送不同长度的信息
    xBytesSent = xMessageBufferSend( xMessageBuffer,
                                     ( void * ) &gpsInfo,
                                     sizeof( gpsInfo ),
                                     portMAX_DELAY );

    if ( xBytesSent != sizeof( gpsInfo ) )
    {
      Serial.println("危险: xMessageBufferSend 发送数据不完整");
    }
    vTaskDelay(3000);
  }
}

void gpsDecoder(String gpsinfo) {
  struct GPS {
    int counter;
    int longVal;
    int latVal;
    int AltVal;
  };

  String s1, s2, s3, s4;
  int counter = 0;
  String gpsinfo2 = gpsinfo;
  do {
    counter++;
    int index = gpsinfo.indexOf('-');
    if (gpsinfo.indexOf('-') < 0) gpsinfo = "";
    gpsinfo = gpsinfo.substring(index + 1, gpsinfo.length());
  } while (gpsinfo.length() > 0);

  GPS gps;

  switch (counter) {
    case 2:
      gps.counter = gpsinfo2.substring(0, 3).toInt();
      gps.longVal = -1;
      gps.latVal = -1;
      gps.AltVal = gpsinfo2.substring(4, 7).toInt();
      break;
    case 3:
      gps.counter = gpsinfo2.substring(0, 3).toInt();
      gps.longVal = gpsinfo2.substring(4, 7).toInt();
      gps.latVal = gpsinfo2.substring(8, 11).toInt();
      gps.AltVal = -1;
      break;
    case 4:
      gps.counter = gpsinfo2.substring(0, 3).toInt();
      gps.longVal = gpsinfo2.substring(4, 7).toInt();
      gps.latVal = gpsinfo2.substring(8, 11).toInt();
      gps.AltVal = gpsinfo2.substring(12, 15).toInt();
      break;
    default:
      break;
  }

void showGPS(void * pvParam) {
  size_t xReceivedBytes;
  String gpsInfo;
  const size_t xMessageSizeMax = 100;
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("   GPS INFO"); //clear this line
  while (1) {
    xReceivedBytes = xMessageBufferReceive( xMessageBuffer,
                                            ( void * ) &gpsInfo,
                                            xMessageSizeMax, //This sets the maximum length of the message that can be received.
                                            portMAX_DELAY );

    if ( xReceivedBytes > 0 )
    {
      gpsDecoder(gpsInfo); //解码，并且显示到屏幕上
    }

    vTaskDelay(1000);
  }
}
```

