@echo off
REM start-dev.bat — safely install deps and start the dev server on a free port (Windows, CMD)
setlocal EnableDelayedExpansion
cd /d "%~dp0"
echo Running start-dev.bat from: %CD%

echo Checking for npm.cmd in PATH...
where npm.cmd >nul 2>&1
if errorlevel 1 (
  echo npm.cmd not found. Please install Node.js or run from project where Node is available.
  pause
  exit /b 1
)

echo Installing dependencies (skip if already installed)...
npm.cmd install --no-audit --no-fund || (
  echo npm install failed. Check output above.
  pause
  exit /b 1
)

:: Find a free port between 8082 and 8090
set "PORT="
for %%P in (8082 8083 8084 8085 8086 8087 8088 8089 8090) do (
  set "FOUND=0"
  for /f "tokens=1-5" %%A in ('netstat -ano ^| findstr /R /C:":%%P "  ^| findstr LISTENING') do (
    set "FOUND=1"
  )
  if "!FOUND!"=="0" (
    set "PORT=%%P"
    goto :foundPort
  )
)

necho No free port found in range 8082-8090. Please free a port or edit this script.
pause
exit /b 1

:foundPort
echo Starting dev server on port %PORT%...
npm.cmd run dev -- --port %PORT%
endlocal
