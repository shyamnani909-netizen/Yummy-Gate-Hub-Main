@echo off
set "PROJECT_DIR=%~dp0"
set "NODE_DIR=%PROJECT_DIR%..\.codex-node\node-v24.16.0-win-x64"
set "PATH=%NODE_DIR%;%PATH%"
cd /d "%PROJECT_DIR%"
call "%NODE_DIR%\npm.cmd" run dev
