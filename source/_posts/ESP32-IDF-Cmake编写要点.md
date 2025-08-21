---
title: ESP32-IDF Cmake编写要点
date: 2022-11-08 19:58:47
tags: [ESP32, IDF]
---

## 1.文件通配 & 增量构建
在 ESP-IDF 组件中添加源文件的首选方法是在 COMPONENT_SRCS 中手动列出它们:

```cmake
idf_component_register(SRCS library/a.c library/b.c platform/platform.c
                       ...)
```

这是在 CMake 中手动列出源文件的 最佳实践。然而，当有许多源文件都需要添加到构建中时，这种方法就会很不方便。ESP-IDF 构建系统因此提供了另一种替代方法，即使用 SRC_DIRS 来指定源文件:

```cmake
idf_component_register(SRC_DIRS library platform
                       ...)
```

后台会使用通配符在指定的目录中查找源文件。但是请注意，在使用这种方法的时候，如果组件中添加了一个新的源文件，CMake 并不知道重新运行配置，最终该文件也没有被加入构建中。

如果是自己添加的源文件，这种折衷还是可以接受的，因为用户可以触发一次干净的构建，或者运行 idf.py reconfigure 来手动重启 CMake。但是，如果你需要与其他使用 Git 等版本控制工具的开发人员共享项目时，问题就会变得更加困难，因为开发人员有可能会拉取新的版本。

ESP-IDF 中的组件使用了第三方的 Git CMake 集成模块（/tools/cmake/third_party/GetGitRevisionDescription.cmake），任何时候源码仓库的提交记录发生了改变，该模块就会自动重新运行 CMake。即只要拉取了新的 ESP-IDF 版本，CMake 就会重新运行。

对于不属于 ESP-IDF 的项目组件，有以下几个选项供参考：

如果项目文件保存在 Git 中，ESP-IDF 会自动跟踪 Git 修订版本，并在它发生变化时重新运行 CMake。

如果一些组件保存在第三方 Git 仓库中（不在项目仓库或 ESP-IDF 仓库），则可以在组件 CMakeLists 文件中调用 git_describe 函数，以便在 Git 修订版本发生变化时自动重启 CMake。

**如果没有使用 Git，请记住在源文件发生变化时手动运行 idf.py reconfigure。**

使用 idf_component_register 的 SRCS 参数来列出项目组件中的所有源文件则可以完全避免这一问题。

具体选择哪一方式，就要取决于项目本身，以及项目用户。

## 2. 嵌入二进制数据
有时您的组件希望使用一个二进制文件或者文本文件，但是您又不希望将它们重新格式化为 C 源文件。

这时，您可以在组件注册中指定 EMBED_FILES 参数，用空格分隔要嵌入的文件名称:

```cmake
idf_component_register(...
                       EMBED_FILES server_root_cert.der)
```

或者，如果文件是字符串，则可以使用EMBED_TXTFILES 变量，把文件的内容转成以 null 结尾的字符串嵌入:

```cmake
idf_component_register(...
                       EMBED_TXTFILES server_root_cert.pem)
```

文件的内容会被添加到 Flash 的 .rodata 段，用户可以通过符号名来访问，如下所示:

```c
extern const uint8_t server_root_cert_pem_start[] asm("_binary_server_root_cert_pem_start");
extern const uint8_t server_root_cert_pem_end[]   asm("_binary_server_root_cert_pem_end");
```

符号名会根据文件全名生成，如 EMBED_FILES 中所示，字符 /、. 等都会被下划线替代。符号名称中的 _binary 前缀由 objcopy 命令添加，对文本文件和二进制文件都是如此。

如果要将文件嵌入到项目中，而非组件中，可以调用 target_add_binary_data 函数:

```cmake
target_add_binary_data(myproject.elf "main/data.bin" TEXT)
```

文件的内容会被添加到 Flash 的 .rodata 段，用户可以通过符号名来访问，如下所示:

```c
extern const uint8_t server_root_cert_pem_start[] asm("_binary_server_root_cert_pem_start");
extern const uint8_t server_root_cert_pem_end[]   asm("_binary_server_root_cert_pem_end");
```

符号名会根据文件全名生成，如 EMBED_FILES 中所示，字符 /、. 等都会被下划线替代。符号名称中的 _binary 前缀由 objcopy 命令添加，对文本文件和二进制文件都是如此。
如果要将文件嵌入到项目中，而非组件中，可以调用 target_add_binary_data 函数:

```cmake
target_add_binary_data(myproject.elf "main/data.bin" TEXT)
```

并将这行代码放在项目 CMakeLists.txt 的 project() 命令之后，修改 myproject.elf 为你自己的项目名。如果最后一个参数是 TEXT，那么构建系统会嵌入以 null 结尾的字符串，如果最后一个参数被设置为 BINARY，则将文件内容按照原样嵌入。

有关使用此技术的示例，请查看 file_serving 示例 protocols/http_server/file_serving/main/CMakeLists.txt 中的 main 组件，两个文件会在编译时加载并链接到固件中。

也可以嵌入生成的文件:

```cmake
add_custom_command(OUTPUT my_processed_file.bin
                  COMMAND my_process_file_cmd my_unprocessed_file.bin)
target_add_binary_data(my_target "my_processed_file.bin" BINARY)
```

上述示例中，my_processed_file.bin 是通过命令 my_process_file_cmd 从文件 my_unprocessed_file.bin 中生成，然后嵌入到目标中。

使用 DEPENDS 参数来指明对目标的依赖性:

```cmake
add_custom_target(my_process COMMAND ...)
target_add_binary_data(my_target "my_embed_file.bin" BINARY DEPENDS my_process)
```

target_add_binary_data 的 DEPENDS 参数确保目标首先执行。

----------转自IDF官方文档
