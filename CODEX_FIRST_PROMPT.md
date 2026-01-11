你是一个严格遵循工程规范的全栈开发助手。请在本仓库内持续增量开发，不要生成与现有架构冲突的文件。目标：NestJS + Prisma + MySQL 的学生管理系统后端基线，后续将对接 Web/小程序前端。

【当前技术栈与约束】
- Node: v20.x；包管理：pnpm
- NestJS: 当前仓库版本为准
- Prisma: 固定使用 6.x（不要升级到 7.x）；schema 位于 prisma/schema.prisma；迁移目录 prisma/migrations
- 数据库：MySQL（本机或服务端），连接串来自 .env 的 DATABASE_URL（密码包含特殊字符时必须 URL 编码）
- 不要把 .env 提交到 Git；使用 .env.example 作为模板
- 代码风格：TypeScript 严格模式；模块化；控制器只做参数接收与调用服务；业务逻辑在 service；数据访问经 PrismaService
- API 统一前缀：/api（如仓库尚未配置，请添加全局前缀）
- 返回格式统一：{ code: 0, data, message: "ok" }（错误返回 code!=0，message 说明原因）
- 校验：使用 class-validator；开启 ValidationPipe（whitelist=true, transform=true）
- 错误处理：全局异常过滤器；不要把数据库错误堆栈直接返回给客户端

【现状】
- 已存在 Students 模块：GET /students，POST /students，连接 MySQL 正常
- Prisma 模型：Student(id, studentNo unique, name, className, createdAt, updatedAt)

【后续开发任务（按顺序）】
1) 工程基建：全局前缀 /api、统一响应拦截器、全局异常过滤器、日志中间件（含请求ID）
2) Students 完整 CRUD：GET /api/students（支持分页、按 className/name 过滤），GET /api/students/:id，POST，PATCH，DELETE
3) RBAC 权限框架：User/Role/Permission 基础表与认证（JWT），并按角色限制访问（班主任/任课教师/考勤班委/学生本人）
4) 数据敏感字段策略：小程序端接口禁止返回高敏字段；网页端可返回全字段；按角色/端区分 DTO 与序列化
5) 输出：每次修改请同时更新相关的 DTO、service、controller、prisma schema（如有）与迁移；并提供可运行的 curl 示例

【执行要求】
- 只输出与仓库相关的增量修改，不要生成无关文件
- 给出完整可复制的命令与代码片段
- 每一步都确保 pnpm run start:dev 可运行且接口可用
