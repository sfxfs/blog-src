---
title: ESP32-FreeRTOS学习笔记(十六)--任务通知2
date: 2022-11-06 09:33:29
tags: [ESP32, FreeRTOS]
---

今天讲给大家演示如何使用直接任务通知来取代事件组的功能。 任务通知使用的是32bits，而之前讲的事件组是24bits，所以，只要不是涉及多个任务， 那么这个直接任务通知可以完全取代事件组。

```c
static TaskHandle_t xledTask = NULL;

#define RESET_0  0b1
#define LEDBIT_1 0b10
#define LEDBIT_2 0b100
#define LEDBIT_3 0b1000
#define LEDBIT_4 0b10000
#define LEDBIT_5 0b100000
#define LEDBIT_6 0b1000000
#define LEDBIT_7 0b10000000
#define LEDBIT_8 0b100000000
#define LEDBIT_9 0b1000000000

// 模拟电话键盘的实现代码是抄的。
// 哪位大神有这个产品的链接，我来100个，实在是太复古了
void dialTask(void * pvParam) {
  const byte INDIALPIN = 33;
  const byte PULSEPIN = 32;
  pinMode(INDIALPIN, INPUT_PULLUP);
  pinMode(PULSEPIN, INPUT_PULLUP);

  byte counter = 0;
  boolean inDialPinLastState;
  boolean pulsPinLastState;

  inDialPinLastState = digitalRead(INDIALPIN);
  pulsPinLastState = digitalRead(PULSEPIN);

  while (1) {

    boolean inDialPinState = digitalRead(INDIALPIN);
    boolean pulsPinState = digitalRead(PULSEPIN);
    if (inDialPinState != inDialPinLastState) {
      if (!inDialPinState) {
        counter = 0;
      } else {
        if (counter) {
          counter = counter % 10;
          // ---- 横线上方Dial的判断代码为抄的 ----
          // Serial.println(counter);
          uint32_t ulEventGroup;
          switch (counter) {
            case 0: ulEventGroup = RESET_0 ; break;
            case 1: ulEventGroup = LEDBIT_1 ; break;
            case 2: ulEventGroup = LEDBIT_2 ; break;
            case 3: ulEventGroup = LEDBIT_3 ; break;
            case 4: ulEventGroup = LEDBIT_4 ; break;
            case 5: ulEventGroup = LEDBIT_5 ; break;
            case 6: ulEventGroup = LEDBIT_6 ; break;
            case 7: ulEventGroup = LEDBIT_7 ; break;
            case 8: ulEventGroup = LEDBIT_8 ; break;
            case 9: ulEventGroup = LEDBIT_9 ; break;
            default: ulEventGroup = RESET_0 ; break;
          }

          xTaskNotify( xledTask,
                       ulEventGroup,
                       eSetBits);

          // ---- 横线下方Dial的判断代码为抄的 ----
        }
      }
      inDialPinLastState = inDialPinState;
    }
    if (pulsPinLastState != pulsPinState) {
      if (!pulsPinLastState) {
        counter++;
      }
      pulsPinLastState = pulsPinState;
    }
  }

}

void ledTask(void *pvParam) {

  byte led_pins[9] = {23, 22, 21, 19, 18, 5, 15, 16, 4};
  for (byte pin : led_pins) pinMode(pin, OUTPUT);

  uint32_t ulNotifiedValue;

  while (1) {

    xTaskNotifyWait( pdFALSE,    /* Don't clear bits on entry. */
                     ULONG_MAX,        /* Clear all bits on exit. */
                     &ulNotifiedValue, /* Stores the notified value. */
                     portMAX_DELAY );

    // 如果第0位 为 0 熄灭所有灯
    if (ulNotifiedValue & (1 << 0) == 1) {
      for (int i = 1; i <= 9; i++) {
        digitalWrite(led_pins[i - 1], LOW);
      }
    }

    // 对0-9位进行判断，如果第一位是1，那么点亮第一个LED，以此类推
    for (int i = 1; i <= 9; i++) {
      if (ulNotifiedValue & (1 << i)) {
        digitalWrite(led_pins[i - 1], HIGH);
      }
    }

  }
}

void setup() {
  Serial.begin(115200);

  xTaskCreate(dialTask, "Dial Panel", 1024 * 10, NULL, 1, NULL);
  xTaskCreate(ledTask, "Nine LED", 1024 * 10, NULL, 1, &xledTask);

}

void loop() { }

```

