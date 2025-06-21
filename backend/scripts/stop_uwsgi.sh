#!/bin/bash

# uWSGI 停止脚本
PIDFILE="/home/ubuntu/LLMxMapReduce/backend/uwsgi-llm-mapreduce.pid"
TIMEOUT=30

echo "正在停止 uWSGI 服务..."

# 方法1：使用 uwsgi --stop
if [ -f "$PIDFILE" ]; then
    echo "使用 PID 文件停止服务..."
    uwsgi --stop "$PIDFILE"
    
    # 等待进程停止
    sleep 5
    
    # 检查是否还有进程在运行
    if pgrep -f "uwsgi.*uwsgi.ini" > /dev/null; then
        echo "进程仍在运行，尝试优雅停止..."
        # 方法2：发送 SIGTERM 信号
        pkill -TERM -f "uwsgi.*uwsgi.ini"
        
        # 等待优雅停止
        count=0
        while [ $count -lt $TIMEOUT ] && pgrep -f "uwsgi.*uwsgi.ini" > /dev/null; do
            echo "等待进程停止... ($count/$TIMEOUT)"
            sleep 1
            count=$((count + 1))
        done
        
        # 方法3：如果还有进程，强制停止
        if pgrep -f "uwsgi.*uwsgi.ini" > /dev/null; then
            echo "强制停止剩余进程..."
            pkill -KILL -f "uwsgi.*uwsgi.ini"
            sleep 2
        fi
    fi
else
    echo "PID 文件不存在，直接停止所有 uwsgi 进程..."
    pkill -TERM -f "uwsgi.*uwsgi.ini"
    sleep 5
    
    if pgrep -f "uwsgi.*uwsgi.ini" > /dev/null; then
        echo "强制停止剩余进程..."
        pkill -KILL -f "uwsgi.*uwsgi.ini"
    fi
fi

# 清理 PID 文件
if [ -f "$PIDFILE" ]; then
    rm -f "$PIDFILE"
    echo "已删除 PID 文件"
fi

# 检查最终状态
if pgrep -f "uwsgi.*uwsgi.ini" > /dev/null; then
    echo "❌ 停止失败！仍有进程在运行："
    ps aux | grep uwsgi | grep -v grep
    exit 1
else
    echo "✅ uWSGI 服务已完全停止"
    exit 0
fi 