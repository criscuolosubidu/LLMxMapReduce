#!/bin/bash
# LLMxMapReduce systemd 服务设置脚本

set -e

echo "=== LLMxMapReduce systemd 服务设置 ==="

# 配置变量
SERVICE_NAME="llmxmapreduce-backend"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
SOURCE_SERVICE_FILE="/home/ubuntu/LLMxMapReduce/backend/llm-mapreduce.service"
APP_DIR="/home/ubuntu/LLMxMapReduce/backend"

# 检查是否以 root 权限运行
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 sudo 运行此脚本"
    echo "使用方法: sudo bash setup_systemd.sh [install|uninstall|status|start|stop|restart|logs]"
    exit 1
fi

# 获取操作参数
ACTION=${1:-install}

case $ACTION in
    "install")
        echo "📦 安装 systemd 服务..."
        
        # 检查服务文件是否存在
        if [ ! -f "$SOURCE_SERVICE_FILE" ]; then
            echo "❌ 服务文件不存在: $SOURCE_SERVICE_FILE"
            exit 1
        fi
        
        # 停止现有服务（如果存在）
        if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
            echo "🛑 停止现有服务..."
            systemctl stop "$SERVICE_NAME"
        fi
        
        # 复制服务文件
        echo "📄 复制服务文件到系统目录..."
        cp "$SOURCE_SERVICE_FILE" "$SERVICE_FILE"
        
        # 设置权限
        chmod 644 "$SERVICE_FILE"
        
        # 创建日志目录
        mkdir -p "$APP_DIR/logs"
        chown ubuntu:ubuntu "$APP_DIR/logs"
        
        # 重载 systemd
        echo "🔄 重载 systemd 配置..."
        systemctl daemon-reload
        
        # 启用服务
        echo "✅ 启用服务..."
        systemctl enable "$SERVICE_NAME"
        
        echo "✅ systemd 服务安装完成！"
        echo ""
        echo "使用以下命令管理服务："
        echo "  启动服务: sudo systemctl start $SERVICE_NAME"
        echo "  停止服务: sudo systemctl stop $SERVICE_NAME"
        echo "  重启服务: sudo systemctl restart $SERVICE_NAME"
        echo "  查看状态: sudo systemctl status $SERVICE_NAME"
        echo "  查看日志: sudo journalctl -u $SERVICE_NAME -f"
        echo "  启用开机启动: sudo systemctl enable $SERVICE_NAME"
        echo "  禁用开机启动: sudo systemctl disable $SERVICE_NAME"
        ;;
        
    "uninstall")
        echo "🗑️ 卸载 systemd 服务..."
        
        # 停止并禁用服务
        if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
            systemctl stop "$SERVICE_NAME"
        fi
        
        if systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
            systemctl disable "$SERVICE_NAME"
        fi
        
        # 删除服务文件
        if [ -f "$SERVICE_FILE" ]; then
            rm "$SERVICE_FILE"
        fi
        
        # 重载 systemd
        systemctl daemon-reload
        systemctl reset-failed
        
        echo "✅ systemd 服务卸载完成！"
        ;;
        
    "status")
        echo "📊 服务状态："
        systemctl status "$SERVICE_NAME" --no-pager -l
        ;;
        
    "start")
        echo "🚀 启动服务..."
        systemctl start "$SERVICE_NAME"
        echo "✅ 服务已启动"
        ;;
        
    "stop")
        echo "🛑 停止服务..."
        systemctl stop "$SERVICE_NAME"
        echo "✅ 服务已停止"
        ;;
        
    "restart")
        echo "🔄 重启服务..."
        systemctl restart "$SERVICE_NAME"
        echo "✅ 服务已重启"
        ;;
        
    "logs")
        echo "📋 查看服务日志（按 Ctrl+C 退出）..."
        journalctl -u "$SERVICE_NAME" -f
        ;;
        
    *)
        echo "❌ 未知操作: $ACTION"
        echo "使用方法: sudo bash setup_systemd.sh [install|uninstall|status|start|stop|restart|logs]"
        exit 1
        ;;
esac 