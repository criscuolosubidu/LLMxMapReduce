#!/bin/bash
# uWSGI 部署启动脚本

set -e

echo "=== LLMxMapReduce uWSGI 部署脚本 ==="

# 配置变量
APP_DIR="/home/ubuntu/LLMxMapReduce/backend"  # 根据实际路径修改
DOCKER_COMPOSE_DIR="/home/ubuntu/LLMxMapReduce"
CONDA_ENV_NAME="llm_mr_v2"
UWSGI_CONFIG="$APP_DIR/uwsgi.ini"
LOG_DIR="$APP_DIR/logs"
PID_FILE="/tmp/uwsgi-llm-mapreduce.pid"

# 获取真实的用户名（即使在 sudo 环境下）
REAL_USER=${SUDO_USER:-$USER}
if [ "$REAL_USER" = "root" ]; then
    REAL_USER="ubuntu"  # 默认用户
fi

# Conda 路径检测和初始化
echo "初始化 Conda 环境..."
CONDA_PATHS=(
    "/home/$REAL_USER/miniconda3/etc/profile.d/conda.sh"
    "/home/$REAL_USER/anaconda3/etc/profile.d/conda.sh"
    "/opt/miniconda3/etc/profile.d/conda.sh"
    "/opt/anaconda3/etc/profile.d/conda.sh"
    "/usr/local/miniconda3/etc/profile.d/conda.sh"
    "/usr/local/anaconda3/etc/profile.d/conda.sh"
)

CONDA_INIT_SCRIPT=""
for path in "${CONDA_PATHS[@]}"; do
    if [ -f "$path" ]; then
        CONDA_INIT_SCRIPT="$path"
        echo "找到 Conda 初始化脚本: $path"
        break
    fi
done

if [ -z "$CONDA_INIT_SCRIPT" ]; then
    echo "❌ 错误：未找到 Conda 安装。请先安装 Miniconda 或 Anaconda"
    echo "可以运行以下命令安装 Miniconda:"
    echo "wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh"
    echo "bash Miniconda3-latest-Linux-x86_64.sh"
    exit 1
fi

# 初始化 Conda
source "$CONDA_INIT_SCRIPT"

# 创建必要目录
echo "创建必要目录..."
mkdir -p "$LOG_DIR"
mkdir -p "$APP_DIR/static"

# 启动数据库服务，已经启动可以注释掉
# echo "启动数据库服务..."
# cd "$DOCKER_COMPOSE_DIR"
# docker-compose up -d
# echo "等待数据库服务启动..."
# sleep 15

# 检查数据库连接状态
echo "检查数据库连接状态..."
for i in {1..30}; do
    if docker-compose exec -T postgresql pg_isready -U huanyu >/dev/null 2>&1; then
        echo "PostgreSQL数据库连接成功"
        break
    else
        echo "等待PostgreSQL数据库启动... ($i/30)"
        sleep 2
    fi
done

# 检查MongoDB连接状态  
for i in {1..30}; do
    if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" >/dev/null 2>&1; then
        echo "MongoDB数据库连接成功"
        break
    else
        echo "等待MongoDB数据库启动... ($i/30)"
        sleep 2
    fi
done

# 检查 Conda 环境
cd "$APP_DIR"
echo "检查 Conda 环境..."
if ! conda env list | grep -q "$CONDA_ENV_NAME"; then
    echo "创建 Conda 环境: $CONDA_ENV_NAME"
    conda create -n "$CONDA_ENV_NAME" python=3.10 -y
    echo "激活环境并安装依赖..."
    conda activate $CONDA_ENV_NAME
    pip install --upgrade pip
    pip install -r requirements.txt
else
    echo "激活现有 Conda 环境: $CONDA_ENV_NAME"
    conda activate $CONDA_ENV_NAME
    
    # 检查是否需要更新依赖
    echo "检查并更新依赖..."
    pip install --upgrade pip
    pip install -r requirements.txt --upgrade
fi

# 验证环境
echo "验证 Python 环境..."
which python
python --version
pip --version

# 检查环境变量文件
if [ ! -f "$APP_DIR/.env" ]; then
    echo "错误：未找到 .env 文件，请先配置环境变量"
    echo "可以从 env.template 复制并修改配置"
    echo "示例: cp env.template .env && nano .env"
    exit 1
fi

# 停止现有的 uWSGI 进程和检查端口占用
echo "检查并停止现有的 uWSGI 进程..."
if [ -f "$PID_FILE" ]; then
    echo "停止现有的 uWSGI 进程..."
    uwsgi --stop "$PID_FILE" || true
    sleep 3
fi

# 检查端口5000是否被占用
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "端口5000被占用，正在终止占用进程..."
    lsof -Pi :5000 -sTCP:LISTEN -t | xargs kill -9 || true
    sleep 2
fi

# 检查端口8000是否被占用
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "端口8000被占用，正在终止占用进程..."
    lsof -Pi :8000 -sTCP:LISTEN -t | xargs kill -9 || true
    sleep 2
fi

# 清理可能残留的PID文件
rm -f "$PID_FILE"

# 启动 uWSGI
echo "启动 uWSGI 服务器..."
cd "$APP_DIR"
uwsgi --ini "$UWSGI_CONFIG"

# 检查启动状态
sleep 3
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ uWSGI 启动成功！PID: $PID"
        echo "📊 统计信息地址: http://127.0.0.1:9191"
        echo "🌐 应用访问地址: http://localhost:5000"
        echo "📋 查看日志: tail -f $LOG_DIR/uwsgi.log"
        echo "📋 查看错误日志: tail -f $LOG_DIR/uwsgi_error.log"
        echo ""
        echo "使用以下命令管理服务："
        echo "  停止: uwsgi --stop $PID_FILE"
        echo "  重启: uwsgi --reload $PID_FILE"
        echo "  查看状态: ps -p $PID"
    else
        echo "❌ uWSGI 启动失败，请检查日志"
        echo "错误日志:"
        tail -20 "$LOG_DIR/uwsgi.log" 2>/dev/null || echo "无法读取 uwsgi.log"
        tail -20 "$LOG_DIR/uwsgi_error.log" 2>/dev/null || echo "无法读取 uwsgi_error.log"
        exit 1
    fi
else
    echo "❌ 未找到 PID 文件，启动可能失败"
    echo "请检查 uWSGI 配置文件和日志"
    exit 1
fi 