# TODO Lis 项目说明文档

> **作者**: [季兴菲] **日期**: 2025-11-22

本文档不仅是项目的说明书，更是我对后端架构设计、技术选型决策以及从 Java 向 TypeScript 技术栈迁移过程的深度复盘。

## 1. 技术选型与深度思考

### 编程语言：TypeScript vs Java

- **选择**: **TypeScript** (Node.js)
- **背景与决策**:
  - 作为一名有 Java 背景的开发者，我深知**类型安全**对于后端系统的重要性。弱类型的 JavaScript 在大型项目中极易引发空指针异常 (`undefined is not a function`)。
  - TypeScript 提供了类似 Java 的静态类型检查，同时保留了 JS 的灵活性。
  - **对比体验**:
    - **接口定义**: TS 的 `interface` 与 Java 类似，但在编译后会擦除，无运行时开销，非常轻量。
    - **非阻塞 I/O**: Node.js 的异步模型与 Java 的多线程模型截然不同。在本项目中，我深刻体会到了 `async/await` 语法糖如何让异步代码写起来像同步代码，避免了回调地狱。

### Web 框架：Express.js (v5.x)

- **选择**: **Express.js** (最新 v5 版本)
- **理由**:
  - **生态成熟**: Express 是 Node.js 界的 Spring MVC，拥有庞大的中间件生态。
  - **技术前瞻性**: 本项目特意选择了 **v5 版本**（目前处于 Beta 但已稳定），利用其**原生支持 Promise 错误捕获**的特性。这让我成功移除了 `express-async-errors` 这种“补丁库”，使代码架构更加原生、简洁。

### 数据校验：Zod

- **选择**: **Zod**
- **理由**:
  - 相比 Java 中常用的 `Hibernate Validator` (基于注解)，Zod 采用链式调用的方式定义 Schema。
  - **核心优势**: Zod 能自动从 Schema 推导出 TypeScript 类型 (`z.infer<typeof Schema>`)，实现了**运行时校验**与**编译时类型**的完美统一，这是 Java 很难做到的。

### 数据库与 ORM：SQLite + Prisma

- **选择**: **SQLite** + **Prisma**
- **理由**:
  - **SQLite**: 零配置，文件即数据库。面试官克隆代码后无需安装 MySQL/Docker 即可直接运行，极大提升了 Review 体验。
  - **Prisma**: 它是现代化的 ORM。相比 Java 的 MyBatis/Hibernate，Prisma 的 Schema 定义更直观，且生成的 Client 代码具有极强的类型提示，几乎杜绝了手写 SQL 的拼写错误。

## 2. 架构设计与工程化

### 分层架构 (Layered Architecture)

本项目并未将所有代码堆砌在 `app.ts` 中，而是采用了经典的分层架构，实现了关注点分离：

1. **Server Layer (`server.ts`)**: 负责 HTTP 服务启动与端口监听。
2. **App Layer (`app.ts`)**: 负责 Express 应用配置、中间件挂载。**特意与 Server 分离**，是为了在运行集成测试时，Supertest 可以只引入 App 而不占用真实端口。
3. **Router Layer**: 定义 URL 路由规则。
4. **Controller Layer**: 处理核心业务逻辑，解析参数，调用 Service/DAO。
5. **Global Middleware**: 全局异常处理器，统一兜底所有错误。

### 目录结构

```
root/
├── src/
│   ├── controllers/       # [核心] 业务逻辑
│   ├── middlewares/       # 全局中间件 (如: 统一错误处理器)
│   ├── routes/            # 路由定义
│   ├── app.ts             # 应用配置 (逻辑核心)
│   └── server.ts          # 启动入口
├── prisma/
│   ├── migrations/        # 数据库迁移脚本
│   ├── schema.prisma      # 数据库模型定义
│   └── dev.db             # SQLite 数据库文件
├── tests/                 # 自动化测试 (Jest)
│   └── todo.test.ts       # 集成测试用例
└── swagger.yaml           # 接口文档定义
```

## 3. 核心功能实现细节

### 业务逻辑

