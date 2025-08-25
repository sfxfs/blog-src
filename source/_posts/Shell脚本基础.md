---
title: Shell脚本基础
date: 2025-08-25 20:29:40
tags: [Shell, Linux, Script]
---

注意：在本文中，不以 ` #!/bin/bash` 开头的代码均为伪代码或命令，仅供示意。

## Hello World

```bash
#!/bin/bash
# 上面一行称为 shabang，为的是直接执行脚本的时候能使用正确的解释器
echo "Hello, world!"
```

使用以下命令来检查语法错误：

```shell
bash -n ./xxx.sh
```

没有错误将不会有任何输出，执行脚本可以通过以下命令：

```bash
bash ./xxx.sh # 直接指定解释器来执行
# or
chmod +x ./xxx.sh && ./xxx.sh # 把脚本赋予可执行权限后直接执行
```



## 使用变量和注释

```bash
# 这是一个注释，不会被执行
```

获取变量的值：

```bash
#!/bin/bash
echo $BASH # '$'加变量名用于获取变量值
# 全大写的一般为系统变量，用户自行定义的变量一般写成全小写形式
# 如 '$HOME $PATH $PWD'
```

定义一个变量：

```bash
name=Mark
```

使用这个变量：

```bash
echo The name is $name
```

## 读取用户输入

单一变量：

```bash
#!/bin/bash
echo "Enter name: "
read name
echo "Your name is $name."
```

多个变量：

```bash
#!/bin/bash
echo "Enter name: "
read name1 name2 name3
echo "Your name is $name1, $name2, $name3."
```

太麻烦了，使用数组来读取：

```bash
read -a names # array
echo "Names: ${names[0]}, ..."
```

输入时请在每个名字间加入空格。如果我们想在同一行打印和输入或者在输密码的时候保证隐私：

```bash
#!/bin/bash
read -p 'Enter username: ' user_name
read -sp 'Enter password: ' user_password # 输入将不会有任何回显
echo "name is $user_name"
```

如果你不想定义变量来存储：

```bash
#!/bin/bash
echo "Enter name: "
read
echo "Your name is $REPLY."
# read 会把读取到的都存进 $REPLY，这是个系统变量
```

## 向脚本传入参数

```bash
#!/bin/bash
echo $0 $1 $2
```

如果是通过下面指令执行的：

```shell
./xxx.sh -qwq 123
```

将会打印：

```
./xxx.sh -qwq 123
```

将参数作为数组存储：

```bash
args=("$@") # '$@'作为数组
echo ${arg[0]} ...
# 但是请注意，arg[0] 等效 $1 而不是 $0
```

打印一共传入了多少个参数：

```bash
echo $# # 同样，不包括 $0
```

## if 语句

```bash
#!/bin/bash
count=10

if [ $count -eq 10 ]
then
	echo "cond is true"
else
	echo "cond is false"
fi
```

### 整型数对比

| 语句                | 效果     |
| ------------------- | -------- |
| -eq                 | 等于     |
| -ne                 | 不等于   |
| -gt or > if ((  ))  | 大于     |
| -ge or >= if ((  )) | 大于等于 |
| -lt or < if ((  ))  | 小于     |
| -le or <= if ((  )) | 小于等于 |

`if((  ))` 代表语句要包括在里面，于正常的 `if[  ]` 不同。

### 字符串对比

| 语句        | 效果              |
| ----------- | ----------------- |
| = or ==     | 等于              |
| !=          | 不等于            |
| < if [[  ]] | ASCII码表来比大小 |
| > if [[  ]] | 同上              |
| -z          | null，长度为0     |

`if[[  ]]` 代表语句要包括在里面，于正常的 `if[  ]` 不同。

## 文件操作符

| 操作符  | 说明                                                         | 举例                      |
| :------ | :----------------------------------------------------------- | :------------------------ |
| -b file | 检测文件是否是块设备文件，如果是，则返回 true。              | [ -b $file ] 返回 false。 |
| -c file | 检测文件是否是字符设备文件，如果是，则返回 true。            | [ -c $file ] 返回 false。 |
| -d file | 检测文件是否是目录，如果是，则返回 true。                    | [ -d $file ] 返回 false。 |
| -f file | 检测文件是否是普通文件（既不是目录，也不是设备文件），如果是，则返回 true。 | [ -f $file ] 返回 true。  |
| -g file | 检测文件是否设置了 SGID 位，如果是，则返回 true。            | [ -g $file ] 返回 false。 |
| -k file | 检测文件是否设置了粘着位(Sticky Bit)，如果是，则返回 true。  | [ -k $file ] 返回 false。 |
| -p file | 检测文件是否是有名管道，如果是，则返回 true。                | [ -p $file ] 返回 false。 |
| -u file | 检测文件是否设置了 SUID 位，如果是，则返回 true。            | [ -u $file ] 返回 false。 |
| -r file | 检测文件是否可读，如果是，则返回 true。                      | [ -r $file ] 返回 true。  |
| -w file | 检测文件是否可写，如果是，则返回 true。                      | [ -w $file ] 返回 true。  |
| -x file | 检测文件是否可执行，如果是，则返回 true。                    | [ -x $file ] 返回 true。  |
| -s file | 检测文件是否为空（文件大小是否大于0），不为空返回 true。     | [ -s $file ] 返回 true。  |
| -e file | 检测文件（包括目录）是否存在，如果是，则返回 true。          | [ -e $file ] 返回 true。  |
