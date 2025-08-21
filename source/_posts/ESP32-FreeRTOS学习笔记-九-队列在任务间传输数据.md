---
title: ESP32-FreeRTOS学习笔记(九)--队列在任务间传输数据
date: 2022-10-26 21:30:45
tags: [ESP32, FreeRTOS]
---

 ## 1.队列相关的API

```c++
//创建一个队列
QueueHandle_t xQueueCreate( UBaseType_t uxQueueLength,	//队列数据单元深度
                             UBaseType_t uxItemSize	//每个数据单元有多少字节
                          );

//向队列里发数据
BaseType_t xQueueSend(
                      QueueHandle_t xQueue,	//队列的句柄
                      const void * pvItemToQueue,	//要向队列写入的数据
                      TickType_t xTicksToWait	//最长等待时间
                      );

//从队列里取数据
BaseType_t xQueueReceive(
                            QueueHandle_t xQueue,	//队列的句柄
                            void *pvBuffer,	//传入要用于接受数据的变量
                            TickType_t xTicksToWait	//最长等待时间
                        );
```

## 2.使用案例

```c++
//定义数据类型
struct sensor_t{
  byte deviceID;
  float value1;
  float value2;
};

//创建队列
QueueHandle_t queueSensor = xQueueCreate(8, sizeof(sensor_t));

//准备好数据
sensor_t dht22Sensor;
dht22Sensor.value1 = dht22.temperature;
dht22Sensor.value2 = dht22.humidity;

//向队列写入数据，如果返回的不是pdPASS则表示队列已满（在规定的timeOut时间内无法写入到队列内数据则会返回 errQUEUE_FULL )
if (xQueueSend(queueSensor, &dht22Sensor, timeOut) != pdPASS)
{
      Serial.println("DHT22: Queue is full.");
}

//读取队列中的数据，如果队列中没有数据则返回 errQUEUE_FULL )
sensor_t data;
if (xQueueReceive(queueSensor, &data, timeOut) == pdPASS)
{
    Serial.println(data.value1);
    Serial.println(data.value2);
}
```

