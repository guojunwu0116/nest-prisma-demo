# AI 班级管理系统后端 (NestJS + Prisma)

## 环境要求
- Node.js 20+
- MySQL / MariaDB
- pnpm (推荐)

## 快速开始

```bash
cd server
pnpm install
cp .env.example .env
```

编辑 `.env` 中的数据库连接与 JWT 密钥。

### 初始化数据库

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

### 启动

```bash
pnpm start:dev
```

服务默认监听 `http://localhost:3000`。

## 测试

本项目的单元测试为逻辑测试（不依赖数据库）。

```bash
pnpm test
```

## 接口概览
- 认证：`/api/auth/web/login`、`/api/auth/wx/login`、`/api/auth/wx/bind`、`/api/auth/me`
- 邀请码：`/api/invites`
- 学生档案：`/api/students`
- 请假：`/api/leaves`
- 考勤：`/api/attendance`
- 积分流水：`/api/points`

## Ubuntu 24.04 部署示例

### 1) 安装依赖

```bash
sudo apt update
sudo apt install -y nodejs npm mysql-server
sudo npm i -g pnpm
```

### 2) 部署代码

```bash
cd /opt
sudo git clone <your_repo> ai-class-backend
cd ai-class-backend/server
pnpm install
cp .env.example .env
```

配置 `.env` 后执行：

```bash
pnpm prisma:generate
pnpm prisma:deploy
pnpm prisma:seed
pnpm build
```

### 3) systemd 服务

创建 `/etc/systemd/system/ai-class-backend.service`：

```ini
[Unit]
Description=AI Class Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/ai-class-backend/server
ExecStart=/usr/bin/node dist/main.js
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/opt/ai-class-backend/server/.env

[Install]
WantedBy=multi-user.target
```

启动服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable ai-class-backend
sudo systemctl start ai-class-backend
```

### 4) Nginx 反代示例

```nginx
server {
  listen 80;
  server_name your.domain.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## 种子账户
- admin / password123
- teacher / password123
