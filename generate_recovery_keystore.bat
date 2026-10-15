@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_recovery_keystore.ps1"
exit /b %ERRORLEVEL%
