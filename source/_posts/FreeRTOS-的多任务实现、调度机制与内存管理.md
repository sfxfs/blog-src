---
title: FreeRTOS 的多任务实现、调度机制与内存管理
date: 2025-10-01 10:22:34
tags: [FreeRTOS, Task, Memory]
---

一、整体架构概览
- FreeRTOS 是单核、基于固定优先级的抢占式实时内核（也支持协作式）。
- 任务由内核维护的任务控制块 TCB 与任务栈组成；TCB 里保存任务上下文与调度元数据。
- 核心数据结构是多组就绪链表、延时链表、挂起链表和事件链表；调度器按“最高优先级就绪任务先运行”的规则选择任务。
- 上下文切换由定时节拍中断（tick）或事件唤醒触发，在各体系结构的移植层（portable/portmacro.h）通过汇编/内联汇编保存与恢复寄存器。

二、任务与上下文
- TCB 关键字段（不同端口略有差异）：
  - pxTopOfStack：当前栈顶（保存寄存器的上下文帧）。
  - pxStack/pxEndOfStack：任务栈起止。
  - uxPriority：任务优先级（0..configMAX_PRIORITIES-1）。
  - xStateListItem：把任务挂到就绪/延时等链表用的节点。
  - xEventListItem：等待队列/信号量等事件列表的节点。
- 任务状态：Running、Ready、Blocked（延时或等待事件）、Suspended、Deleted。
- 任务创建：xTaskCreate/xTaskCreateStatic，动态或静态分配 TCB 与栈；入口是任务函数（无限循环），退出一般不返回。

三、调度器与就绪列表
- 算法：固定优先级抢占。
  - configUSE_PREEMPTION=1：高优先级就绪时立即抢占。
  - 同优先级任务可时间片轮转（configUSE_TIME_SLICING=1）。
  - configUSE_PORT_OPTIMISED_TASK_SELECTION 可用位图快速找到最高优先级。
- 核心链表：
  - pxReadyTasksLists[]：每个优先级一个就绪链表。
  - xDelayedTaskList1/xDelayedTaskList2：延时任务的两条时间轮链表（处理 tick 计数溢出）。
  - xSuspendedTaskList：挂起任务。
  - 每个队列/信号量/事件组都有一个或多个等待任务的事件链表（按优先级有序）。
- 触发调度的时机：
  - 周期性：tick 中断（系统心跳）。
  - 任务主动让出或阻塞：taskYIELD、vTaskDelay、xQueueReceive 等。
  - 中断使更高优先级任务就绪：FromISR API 设置 xHigherPriorityTaskWoken 并触发 yield。
  - 变更优先级/任务就绪状态：vTaskPrioritySet、xTaskResume 等。

四、上下文切换过程（以 Cortex-M 为例）
- 时钟：通常用 SysTick 产生 tick；在中断里决定是否需要切换。
- 机制：
  - 在中断里将“需要切换”的请求转成挂起 PendSV（最低优先级的异常），避免与其他 ISR 竞争。
  - PendSV 入口执行保存当前任务上下文（R4-R11 等）到其任务栈，更新当前 TCB->pxTopOfStack。
  - 选择下一个任务（最高优先级 ready 列表的链表头）。
  - 从新任务的栈恢复上下文，退出异常返回到新任务。
- 关键宏/函数：portYIELD_FROM_ISR、portEND_SWITCHING_ISR、portSET_INTERRUPT_MASK_FROM_ISR/portCLEAR...、vTaskSwitchContext、portSAVE_CONTEXT/portRESTORE_CONTEXT。
- 临界区：taskENTER_CRITICAL/taskEXIT_CRITICAL（Cortex-M 常用 BASEPRI 屏蔽优先级阈值）。

五、阻塞与事件同步
- 延时：vTaskDelay/xTaskDelayUntil 将任务移入延时链表，tick 递减到期后移回就绪链表。
- 等待队列/信号量/互斥量/事件组：
  - 任务进入 Blocked 并挂到对应对象的事件链表，支持超时。
  - 释放事件时按优先级唤醒一个或多个任务。
- 互斥的优先级继承：configUSE_MUTEXES=1 且 configUSE_PRIORITY_INHERITANCE=1 时生效，减少优先级反转。
- 软件定时器：单独的定时器服务任务处理回调（deferred execution）。

