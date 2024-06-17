---
title: ESP32-FreeRTOS学习笔记(十三)--流媒体缓存
date: 2022-11-02 19:42:10
tags: FreeRTOS
---

FreeRTOS 10以后引入了一个新的数据类型就是 Stream Buffer。它和Queue最大的不同就是，Stream Buffer读写的大小没有限制，而Queue是预设值好固定的值。Stream Buffer 流媒体缓存顾名思义它的受众对象就是 流媒体 比如MP3，视频，在线电台等。

## 1.API介绍

### 1.创建缓存

```c++
StreamBufferHandle_t xStreamBufferCreate( size_t xBufferSizeBytes,
                                           size_t xTriggerLevelBytes );

StreamBufferHandle_t xStreamBufferCreateWithCallback( 
                         size_t xBufferSizeBytes,
                         size_t xTriggerLevelBytes,
                         StreamBufferCallbackFunction_t pxSendCompletedCallback,
                         StreamBufferCallbackFunction_t pxReceiveCompletedCallback );

StreamBufferHandle_t xStreamBufferCreateStatic(
                                    size_t xBufferSizeBytes,
                                    size_t xTriggerLevelBytes,
                                    uint8_t *pucStreamBufferStorageArea,
                                    StaticStreamBuffer_t *pxStaticStreamBuffer );

StreamBufferHandle_t xStreamBufferCreateStaticWithCallback(
                                    size_t xBufferSizeBytes,
                                    size_t xTriggerLevelBytes,
                                    uint8_t *pucStreamBufferStorageArea,
                                    StaticStreamBuffer_t *pxStaticStreamBuffer,
                                    StreamBufferCallbackFunction_t pxSendCompletedCallback,
                                    StreamBufferCallbackFunction_t pxReceiveCompletedCallback );
```

|             参数             |                      描述                      |
| :--------------------------: | :--------------------------------------------: |
|      *xBufferSizeBytes*      |             一次能接受的最大字节数             |
|     *xTriggerLevelBytes*     |       缓存内数据超过这个数值，才会被读取       |
|  *pxSendCompletedCallback*   |                发送完成回调函数                |
| *pxReceiveCompletedCallback* |                接受完成回调函数                |
|            返回值            | 返回NULL则内存不够无法创建，成功创建会返回句柄 |

### 2.发送到缓存

```c++
size_t xStreamBufferSend( StreamBufferHandle_t xStreamBuffer,
                          const void *pvTxData,
                          size_t xDataLengthBytes,
                          TickType_t xTicksToWait );

size_t xStreamBufferSendFromISR( StreamBufferHandle_t xStreamBuffer,
                                 const void *pvTxData,
                                 size_t xDataLengthBytes,
                                 BaseType_t *pxHigherPriorityTaskWoken );
```

|            参数             |                             描述                             |
| :-------------------------: | :----------------------------------------------------------: |
|       *xStreamBuffer*       |                     要发送到的缓存的句柄                     |
|         *pvTxData*          |                     指向要发送数据的指针                     |
|     *xDataLengthBytes*      |                    向缓存发送的最大字节数                    |
| *pxHigherPriorityTaskWoken* | 可为NULL，让正在等待数据的任务解除阻塞态，并且那个任务的优先级高于此值 |
|           返回值            |                 有多少字节数据被写到了缓存中                 |

### 3.从缓存接受数据

```c++
size_t xStreamBufferReceive( StreamBufferHandle_t xStreamBuffer,
                             void *pvRxData,
                             size_t xBufferLengthBytes,	//一次最大接受多少字节
                             TickType_t xTicksToWait );

size_t xStreamBufferReceiveFromISR( StreamBufferHandle_t xStreamBuffer,
                                    void *pvRxData,
                                    size_t xBufferLengthBytes,
                                    BaseType_t *pxHigherPriorityTaskWoken );
```

### 4.删除缓存

```c++
void vStreamBufferDelete( StreamBufferHandle_t xStreamBuffer );
```

### 5.改变缓存

```c++
//改变已经创建了的缓存的触发阈值
BaseType_t xStreamBufferSetTriggerLevel( StreamBufferHandle_t xStreamBuffer,
                                         size_t xTriggerLevel );

//重置缓存，清空所有数据
BaseType_t xStreamBufferReset( StreamBufferHandle_t xStreamBuffer );
```

### 6.缓存的相关信息

```c++
//返回缓存内还有多少字节数据
size_t xStreamBufferBytesAvailable( StreamBufferHandle_t xStreamBuffer );

//返回缓存还剩多少空间
size_t xStreamBufferSpacesAvailable( StreamBufferHandle_t xStreamBuffer );

//缓存是否为空，返回pdTRUE或者pdFALSE
BaseType_t xStreamBufferIsEmpty( StreamBufferHandle_t xStreamBuffer );

//缓存是否已满，返回pdTRUE或者pdFALSE
BaseType_t xStreamBufferIsFull( StreamBufferHandle_t xStreamBuffer );
```

## 2.代码实例

```c++
#include <freertos/stream_buffer.h>

StreamBufferHandle_t xStreamMusic = NULL; //创建一个 Stream Buffer 的 handler

//Stream Buffer的最大尺寸，如果超出可能内存空间，那么创建Stream Buffer就会失败
  const size_t xStreamBufferSizeBytes = 540;
  //Trigger Level - Stream Buffer内数据超过这个数值，才会被读取
  const size_t xTriggerLevel = 8;
xStreamMusic = xStreamBufferCreate(xStreamBufferSizeBytes, xTriggerLevel);

void downloadTask(void *pvParam) { //下载音乐
  String music;
  size_t xBytesSent; //The number of bytes written to the stream buffer.
  while (1) {

    //从网络下载音乐，放一些随机的延迟
    for (int i = 0; i < random(20, 40); i++) vTaskDelay(1);
    music = randomMusic(); //随机生成一些数据

    xBytesSent = xStreamBufferSend( xStreamMusic,
                                    (void *)&music,
                                    sizeof(music),
                                    portMAX_DELAY);

    if ( xBytesSent != sizeof( music ) ) {
      Serial.println("警告: xStreamBufferSend 写入数据出错");  //Optional
    }

    vTaskDelay(100);
  }
}

void playBackTask(void *pvParam) { //解码并且播放
  size_t xReceivedBytes; //The number of bytes read from the stream buffer.
  size_t xReadBytes = 8*10-1;
  String music;
  while (1) {
    xReceivedBytes = xStreamBufferReceive( xStreamMusic,
                                           ( void * ) &music,
                                           xReadBytes,
                                           portMAX_DELAY );
    if ( xReceivedBytes > 0 )
    {
      decode(music);
    }

  }
}
```

