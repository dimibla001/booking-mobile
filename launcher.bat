@echo off
title Booking App Launcher
echo ==========================================
echo    BOOKING APP - SYSTEM CHECK & START
echo ==========================================

echo [1/3] Checking for library updates...
call npm install --legacy-peer-deps

echo.
echo [2/3] Configuring ADB connection...
set ADB_PATH="C:\Users\jewhater1488\AppData\Local\Android\Sdk\platform-tools\adb.exe"
if exist %ADB_PATH% (
    %ADB_PATH% reverse tcp:8081 tcp:8081
    echo ADB: Port 8081 reversed successfully.
) else (
    echo [WARNING] ADB not found at default path. Please check Android SDK.
)

echo.
echo [3/3] Starting Metro Bundler in a new window...
start "Metro Bundler" cmd /k "npx react-native start --reset-cache"

echo.
echo ==========================================
echo    ALL SYSTEMS GO!
echo    You can now run "npx react-native run-android"
echo    or press "R" in the emulator to reload.
echo ==========================================
pause
