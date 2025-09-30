---
title: FreeRTOS中的SysTick、SVCall和Pend
date: 2025-09-30 15:53:23
tags: [FreeRTOS, ARM]
---

## 1. **SysTick**

### 简介
- **SysTick** 是 Cortex-M 系列专用的系统定时器中断。
- 通常用于周期性地触发中断，时间间隔可以配置（比如每 1ms）。
- 优先级可以设置，通常高于 PendSV。

### 在 FreeRTOS 中的用途
- **系统时钟节拍**（tick）：FreeRTOS 用 SysTick 定时器生成操作系统节拍（OS Tick），即系统“心跳”。
- 每当 SysTick 中断发生时，FreeRTOS 增加 tick 计数器，判断是否有延时任务需要唤醒，并决定是否触发任务切换（如果有高优先级任务就绪）。
- 主要代码位于 `SysTick_Handler`，会调用 `xPortSysTickHandler()`。

---

## 2. **SVCall**

### 简介
- **SVCall**（Supervisor Call）是一个软件触发的中断，通过执行 SVC 指令产生。
- 用于实现特权级操作或系统服务调用。

### 在 FreeRTOS 中的用途
- 在一些 FreeRTOS 端口（如 ARM Cortex-M）中，SVCall 可用于进入或退出特权级模式，实现系统调用。
- 比如在支持 MPU（内存保护单元）的端口，FreeRTOS 通过 SVC 切换任务的权限级别。
- 在多数基础 FreeRTOS 用法中，SVCall用得较少，主要用于安全相关或特权切换场景。

---

## 3. **PendSV**

### 简介
- **PendSV**（Pendable Service Call）是 Cortex-M 专有的、优先级最低的系统异常。
- 只能由软件设置挂起，不能被硬件自动触发。
- 设计目标：专用于 RTOS 的任务上下文切换。

### 在 FreeRTOS 中的用途
- **任务切换（上下文切换）**：FreeRTOS 通过挂起 PendSV （`SCB->ICSR |= SCB_ICSR_PENDSVSET_Msk`），实现任务切换的时机控制。
- 当需要切换任务时（如更高优先级任务就绪或主动 yield），调度器会触发 PendSV。
- PendSV 的异常处理函数会保存当前任务现场、恢复下一个任务现场，完成任务切换。

---

## 总结表格

| 异常名  | Cortex-M作用       | FreeRTOS用途                   |
| ------- | ------------------ | ------------------------------ |
| SysTick | 周期性定时器中断   | 产生OS节拍，管理任务延时和唤醒 |
| SVCall  | 软件触发的系统调用 | 进入/退出特权级，安全相关      |
| PendSV  | 挂起服务异常       | 任务上下文切换（切换任务）     |
