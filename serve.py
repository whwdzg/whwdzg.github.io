#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地开发服务器启动脚本 / Local development server launcher
一键启动HTTP服务器并自动打开浏览器 / Start HTTP server and open browser automatically
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# 配置 / Configuration
PORT = 8000
HOST = "localhost"
OPEN_BROWSER = True  # 是否自动打开浏览器 / Auto open browser

def find_free_port(start_port=8000, max_attempts=10):
    """查找可用端口 / Find available port"""
    import socket
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((HOST, port))
                return port
        except OSError:
            continue
    return None

def start_server():
    """启动HTTP服务器 / Start HTTP server"""
    # 切换到脚本所在目录 / Change to script directory
    os.chdir(Path(__file__).parent)
    
    # 查找可用端口 / Find available port
    port = find_free_port(PORT)
    if port is None:
        print(f"❌ 错误：无法找到可用端口（尝试范围 {PORT}-{PORT+9}）")
        print(f"❌ Error: Cannot find available port (tried {PORT}-{PORT+9})")
        sys.exit(1)
    
    if port != PORT:
        print(f"⚠️  端口 {PORT} 已被占用，使用端口 {port}")
        print(f"⚠️  Port {PORT} is in use, using port {port}")
    
    # 创建服务器 / Create server
    handler = http.server.SimpleHTTPRequestHandler
    
    # 自定义请求处理器以支持缓存控制 / Custom handler for cache control
    class NoCacheHTTPRequestHandler(handler):
        def end_headers(self):
            # 添加缓存控制头 / Add cache control headers
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            self.send_header('Expires', '0')
            super().end_headers()
        
        def log_message(self, format, *args):
            # 彩色日志输出 / Colored log output
            print(f"[{self.log_date_time_string()}] {format % args}")
    
    try:
        with socketserver.TCPServer((HOST, port), NoCacheHTTPRequestHandler) as httpd:
            url = f"http://{HOST}:{port}"
            
            print("\n" + "="*60)
            print("🚀 本地开发服务器已启动 / Local development server started")
            print("="*60)
            print(f"📍 地址 / URL: {url}")
            print(f"📂 目录 / Directory: {os.getcwd()}")
            print(f"⚙️  端口 / Port: {port}")
            print("="*60)
            print("💡 提示 / Tips:")
            print("   - 按 Ctrl+C 停止服务器 / Press Ctrl+C to stop")
            print(f"   - 浏览器访问 / Open in browser: {url}")
            print("   - 主页 / Home: index.html")
            print("   - 关于 / About: about.html")
            print("   - README: readme.html")
            print("="*60 + "\n")
            
            # 自动打开浏览器 / Auto open browser
            if OPEN_BROWSER:
                print("🌐 正在打开浏览器... / Opening browser...")
                try:
                    webbrowser.open(url)
                    print("✅ 浏览器已打开 / Browser opened\n")
                except Exception as e:
                    print(f"⚠️  无法自动打开浏览器: {e}")
                    print(f"⚠️  Cannot open browser automatically: {e}")
                    print(f"   请手动访问 / Please visit manually: {url}\n")
            
            print("🔄 服务器运行中... / Server running...\n")
            
            # 启动服务器 / Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n" + "="*60)
        print("🛑 服务器已停止 / Server stopped")
        print("="*60)
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ 错误 / Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # 检查Python版本 / Check Python version
    if sys.version_info < (3, 6):
        print("❌ 需要 Python 3.6 或更高版本 / Requires Python 3.6 or higher")
        sys.exit(1)
    
    print("🔧 正在启动服务器... / Starting server...")
    start_server()
