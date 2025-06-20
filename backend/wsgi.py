#!/usr/bin/env python3
"""
WSGI 入口文件 - 用于生产环境部署
支持 uWSGI、Gunicorn 等 WSGI 服务器
"""
import os
import sys
from dotenv import load_dotenv

# 添加项目路径到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, 'src'))

# 加载环境变量
load_dotenv()

# 导入应用
from app import Application

# 创建应用实例
application = Application()
app = application.app

# 为了兼容性，也导出为 app
if __name__ == "__main__":
    # 如果直接运行这个文件，使用开发服务器
    application.run() 