六、时间片与低功耗
- 同优先级时间片：tick 到来时轮转链表头到尾；使同优先级公平。
- Tickless Idle：configUSE_TICKLESS_IDLE=1，空闲时暂停节拍定时器，设定低功耗定时器在下一个唤醒点触发，醒来补偿丢失的 tick，显著降功耗。

七、内存管理
1) 任务栈与 TCB
- 动态分配：xTaskCreate 使用 pvPortMalloc 为 TCB 和栈分配内存。
- 静态分配：xTaskCreateStatic 由用户提供 TCB 与栈缓冲（configSUPPORT_STATIC_ALLOCATION=1）。
- 栈大小以“栈宽度单位”（StackType_t）指定，依端口是 4/8 字节。
- 栈溢出检测：configCHECK_FOR_STACK_OVERFLOW（模式 1/2）+ vApplicationStackOverflowHook。

2) 内核对象
- 队列、信号量、事件组、定时器等均可动态或静态创建（如 xQueueCreateStatic、xSemaphoreCreateBinaryStatic）。
- 定时器服务任务与空闲任务可由应用提供静态内存：vApplicationGetTimerTaskMemory/vApplicationGetIdleTaskMemory。

3) 堆实现（heap_1..heap_5）
- heap_1：仅分配不释放，最简单、无碎片，适合启动期一次性分配。
- heap_2：带释放，简单空闲链表，不合并相邻空闲块，易碎片。
- heap_3：封装标准库 malloc/free，线程安全由 FreeRTOS 临界区保护，但实时性取决于 libc。
- heap_4：最佳适配 + 合并相邻空闲块，通用、实时性较好，推荐默认。
- heap_5：多内存区域版本的 heap_4，可配置多个不连续内存段（适合分散 RAM）。
- 选择方式：在 FreeRTOSConfig.h 通过包含相应的 portable/MemMang/heap_x.c 实现一个 pvPortMalloc/vPortFree。
- 线程安全：内核通过临界区保护 pvPortMalloc/vPortFree，使其在任务/中断上下文安全（FromISR 不允许分配）。

4) 注意与建议
- 中断上下文禁止调用会触发阻塞或动态分配的 API；ISR 使用 FromISR 变体，且不能调用 pvPortMalloc。
- 控制碎片：优先使用静态创建或集中在系统初始化阶段一次性动态创建；若需运行期创建/删除，选择 heap_4/5。
- 监控：启用 configUSE_MALLOC_FAILED_HOOK 与 vApplicationMallocFailedHook；配置 uxTaskGetStackHighWaterMark 监控栈余量。

八、常用配置项速览
- configUSE_PREEMPTION、configUSE_TIME_SLICING、configTICK_RATE_HZ、configMAX_PRIORITIES
- configSUPPORT_STATIC_ALLOCATION、configSUPPORT_DYNAMIC_ALLOCATION
- configCHECK_FOR_STACK_OVERFLOW、configUSE_IDLE_HOOK、configUSE_TICK_HOOK、configUSE_TICKLESS_IDLE
- configUSE_MUTEXES、configUSE_RECURSIVE_MUTEXES、configUSE_COUNTING_SEMAPHORES、configUSE_TASK_NOTIFICATIONS
- configQUEUE_REGISTRY_SIZE（队列注册调试）、configASSERT（断言）
- 端口相关：configCPU_CLOCK_HZ、configPRIO_BITS、configLIBRARY_MAX_SYSCALL_INTERRUPT_PRIORITY、configKERNEL_INTERRUPT_PRIORITY、configMAX_SYSCALL_INTERRUPT_PRIORITY

九、常见排障思路
- 任务不切换：检查中断优先级配置（尤其 Cortex-M 的 BASEPRI）、SysTick/PendSV 使能、portYIELD_FROM_ISR 的使用。
- 高优先级“饿死”低优先级：确认是否需要 time slicing 或在高优先级任务里适当阻塞/让出。
- 栈溢出/硬 Fault：开启栈溢出检测、增大疑似任务栈、检查递归/大数组。
- 内存不足/碎片：切换到 heap_4/5，改为静态分配或对象池，合并创建/删除路径。
- 优先级反转：使用互斥量而非二值信号量并开启优先级继承。

如果你有目标平台（如 Cortex-M、RISC-V、Xtensa）或具体 FreeRTOS 版本/配置，我可以结合该端口画出更具体的上下文切换序列图与关键寄存器保存/恢复细节，并给出 FreeRTOSConfig.h 的参考配置。
