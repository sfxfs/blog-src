---
title: move和forward的区别和应用场景
date: 2025-09-30 09:36:46
tags: [C++]
---

在 C++ 中，`std::move` 和 `std::forward` 都涉及到“右值引用”和“资源移动”，但应用场景不同：

---

## 1. `std::move`

### **应用场景**
- **强制把对象变成右值**，用于触发移动语义（如移动构造、移动赋值）。
- 适用于你已经不再需要原对象，可以“搬走”其资源。
- 常用于容器插入、函数返回、资源转移等场景。

### **示例**

```cpp
#include <vector>
#include <string>
#include <utility>

std::vector<std::string> v;
std::string s = "hello";

// 将 s 的内容“搬”到容器里，而不是拷贝
v.push_back(std::move(s)); // s 变为空
```

---

## 2. `std::forward`

### **应用场景**
- 用于**完美转发**（perfect forwarding），保持参数的原始类型（左值/右值）。
- 通常在**模板函数**中，将参数原样“传递”到另一个函数。
- 适用于写通用包装函数、工厂函数等场景。

### **示例**

```cpp
#include <utility>

template <typename T>
void wrapper(T&& arg) {
    // 保持 arg 的左值/右值属性，完美转发到目标函数
    target_func(std::forward<T>(arg));
}
```

- 如果 `wrapper(s)`，`std::forward<T>(arg)` 会是左值。
- 如果 `wrapper(std::move(s))`，`std::forward<T>(arg)` 会是右值。

---

## 总结

- `std::move`：将对象变成右值，触发移动语义。**适合你已经不再需要原对象的场景。**
- `std::forward`：保持参数原始属性，用于模板中的完美转发。**适合泛型代码和包装/转发调用。**
