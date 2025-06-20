# LLMxMapReduce 生产环境部署指南

本指南将帮助您在生产环境中部署 LLMxMapReduce 应用，使用 Docker Compose 管理数据库和 Conda 管理 Python 环境，提供了 uWSGI 和 Gunicorn 两种部署方案。

## 🚀 快速开始（5分钟部署）

如果您已经配置好了 Docker、Conda 和 .env 文件，可以使用以下命令快速部署：

```bash
# 1. 启动数据库服务
cd /home/ubuntu/LLMxMapReduce
docker-compose up -d

# 2. 创建并激活 Conda 环境
cd backend
conda create -n llm-mapreduce python=3.10 -y
conda activate llm-mapreduce
pip install -r requirements.txt

# 3. 配置环境变量
cp env.docker.template .env
# 编辑 .env 文件，填入您的 API 密钥和其他配置

# 4. 启动应用（选择其中一种）
# 使用 uWSGI
./scripts/deploy_uwsgi.sh
```

应用将在 http://localhost:5000 启动。

## 📋 部署前准备

### 1. 系统要求
- Ubuntu 18.04+ 或其他 Linux 发行版
- Docker 20.10+
- Docker Compose 2.0+
- Anaconda 或 Miniconda
- Nginx (推荐用作反向代理)

### 2. 安装系统依赖
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

# 安装编译相关依赖
sudo apt install -y libpq-dev libssl-dev libffi-dev
```

### 3. 配置用户权限
```bash
# 确保 ubuntu 用户有 Docker 权限
sudo usermod -aG docker ubuntu

# 确保 ubuntu 用户可以访问所需目录
sudo chown -R ubuntu:ubuntu /home/ubuntu/LLMxMapReduce
```

## 🚀 部署步骤

### 步骤 1: 克隆代码并设置权限
```bash
# 克隆代码到生产目录
cd /opt
sudo git clone https://github.com/your-repo/LLMxMapReduce.git
sudo chown -R ubuntu:ubuntu LLMxMapReduce
sudo chmod -R 755 LLMxMapReduce

# 或使用现有目录
sudo chown -R ubuntu:ubuntu /home/ubuntu/LLMxMapReduce
sudo chmod -R 755 /home/ubuntu/LLMxMapReduce
```

### 步骤 2: 启动数据库服务
```bash
cd /home/ubuntu/LLMxMapReduce

# 启动 Docker Compose 数据库服务
docker-compose up -d

# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs
```

### 步骤 3: 创建 Conda 环境并安装依赖
```bash
cd /home/ubuntu/LLMxMapReduce/backend

# 创建 conda 环境
conda create -n llm-mapreduce python=3.10 -y
conda activate llm-mapreduce

# 升级 pip 并安装依赖
pip install --upgrade pip
pip install -r requirements.txt
```

### 步骤 4: 配置环境变量
```bash
# 复制 Docker 环境配置模板
cp env.docker.template .env

# 编辑配置文件，填入实际的值
nano .env
```

**重要配置项说明（基于 Docker Compose 配置）：**
- `JWT_SECRET_KEY`: 必须更改为安全的随机字符串
- `POSTGRES_HOST=localhost`
- `POSTGRES_PORT=5432`  
- `POSTGRES_USER=huanyu`
- `POSTGRES_PASSWORD=123456`
- `POSTGRES_DB=llm_survey`
- `MONGO_URI=mongodb://localhost:27017/`
- `MONGO_DATABASE=llm_survey`
- `OPENAI_API_KEY`: OpenAI API 密钥
- `API_DEBUG=False`: 生产环境必须设为 False

### 步骤 5: 验证数据库连接

#### 验证 PostgreSQL 连接
```bash
# 使用 Docker 连接 PostgreSQL
docker exec -it postgresql psql -U huanyu -d llm_survey

# 在 PostgreSQL 中检查连接
\l
\q
```

#### 验证 MongoDB 连接
```bash
# 使用 Docker 连接 MongoDB
docker exec -it mongodb mongosh

# 在 MongoDB 中检查连接
show dbs
use llm_survey
show collections
exit
```

