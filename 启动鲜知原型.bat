@echo off
cd /d "%~dp0"
set PY=C:\Users\Lenovo\.workbuddy\binaries\python\versions\3.14.3\python.exe
if not exist "%PY%" set PY=python
start "FreshSense" "%PY%" -m http.server 8090
timeout /t 2 >nul
start "" http://localhost:8090/index.html
