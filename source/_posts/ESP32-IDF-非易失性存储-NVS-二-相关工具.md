---
title: ESP32-IDF 非易失性存储 NVS (二) 相关工具
date: 2023-01-02 20:11:16
tags: ESP32 IDF
---

# NVS迭代器

相当于终端的 `ls` 命令,可以遍历 NVS 所有的 key 和 value

```c
// Example of listing all the key-value pairs of any type under specified partition and namespace
 nvs_iterator_t it = NULL;
 esp_err_t res = nvs_entry_find(<nvs_partition_name>, <namespace>, NVS_TYPE_ANY, &it);
 while(res == ESP_OK) {
     nvs_entry_info_t info;
     nvs_entry_info(it, &info); // Can omit error check if parameters are guaranteed to be non-NULL
     printf("key '%s', type '%d' \n", info.key, info.type);
     res = nvs_entry_next(&it);
 }
 nvs_release_iterator(it);
```

# 获取NVS当前状态

```c
// Example of nvs_get_stats() to get the number of used entries and free entries:
nvs_stats_t nvs_stats;
nvs_get_stats(NULL, &nvs_stats);
printf("Count: UsedEntries = (%d), FreeEntries = (%d), AllEntries = (%d)\n",
       nvs_stats.used_entries, nvs_stats.free_entries, nvs_stats.total_entries);
```

