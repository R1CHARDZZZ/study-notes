@echo off
setlocal
title Study Notes

cd /d "%~dp0"
if errorlevel 1 (
    echo Could not open the Study Notes folder.
    pause
    exit /b 1
)

where.exe npm.cmd >nul 2>&1
if errorlevel 1 (
    echo npm was not found. Install Node.js 22 or later and reopen this script.
    pause
    exit /b 1
)

if not exist "node_modules\.bin\vitepress.cmd" (
    echo VitePress is not installed. Run npm.cmd ci in this folder once.
    pause
    exit /b 1
)

echo Starting Study Notes. Press Q in this window to stop the server.
call npm.cmd run docs:dev -- --open
set "launch_status=%errorlevel%"
if not "%launch_status%"=="0" pause
exit /b %launch_status%
