---
title: 在C语言下在结构体内加入函数
date: 2022-09-08 01:51:32
tags: [C]
---

## 前提知识

Class类与Struct结构体最大的区别可能就是内部能不能有函数，在C语言下结构体虽然不能直接加入函数，但是我们可以通过指针曲线救国。

先来看一个函数指针的例子(来自c++ primer plus):

```c++
#include <iostream>
double betsy(int);
double pam(int);
void estimate(int lines,double (*pf)(int));

int main()
{
	using namespace std;
	int code;
	cout << "line of code : ";
	cin >> code;
	cout << "betsy time : ";
	estimate(code, betsy);
	cout << "pam time : ";
	estimate(code, pam);
	return 0;
}

double betsy(int lns)
{
	return 0.05 * lns;
}

double pam(int lns)
{
	return 0.03 *lns;
}

void estimate(int lines, double (*pf)(int))
{
	using namespace std;
	cout << lines << " lines will take ";
	cout << (*pf)(lines) << " hours \n";
}

```

## 开始实例

现在开始我们的实例先创建下面的这个结构体：

```c
struct test {
    int num;
    char name;
    void (*show)(void);
};
```

可以像这样初始化：

```c
void fxf(void);
struct test test1={0, 'a', *fxf};
```

最后贴上完整代码，代码最终运行了一个结构体“中”的函数：

```c
#include <stdio.h>

struct test {
    int num;
    char name;
    void (*show)();
};

void (*cur_task)();
void fxf(){
	printf("fxf");
};

int main(){
	struct test test1;
	test1.show = fxf;	//函数名就是指针
	cur_task = test1.show;
	(*cur_task)();	//最终运行了fxf这个函数
	return 0;
}
```

两个函数指针 ***cur_task*** 和 ***show*** 后面的参数不必与 ***fxf*** 函数的一样。
