#!/usr/bin/env python3
"""
WSGI 入口文件 - 用于生产环境部署
支持 uWSGI、Gunicorn 等 WSGI 服务器
"""
import os
import sys
from dotenv import load_dotenv
from app import Application

# 添加项目路径到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, 'src'))

load_dotenv()

application_instance = Application()
app = application_instance.app

if __name__ == "__main__":
    # 仅用于测试
    app.run(host='0.0.0.0', port=5000, debug=False)