- **优先级系统**: 引入 `priority` 字段 (Int 类型: 1-Low, 2-Medium, 3-High)。
  - *设计决策*: 使用 Int 而非 String，是为了利用数据库索引进行高效排序 (`ORDER BY priority DESC`)。
- **动态查询**: `GET /todos` 接口实现了动态构建 Prisma 查询对象。根据 URL 参数是否存在，动态添加 `where` 条件，实现了灵活的组合查询。

### 健壮性设计 

- **全局异常处理**: 摒弃了在每个 Controller 中写重复的 `try-catch`。实现了 `errorHandler` 中间件，统一拦截 Zod 校验错误（返回 400）和 Prisma 数据库错误（返回 404/500）。
- **参数校验**: 所有写操作（POST/PATCH）均经过 Zod 严格校验，确保数据完整性。

## 4. AI 辅助与技术迁移 

本项目在开发过程中，我将 Gemini 作为**结对编程伙伴** 和**技术顾问**，而非单纯的代码生成器。这种人机协作模式极大加速了从 Java 思维到 TypeScript 生态的迁移。

### 4.1 知识迁移与概念映射

由于我具备扎实的 Java 后端基础，我利用 AI 快速建立概念映射，而非从零学习语法：

- **提问策略**: 我没有问“怎么写代码”，而是问“在 Express 中如何实现 Spring Boot 的 `@ControllerAdvice` 全局异常处理机制？”
- **成效**: AI 解释了 Express 中间件的洋葱模型，帮助我快速实现了 `errorHandler`，将我对 AOP (面向切面编程) 的理解成功迁移到了 Node.js 中。

### 4.2 效率提升与代码生成

- **Swagger 定义**: 我定义了接口规范，利用 AI 快速生成了繁琐的 `swagger.yaml` 基础模板，节省了大量编写 YAML 缩进的时间，让我能专注于接口逻辑本身。
- **测试脚手架**: 参考 AI 提供的 Jest + Supertest 最佳实践，快速搭建了覆盖 Happy Path 和 Edge Case 的测试结构。

### 4.3 批判性采纳与修正 (Critical Thinking)

AI 并非总是正确，**保持技术主见**至关重要：

- **案例**: 在处理异步异常时，AI 曾建议引入 `express-async-errors` 库。
- **我的判断**: 我查阅文档发现该库主要针对 Express 4，而我选用的 Express 5 已经原生支持了 Promise 错误捕获。
- **决策**: 我**拒绝**了 AI 的建议，移除了冗余依赖，利用框架原生特性解决了问题。这避免了引入过时库可能带来的兼容性风险。

### 4.4 复杂 Bug 协同排查

- **场景**: 在遇到 Prisma Client 版本冲突 (`Cannot read properties of undefined`) 时。
- **协作**: AI 协助分析了复杂的错误堆栈，提示可能是版本不一致。我根据提示检查了 `package.json` 和 `schema.prisma`，最终定位到是 CLI 工具与 Runtime 库版本不匹配，通过统一版本号并重置环境解决了问题。

## 5. 运行与测试

### 快速开始

1. **安装**: `npm install`
2. **迁移**: `npx prisma migrate dev --name init`
3. **启动**: `npm run dev`

### 自动化测试

本项目包含完整的集成测试。

- **命令**: `npm test`
- **原理**: 使用 **Jest** 作为测试框架，**Supertest** 模拟 HTTP 请求。
- **策略**: 测试脚本利用 `beforeAll` 钩子在每次运行前清空数据库，确保了测试环境的纯净和可重复性。

## 6. 总结与展望

### 亮点总结

1. **工程化完备**: 拥有 Swagger 文档、Jest 自动化测试、Git 规范提交、CI/CD 友好结构。
2. **架构清晰**: 职责分离，代码高内聚低耦合。
3. **健壮性强**: 完善的错误处理机制，杜绝了“未捕获异常导致服务崩溃”的现象。

### 改进方向

- **Docker 化**: 编写 `Dockerfile` 实现容器化部署。
- **认证鉴权**: 引入 JWT 实现用户系统。
- **日志系统**: 引入 `Winston` 替换 `console.log`，实现分级日志管理。