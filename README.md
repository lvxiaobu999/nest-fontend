# Nest + Prisma + PostgreSQL 环境配置说明

## 已完成内容

- 数据库统一使用 PostgreSQL
- 使用 Prisma 7 连接并操作 PostgreSQL
- 已区分开发环境与生产环境
- 已提供 Docker Compose 启动数据库脚本
- Nest 已接入全局环境变量加载与校验
- Prisma 已支持根据 `NODE_ENV` 自动切换环境配置
- 已补充中文注释与中文说明文档

## 环境文件说明

项目根目录现在包含以下环境文件：

- `.env.development`：开发环境配置
- `.env.production`：生产环境配置
- `.env.example`：通用模板说明
- `.env`：可选的本地公共兜底配置，不参与环境区分

当前约定如下：

- 开发环境使用 `.env.development`
- 生产环境使用 `.env.production`
- 当脚本未显式指定时，默认按开发环境处理

## 当前环境差异

### 开发环境

```env
NODE_ENV=development
PORT=3000
POSTGRES_PORT=5432
POSTGRES_DB=nest_prisma_dev
COMPOSE_PROJECT_NAME=nest_frontend_dev
```

### 生产环境

```env
NODE_ENV=production
PORT=3001
POSTGRES_PORT=5433
POSTGRES_DB=nest_prisma_prod
COMPOSE_PROJECT_NAME=nest_frontend_prod
```

这样配置的好处是：

- 开发库和生产库不会混用
- Docker 容器、端口、数据卷会按环境区分
- Prisma 和 Nest 都会读取对应环境的数据库地址

## 关键配置文件

```text
.
├─ .env.development            # 开发环境变量
├─ .env.production             # 生产环境变量
├─ docker-compose.yml          # PostgreSQL 容器编排
├─ prisma.config.ts            # Prisma 7 配置入口
├─ prisma
│  ├─ load-env.js              # Prisma 专用环境变量加载器
│  ├─ schema.prisma            # Prisma 数据模型
│  └─ seed.js                  # 种子数据脚本
├─ src
│  ├─ config                   # Nest 环境配置与校验
│  ├─ prisma                   # PrismaService
│  └─ users                    # 用户表示例模块
└─ README.md                   # 当前说明文档
```

## package.json 已配置指令

| 指令                             | 作用                           |
| -------------------------------- | ------------------------------ |
| `pnpm run start`                 | 按开发环境启动 Nest            |
| `pnpm run start:dev`             | 按开发环境监听启动 Nest        |
| `pnpm run start:debug`           | 按开发环境调试启动 Nest        |
| `pnpm run start:prod`            | 按生产环境运行构建产物         |
| `pnpm run build`                 | 以生产模式构建项目             |
| `pnpm run format`                | 格式化代码与文档               |
| `pnpm run lint`                  | 执行 ESLint 检查并自动修复     |
| `pnpm run test`                  | 以开发环境运行单元测试         |
| `pnpm run test:e2e`              | 以开发环境运行 e2e 测试        |
| `pnpm run db:up`                 | 启动开发环境数据库             |
| `pnpm run db:down`               | 停止开发环境数据库             |
| `pnpm run db:logs`               | 查看开发环境数据库日志         |
| `pnpm run db:up:dev`             | 启动开发环境 PostgreSQL        |
| `pnpm run db:down:dev`           | 停止开发环境 PostgreSQL        |
| `pnpm run db:logs:dev`           | 查看开发环境 PostgreSQL 日志   |
| `pnpm run db:up:prod`            | 启动生产环境 PostgreSQL        |
| `pnpm run db:down:prod`          | 停止生产环境 PostgreSQL        |
| `pnpm run db:logs:prod`          | 查看生产环境 PostgreSQL 日志   |
| `pnpm run prisma:generate`       | 按开发环境生成 Prisma Client   |
| `pnpm run prisma:generate:prod`  | 按生产环境生成 Prisma Client   |
| `pnpm run prisma:format`         | 格式化 `schema.prisma`         |
| `pnpm run prisma:migrate:dev`    | 对开发环境执行迁移             |
| `pnpm run prisma:migrate:deploy` | 对生产环境执行迁移             |
| `pnpm run prisma:push`           | 将开发环境模型直接同步到数据库 |
| `pnpm run prisma:seed`           | 向开发环境写入种子数据         |
| `pnpm run prisma:studio`         | 打开开发环境 Prisma Studio     |

## 开发环境使用方式

1. 启动开发数据库

```bash
pnpm run db:up:dev
```

2. 生成开发环境 Prisma Client

```bash
pnpm run prisma:generate
```

3. 执行开发环境迁移

```bash
pnpm run prisma:migrate:dev --name init
```

4. 写入开发环境种子数据

```bash
pnpm run prisma:seed
```

5. 启动开发服务

```bash
pnpm run start:dev
```

## 生产环境使用方式

1. 启动生产数据库

```bash
pnpm run db:up:prod
```

2. 生成生产环境 Prisma Client

```bash
pnpm run prisma:generate:prod
```

3. 执行生产迁移

```bash
pnpm run prisma:migrate:deploy
```

4. 构建项目

```bash
pnpm run build
```

5. 启动生产服务

```bash
pnpm run start:prod
```

## Docker 直接命令

如果你想直接使用 Docker Compose，也可以这样执行：

### 开发环境

```bash
docker compose --env-file .env.development up -d
docker compose --env-file .env.development down
docker compose --env-file .env.development logs -f postgres
```

### 生产环境

```bash
docker compose --env-file .env.production up -d
docker compose --env-file .env.production down
docker compose --env-file .env.production logs -f postgres
```

## Prisma 与 Nest 的环境切换规则

- Nest 会根据 `NODE_ENV` 自动加载对应的环境文件
- Prisma 会根据 `NODE_ENV` 自动读取对应的数据库连接地址
- `start:dev`、`test`、`prisma:migrate:dev` 等脚本默认使用开发环境
- `start:prod`、`build`、`prisma:migrate:deploy` 等脚本默认使用生产环境

## 接口示例

- `GET /`：查看服务状态
- `GET /users`：查询全部用户
- `GET /users/:id`：按 ID 查询用户
- `POST /users`：创建用户
- `PATCH /users/:id`：更新用户
- `DELETE /users/:id`：删除用户

### `POST /users`

```json
{
  "email": "demo@example.com",
  "name": "演示用户"
}
```

## 说明补充

- 生产环境中的账号、密码、数据库地址建议改成你自己的真实配置
- 如果你后面还想继续补 Redis、JWT、日志分级、接口前缀、配置模块拆分，我可以继续帮你一起完善
