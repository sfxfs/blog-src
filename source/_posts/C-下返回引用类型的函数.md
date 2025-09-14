---
title: C++下返回引用类型的函数
date: 2022-09-17 16:33:58
description: 详解C++中返回引用类型函数的使用方法和实际应用，包括函数链式调用的实现原理
tags: [C++, 函数, 引用, 编程技巧, 面向对象]
categories: [编程语言, C++]
cover: 
top_img: 
---

## 1. 先申明一个类

```c++
class Test
{
private:
    int a;
    int b;
public:
    Test(int a, int b);
    
    Test& addA(Test &t);	//返回值为Test类的引用，传入参数为Test的引用
    
    void setA(int a);
    void setB(int b);
    int getA();
    int getB();
}
```

## 2. 定义一个函数

```c++
Test& Test::addA(Test& t)
{
	int a = t.getA();
    this -> a += a;	//即使两个变量名称一样，但this指针区分了这两个变量
    return *this;	//返回整个对象本身
}
```

## 3. 具体应用

```c++
#include <iostream>

class Test
{
private:
    int a;
    int b;
public:
    Test(int A, int B):a(A), b(B){};
    
    Test& addA(Test &t);	//返回值为Test类的引用，传入参数为Test的引用
    
    int getA(){return this -> a;};
    int getB(){return this -> b;};
};

Test& Test::addA(Test& t)
{
	int a = t.getA();
    this -> a += a;	//即使两个变量名称一样，但this指针区分了这两个变量
    return *this;	//返回整个对象本身
}

int main()
{
    Test t1(1, 2);
    Test t2(3, 4);
    std::cout << "before: " << t1.getA() << std::endl;
    
    t1.addA(t2).addA(t2).addA(t2);  
    //t1的a加了3次t2的a，最后等于1+3+3+3 = 10,如果没有返回引用则只能加一次，就不能像这样套娃了
    
    std::cout << "after: " << t1.getA() << std::endl;
    return 0;
}
```

