---
title: 奇异递归模板模式 CRTP
date: 2025-09-02 15:17:50
description: 详解C++奇异递归模板模式(CRTP)的原理和应用，实现零开销静态多态的高级编程技巧
tags: [C++, CRTP, 模板编程, 静态多态, 设计模式, 高级C++, 编程技巧]
categories: [编程语言, C++]
cover: 
top_img: 
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

---

### 进阶：与 Deducing this 的结合

在刚才的例子中，为了在基类里调用派生类的方法，我们必须显式地将 `this` 指针进行 `static_cast`，这既不美观，也增加了出错的风险。

C++**23** 引入了“显式 `this` 对象参数”（explicit `this` object parameter），通常称为 "Deducing `this`"。它允许你将 `this` 作为一个明确的函数参数来声明，并可以将其模板化。

它看起来像这样：
```c++
struct MyType {
    // 'self' 的类型会被推导为 *this 对象的实际类型
    template <typename Self>
    void my_method(this Self&& self, /* ... other args ... */) {
        // ...
    }
};
```

这里的 `Self` 会被推导为 `MyType&`, `const MyType&`, `MyType&&`, `const MyType&&` 等等，完美地保留了对象的 `const`/`volatile` 限定和值类别。

当我们将 Deducing `this` 应用于 CRTP 模式时，上述所有痛点都迎刃而解。基类的实现变得异常简洁和优雅。

**结合后的现代化实现：**

```c++
#include <iostream>

template <typename Derived>
class Shape {
public:
    template <typename Self>
    void calculateAndPrintArea(this Self&& self) const {
        // 直接就可调用派生类中实现的 getArea() 方法
        double area = self.getArea();
        
        std::cout << "The area is: " << area << std::endl;
    }
};
```

#### 如果去掉 `template <typename Derived>` 会怎样？

如果我们去掉它，代码依然是合法的，但这就不再是 CRTP 模式了。它会变成一种不同的、更简单的模式，可以称之为 **"Deducing `this` Mixin"**。刚才的例子就可以去掉，因为我们并没有用到它，但是有些情况下不能去掉：

因为 `Derived` 在整个类定义中都有效，所以它能做到许多 `Self` 做不到的事情。这些事情正是 CRTP 模式强大功能的核心。

**示例1：实现静态工厂函数或克隆**

基类可以定义一个创建或复制派生类实例的接口，因为它在编译期就知道 `Derived` 的具体类型。

```c++
template <typename Derived>
struct Clonable {
    // 只有知道 Derived 类型，才能返回 Derived 对象
    Derived clone() const {
        // 使用派生类的拷贝构造函数
        return Derived(static_cast<const Derived&>(*this));
    }

    // 静态工厂函数
    static Derived create() {
        return Derived();
    }
};

struct MyType : public Clonable<MyType> { /* ... */ };

// 使用
MyType obj1;
MyType obj2 = obj1.clone();       // 正确
MyType obj3 = MyType::create();   // 正确
```

如果只用 `deducing this`，`clone` 函数的返回类型无法确定为 `Derived`，因为它在函数签名中不可用。

**示例2：访问派生类的类型别名或静态成员**

基类可以访问派生类中定义的 `static` 成员或类型别名（`using` / `typedef`）。

```c++
template <typename Derived>
struct Component {
    void print_info() const {
        // 访问派生类的静态成员
        std::cout << "Component ID: " << Derived::COMPONENT_ID << std::endl;
    }
};

struct Sensor : public Component<Sensor> {
    static constexpr int COMPONENT_ID = 101;
};

struct Actuator : public Component<Actuator> {
    static constexpr int COMPONENT_ID = 205;
};

// 使用
Sensor s;
s.print_info(); // 输出: Component ID: 101
```

`Self` 是在函数调用时才具象化的实例类型，所以无法用于在**函数签名之外**访问类型的静态属性**（也就是说之内的话也是可以的）。