### 步骤 6: 创建必要目录
```bash
cd /home/ubuntu/LLMxMapReduce/backend
mkdir -p logs static
sudo chown -R ubuntu:ubuntu logs static
sudo chmod -R 755 logs static
```

## 🔧 部署方案

### 方案一：使用 uWSGI 部署

#### 1. 修改 uWSGI 配置
uWSGI 配置文件已经设置为使用 `ubuntu` 用户：
```ini
# 已配置使用 ubuntu 用户
uid = ubuntu
gid = ubuntu
```

#### 2. 使用脚本启动
```bash
# 直接使用脚本启动
./scripts/deploy_uwsgi.sh

# 或手动启动
conda activate llm-mapreduce
uwsgi --ini uwsgi.ini
```

## 🌐 Nginx 反向代理配置

创建 Nginx 配置文件：
```bash
sudo nano /etc/nginx/sites-available/llm-mapreduce
```

配置内容：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 限制请求体大小
    client_max_body_size 10M;
    
    # 基础安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # 隐藏服务器信息
    server_tokens off;
    
    # 静态文件
    location /static/ {
        alias /home/ubuntu/LLMxMapReduce/backend/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # 认证API
    location /auth/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # 核心业务API
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
    
    # 兑换功能
    location /redemption/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # 前端应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        try_files $uri $uri/ @fallback;
    }
    
    location @fallback {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 日志
    access_log /var/log/nginx/llm-mapreduce.access.log;
    error_log /var/log/nginx/llm-mapreduce.error.log;
}
```

启用 Nginx 配置：
```bash
# 启用站点
sudo ln -s /etc/nginx/sites-available/llm-mapreduce /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

## 🐳 Docker 数据库管理

### 数据库服务管理
```bash
# 启动所有数据库服务
docker-compose up -d

# 停止所有数据库服务
docker-compose stop

# 重启所有数据库服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs
docker-compose logs mongodb
docker-compose logs postgresql
```

### 数据库连接和维护
```bash
# 连接 PostgreSQL
docker exec -it postgresql psql -U huanyu -d llm_survey

# 连接 MongoDB
docker exec -it mongodb mongosh llm_survey

# 查看 Docker 容器资源使用
docker stats mongodb postgresql

# 清理未使用的 Docker 资源
docker system prune -f
```

### 数据卷管理
```bash
# 查看数据卷
docker volume ls

# 备份数据卷
docker run --rm -v llmxmapreduce_mongodb-data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb-data-backup.tar.gz /data
docker run --rm -v llmxmapreduce_postgresql-data:/data -v $(pwd):/backup alpine tar czf /backup/postgresql-data-backup.tar.gz /data

# 恢复数据卷（谨慎操作）
# docker run --rm -v llmxmapreduce_mongodb-data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb-data-backup.tar.gz -C /
```

## 📊 监控和维护

### 1. 查看服务状态
```bash
# 查看应用服务状态
sudo systemctl status llm-mapreduce-uwsgi.service
# 或
sudo systemctl status llm-mapreduce-gunicorn.service

# 查看实时日志
sudo journalctl -u llm-mapreduce-uwsgi.service -f
# 或
sudo journalctl -u llm-mapreduce-gunicorn.service -f
```

### 2. 查看应用日志
```bash
# 应用日志
tail -f /home/ubuntu/LLMxMapReduce/backend/logs/app.log

# uWSGI 日志
tail -f /home/ubuntu/LLMxMapReduce/backend/logs/uwsgi.log

# Gunicorn 日志
tail -f /home/ubuntu/LLMxMapReduce/backend/logs/gunicorn_access.log
tail -f /home/ubuntu/LLMxMapReduce/backend/logs/gunicorn_error.log

# Nginx 日志
tail -f /var/log/nginx/llm-mapreduce.access.log
tail -f /var/log/nginx/llm-mapreduce.error.log
```

### 3. 性能监控
```bash
# 监控系统资源
htop
iotop
nethogs

# 监控 uWSGI 状态（如果启用了统计功能）
curl http://127.0.0.1:9191
```