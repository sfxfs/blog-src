---
title: ESP32-IDF 自定义菜单 Menuconfig 入门
date: 2022-12-17 09:38:09
tags: ESP32 IDF
---

# 介绍

  程序写好后，肯定会有很多变量需要设置，为了方便他人和未来的自己，我们可以把这些变量做到 Menuconfig 中。这样子，其他人或者未来的自己，就不需要打开代码，直接使用 Menuconfig 配置后，编译再上传即可。

乐鑫文档; https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-reference/kconfig.html 

Kconfig 标准; https://www.kernel.org/doc/html/latest/kbuild/kconfig-language.html

# 实例

例如下面这段点灯代码：

```c
#define LEDPIN 2
#define DELAY_MS_TIME 2000
...
void app_main(void)
{
    int pin_status = 0;
    gpio_reset_pin(LEDPIN);
    gpio_set_direction(LEDPIN, GPIO_MODE_OUTPUT);

    for(;;)
    {
        gpio_set_level(LEDPIN, pin_status);
        vTaskDelay(DELAY_MS_TIME);
        pin_state = !pin_state;
    }
}
```

此时如果需要修改引脚将需要找到对应文件修改代码里面的宏定义，相对来说比较麻烦。

## 下面将演示如何通过 Manuconfig 配置:

- 先在main文件夹下创建 `Kconfig.projbuild` 内容如下:

```lua
menu "blink_cust"

	config LED_PIN
		int
		prompt "ESP32上的LED连接到的引脚"
		range 0 39
		default 2
		help
			GPIO号码可以通过查阅原理图得知

	config DELAY_MS
		int
		prompt "闪烁间隔时间(MS)"
		range 100 10000
		default 1000
		help
			你要设置闪烁的间隔时间

endmenu
```

- 更改原来的代码

```c
void app_main(void)
{
    int pin_status = 0;
    gpio_reset_pin(LED_PIN);
    gpio_set_direction(LED_PIN, GPIO_MODE_OUTPUT);

    for(;;)
    {
        gpio_set_level(LED_PIN, pin_status);
        vTaskDelay(DELAY_MS);
        pin_state = !pin_state;
    }
}
```

