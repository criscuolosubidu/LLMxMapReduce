# LLMxMapReduce systemd 服务设置指南

## 概述

本指南介绍如何将 LLMxMapReduce 后端服务配置为 systemd 服务，实现系统启动时自动启动、服务管理和监控。

## 准备工作

确保你已经完成以下步骤：

1. ✅ 安装了 Docker 和 docker-compose
2. ✅ 配置了 Conda 环境 `llm_mr_v2`
3. ✅ 创建了 `.env` 环境变量文件
4. ✅ 数据库服务（PostgreSQL 和 MongoDB）可以正常启动

## 安装 systemd 服务

### 1. 运行安装脚本

```bash
cd /home/ubuntu/LLMxMapReduce/backend
sudo bash scripts/setup_systemd.sh install
```

### 2. 启动服务

```bash
sudo systemctl start llmxmapreduce-backend
```

### 3. 检查服务状态

```bash
sudo systemctl status llmxmapreduce-backend
```

## 服务管理命令

### 基本管理命令

```bash
# 启动服务
sudo systemctl start llmxmapreduce-backend

# 停止服务
sudo systemctl stop llmxmapreduce-backend

# 重启服务
sudo systemctl restart llmxmapreduce-backend

# 重新加载配置（平滑重启）
sudo systemctl reload llmxmapreduce-backend

# 查看服务状态
sudo systemctl status llmxmapreduce-backend
```

### 开机启动管理

```bash
# 启用开机启动
sudo systemctl enable llmxmapreduce-backend

# 禁用开机启动
sudo systemctl disable llmxmapreduce-backend

# 检查是否启用开机启动
sudo systemctl is-enabled llmxmapreduce-backend
```

### 日志查看

```bash
# 查看实时日志
sudo journalctl -u llmxmapreduce-backend -f

# 查看最近的日志
sudo journalctl -u llmxmapreduce-backend -n 50

# 查看特定时间的日志
sudo journalctl -u llmxmapreduce-backend --since "2024-01-01 10:00:00"

# 查看应用日志文件
tail -f /home/ubuntu/LLMxMapReduce/backend/logs/uwsgi.log
tail -f /home/ubuntu/LLMxMapReduce/backend/logs/systemd.log
```

## 服务配置详解

### systemd 服务文件位置

- 服务文件：`/etc/systemd/system/llmxmapreduce-backend.service`
- 源配置：`/home/ubuntu/LLMxMapReduce/backend/llmxmapreduce-backend.service`

### 关键配置说明

```ini
[Unit]
Description=LLMxMapReduce Backend Service
After=network.target docker.service    # 依赖网络和Docker服务
Requires=docker.service                 # 强制依赖Docker

[Service]
Type=forking                           # 后台运行模式
User=ubuntu                            # 运行用户
Group=ubuntu                           # 运行用户组
WorkingDirectory=/home/ubuntu/LLMxMapReduce/backend

# 启动前检查数据库连接
ExecStartPre=/bin/bash -c 'cd /home/ubuntu/LLMxMapReduce && docker-compose up -d'

# 启动uWSGI服务
ExecStart=/home/ubuntu/miniconda3/envs/llm_mr_v2/bin/uwsgi --ini uwsgi.ini

# 重启策略
Restart=always                         # 总是重启
RestartSec=10                         # 重启间隔10秒
```

## 故障排除

### 1. 服务启动失败

```bash
# 检查服务状态
sudo systemctl status llmxmapreduce-backend -l

# 查看详细日志
sudo journalctl -u llmxmapreduce-backend -n 100
```

### 2. 常见问题及解决方案

#### 问题：Conda 环境未找到
```
解决方案：检查 Conda 安装路径，修改服务文件中的 Environment 路径
```

#### 问题：数据库连接失败
```bash
# 检查数据库服务
cd /home/ubuntu/LLMxMapReduce
docker-compose ps

# 重启数据库服务
docker-compose restart postgresql mongodb
```

#### 问题：端口占用
```bash
# 检查端口占用
sudo lsof -i :5000
sudo lsof -i :8000

# 杀死占用进程
sudo fuser -k 5000/tcp
sudo fuser -k 8000/tcp
```

#### 问题：权限错误
```bash
# 修复日志目录权限
sudo chown -R ubuntu:ubuntu /home/ubuntu/LLMxMapReduce/backend/logs

# 修复PID文件权限
sudo chown ubuntu:ubuntu /tmp/uwsgi-llmxmapreduce-backend.pid
```

### 3. 性能监控

```bash
# 查看服务资源使用情况
sudo systemctl show llmxmapreduce-backend --property=CPUUsageNSec
sudo systemctl show llmxmapreduce-backend --property=MemoryCurrent

# 查看进程信息
ps aux | grep uwsgi

# 查看端口监听状态
sudo netstat -tlnp | grep -E ':(5000|8000|9191)'
```

## 卸载服务

如果需要卸载 systemd 服务：

```bash
cd /home/ubuntu/LLMxMapReduce/backend
sudo bash scripts/setup_systemd.sh uninstall
```

## 服务升级

当更新代码后，重启服务：

```bash
# 方法1：重启服务
sudo systemctl restart llmxmapreduce-backend

# 方法2：平滑重启（推荐）
sudo systemctl reload llmxmapreduce-backend

# 方法3：如果修改了服务配置文件
sudo systemctl daemon-reload
sudo systemctl restart llmxmapreduce-backend
```

## 访问地址

服务启动后可以通过以下地址访问：

- 🌐 应用主页：http://localhost:5000
- 📊 uWSGI 统计：http://127.0.0.1:9191
- 🔧 Socket 连接：127.0.0.1:8000

## 注意事项

1. **环境变量**：确保 `.env` 文件存在且配置正确
2. **依赖服务**：数据库服务需要先启动
3. **权限管理**：服务以 ubuntu 用户身份运行
4. **日志轮转**：建议配置日志轮转避免日志文件过大
5. **资源监控**：定期检查服务资源使用情况 