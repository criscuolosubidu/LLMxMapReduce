# LLMxMapReduce

<div align="center">
  <p>
    <strong>一个基于LLM的MapReduce框架，旨在简化大规模数据处理和分析。</strong>
  </p>
  <p>
    <img src="https://img.shields.io/badge/Python-3.12-blue.svg" alt="Python">
    <img src="https://img.shields.io/badge/Flask-3.0-green.svg" alt="Flask">
    <img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19-blue.svg" alt="React">
    <img src="https://img.shields.io/badge/PostgreSQL-16-blue.svg" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/MongoDB-7.0-green.svg" alt="MongoDB">
    <img src="https://img.shields.io/badge/Redis-7.2-red.svg" alt="Redis">
    <img src="https://img.shields.io/badge/Docker-26.1-blue.svg" alt="Docker">
  </p>
</div>

---

> 基于LLMxMapReduce框架开发的解决方案，具备完善的前后端系统架构，支持Redis扩展，提供强大的数据处理和分析能力。

## 目录

- [LLMxMapReduce](#llmxmapreduce)
  - [目录](#目录)
  - [✨ 核心特性](#-核心特性)
  - [🛠️ 技术栈](#️-技术栈)
  - [📂 项目结构](#-项目结构)
  - [🚀 本地开发设置](#-本地开发设置)
    - [环境要求](#环境要求)
    - [1. 克隆仓库](#1-克隆仓库)
    - [2. 启动数据库和中间件](#2-启动数据库和中间件)
    - [3. 后端配置](#3-后端配置)
    - [4. 前端配置](#4-前端配置)
    - [5. 环境变量](#5-环境变量)
    - [6. 启动项目](#6-启动项目)
  - [🚢 生产环境部署](#-生产环境部署)
    - [1. 安装系统依赖](#1-安装系统依赖)
    - [2. 配置用户权限](#2-配置用户权限)
    - [3. 启动Docker服务](#3-启动docker服务)
    - [4. 配置环境变量](#4-配置环境变量)
    - [5. uWSGI部署后端](#5-uwsgi部署后端)
    - [6. Systemd部署前端](#6-systemd部署前端)
  - [🤝 贡献指南](#-贡献指南)
  - [📄 许可证](#-许可证)

## ✨ 核心特性

- 🚀 **现代化前端**: 基于 Next.js 构建的现代化、响应式前端界面。
- 🔧 **强大后端**: 采用 Flask 提供稳定、高效的 API 服务。
- 🗄️ **多数据库支持**: 结合 PostgreSQL 和 MongoDB，灵活处理关系型和文档型数据。
- 🔐 **安全认证**: 内置 JWT 身份认证系统，保障数据安全。
- 🤖 **AI 集成**: 集成 OpenAI API，赋予应用强大的智能分析能力。
- ⚡ **高性能缓存**: 通过 Redis 扩展支持，提升系统性能和响应速度。
- 🐳 **容器化部署**: 提供 Docker 支持，简化开发和生产环境部署。

## 🛠️ 技术栈

| 类别       | 技术                                                                          |
| :--------- | :---------------------------------------------------------------------------- |
| **后端**   | Python 3.12, Flask, PostgreSQL, MongoDB, Redis, OpenAI API, JWT              |
| **前端**   | Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI                       |
| **DevOps** | Docker, Nginx, Supervisor, uWSGI, Systemd                                      |

## 📂 项目结构

```
LLMxMapReduce/
├── backend/                 # Flask后端应用
│   ├── src/                 # 源代码目录
│   ├── config/              # 配置文件
│   ├── logs/                # 日志文件
│   ├── app.py               # 主应用程序文件
│   ├── requirements.txt     # Python依赖
│   └── env.template         # 环境变量模板
├── frontend/                # Next.js前端应用
│   ├── app/                 # Next.js路由目录
│   ├── components/          # React组件
│   ├── lib/                 # 工具库
│   ├── styles/              # 样式文件
│   └── package.json         # Node.js依赖
├── assets/                  # 静态资源
├── docker-compose.yml       # Docker配置
└── README.md                # 项目文档
```

## 🚀 本地开发设置

### 环境要求

- Python 3.12+
- Node.js 18+ & pnpm
- Docker & Docker Compose
- Conda

### 1. 克隆仓库

```bash
git clone https://github.com/criscuolosubidu/LLMxMapReduce.git
cd LLMxMapReduce
```

### 2. 启动数据库和中间件

本项目推荐使用 Docker 快速启动所需的数据库和 Redis 服务。

```bash
# 复制配置文件模板
cp docker-compose.yml.template docker-compose.yml

# 根据需要修改 docker-compose.yml (例如：密码、端口等)
# nano docker-compose.yml

# 启动服务 (后台模式)
docker-compose up -d

# 检查服务是否正常运行
docker-compose ps
```

### 3. 后端配置

#### 创建并激活 Conda 环境

```bash
conda create -n llm_mr_v2 python=3.12
conda activate llm_mr_v2
```

#### 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 4. 前端配置

```bash
cd ../frontend
pnpm install
```

### 5. 环境变量

后端服务需要配置环境变量才能正确连接数据库和第三方服务。

```bash
# 进入后端目录
cd backend
# 复制环境变量模板
cp env.template .env
```

编辑 `.env` 文件，填入必要的配置信息。对于本地开发，大部分默认值即可，但请务必填入你的 API 密钥。

```env
# PostgreSQL数据库配置 (应与 docker-compose.yml 中保持一致)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=pguser
POSTGRES_PASSWORD=123456
POSTGRES_DB=llm_mapreduce

# MongoDB配置
MONGO_URI=mongodb://localhost:27017/
MONGO_DATABASE=llm_mapreduce

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# API密钥配置 (请替换为你的密钥)
OPENAI_API_KEY=your-openai-api-key-here
SERPER_API_KEY=your-serper-api-key-here

# JWT密钥 (建议修改为一个随机字符串)
JWT_SECRET_KEY=your-super-secret-jwt-key-here
```

### 6. 启动项目

#### 启动后端服务

```bash
cd backend
python app.py
```
> 👉 后端服务将在 `http://localhost:5000` 运行。

#### 启动前端服务

```bash
cd frontend
pnpm run dev
```
> 👉 前端服务将在 `http://localhost:3000` 运行。

## 🚢 生产环境部署

这是一个参考的生产环境部署流程，假设项目克隆在服务器的 `/home/ubuntu` 目录下。

### 1. 安装系统依赖

<details>
<summary>点击展开查看安装脚本</summary>

```bash
# 更新包管理器
sudo apt update && sudo apt upgrade -y

# 安装必要的系统包
sudo apt install -y build-essential pkg-config
sudo apt install -y nginx supervisor
sudo apt install -y curl wget git

# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装 Miniconda（如果尚未安装）
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh
bash Miniconda3-latest-Linux-x86_64.sh
source ~/.bashrc

# 安装 Node.js 和 pnpm（前端依赖）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
npm install -g pnpm

# 安装编译相关依赖
sudo apt install -y libpq-dev libssl-dev libffi-dev
```
</details>

### 2. 配置用户权限
<details>
<summary>点击展开查看配置脚本</summary>

```bash
# 确保 ubuntu 用户有 Docker 权限
sudo usermod -aG docker ubuntu

# 确保 ubuntu 用户可以访问所需目录
sudo chown -R ubuntu:ubuntu /home/ubuntu/LLMxMapReduce
```
</details>

### 3. 启动Docker服务
```bash
cd /home/ubuntu/LLMxMapReduce

# 启动 Docker Compose 数据库服务
docker-compose up -d

# 检查服务状态
docker-compose ps
```

### 4. 配置环境变量

```bash
# 复制 Docker 环境配置模板
cp env.docker.template .env

# 编辑配置文件，填入实际的值
nano .env
```

### 5. uWSGI部署后端

项目在 `backend` 目录下提供了一个 `uwsgi.ini` 配置文件。由于使用了 `gevent`，需要确保 uWSGI 以 gevent 模式启动，以避免线程冲突。

```bash
cd backend
# 启动服务
uwsgi --ini uwsgi.ini
# 关闭服务
uwsgi --stop uwsgi.pid
```

### 6. Systemd部署前端

使用 `systemd` 管理前端服务，可以实现开机自启和故障自动重启。

<details>
<summary>点击展开查看部署脚本</summary>

```bash
cd frontend

# 安装依赖包，构建生产程序
pnpm install
pnpm build

# 复制 systemd 服务文件
# 注意：请确保 systemd_frontend.service 文件存在且配置正确
sudo cp systemd_frontend.service /etc/systemd/system/mapreduce-frontend.service

# 重新加载 systemd 配置
sudo systemctl daemon-reload

# 启用开机自启
sudo systemctl enable mapreduce-frontend

# 启动服务
sudo systemctl start mapreduce-frontend

# 检查服务状态
sudo systemctl status mapreduce-frontend
```
</details>

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是报告 Bug、提交新功能、改进文档还是其他任何形式的帮助，都对我们非常有价值。

如果您有兴趣为项目做贡献，请：
1.  Fork 本仓库。
2.  创建您的特性分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4.  将分支推送到远程 (`git push origin feature/AmazingFeature`)。
5.  发起一个 Pull Request。

## 📄 许可证

本项目采用 MIT 许可证。有关详细信息，请参阅 `LICENSE` 文件。
