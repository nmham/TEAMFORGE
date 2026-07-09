@echo off
cd /d "%~dp0"
set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"
start "LoL Growth Map Rank Sync" cmd /k ""%NODE_EXE%" "%~dp0lol-growth-map-rank-server.js""
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8790/
