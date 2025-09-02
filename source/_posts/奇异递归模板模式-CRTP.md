---
title: 奇异递归模板模式 CRTP
date: 2025-09-02 15:17:50
tags: [C++]
---

## CRTP 的用途
CRTP (Curiously Recurring Template Pattern) 主要用于实现**静态多态**。与 C++ 中常见的虚函数（virtual function）实现的动态多态不同，CRTP 在编译时解析函数调用，因此没有运行时开销。
## 举例
假设我们想创建一个通用的基类，它可以计算任何派生类的面积，只要派生类提供一个 `getArea()` 方法。

### 例子：计算几何图形的面积

首先，我们定义一个**CRTP基类模板** `Shape`。这个基类有一个方法 `calculateAndPrintArea()`，它的任务是调用派生类中实现的 `getArea()` 方法，并打印结果。

```c++
#include <iostream>

template <typename Derived>
class Shape {
public:
    void calculateAndPrintArea() const {
        // 使用 static_cast 将基类指针转换为派生类指针。
        // 这就是 CRTP 的核心：基类“知道”派生类的类型，
        // 从而可以静态调用派生类的成员函数。
        const Derived& derived = static_cast<const Derived&>(*this);
        
        // 调用派生类中实现的 getArea() 方法
        double area = derived.getArea();
        
        std::cout << "The area is: " << area << std::endl;
    }
};
```

---

接下来，我们创建两个具体的**派生类**：`Circle` 和 `Rectangle`。它们都继承自 `Shape`，并以自己作为模板参数。

```c++
class Circle : public Shape<Circle> {
public:
    Circle(double radius) : m_radius(radius) {}
    
    // 派生类必须实现 getArea() 方法
    double getArea() const {
        return 3.14159 * m_radius * m_radius;
    }

private:
    double m_radius;
};

class Rectangle : public Shape<Rectangle> {
public:
    Rectangle(double width, double height) : m_width(width), m_height(height) {}
    
    // 派生类必须实现 getArea() 方法
    double getArea() const {
        return m_width * m_height;
    }

private:
    double m_width;
    double m_height;
};
```

---

### 如何使用

在 `main` 函数中，我们可以创建 `Circle` 和 `Rectangle` 对象，并直接调用基类中定义的 `calculateAndPrintArea()`方法。

```c++
int main() {
    Circle circle(5.0);
    Rectangle rectangle(4.0, 6.0);

    // 调用基类的方法，但实际上会调用派生类中实现的 getArea()
    circle.calculateAndPrintArea();      // 输出: The area is: 78.5397
    rectangle.calculateAndPrintArea();   // 输出: The area is: 24
    
    return 0;
}
```

### 为什么这个例子体现了 CRTP？

在这个例子中，`Shape` 基类模板利用**奇异递归模板模式**实现了**静态多态**。

1. **静态类型信息**：当 `Circle` 继承 `Shape<Circle>` 时，`Shape` 类在编译时就知道了它所操作的对象类型是 `Circle`。
   
2. **静态绑定**：在 `Shape::calculateAndPrintArea()` 方法中，`static_cast<const Derived&>(*this)` 将 `Shape` 对象的引用转换为一个**编译时已知的派生类引用**。
   
3. **无运行时开销**：`derived.getArea()` 的调用是一个**普通的函数调用**，而不是虚函数表查找。这使得代码在运行时更加高效。
   

通过这个模式，我们为所有派生类提供了通用的接口 (`calculateAndPrintArea()`)，同时将具体实现 (`getArea()`) 留给每个派生类自己完成，所有这些都在**编译时**完成，没有任何运行时多态的开销。
