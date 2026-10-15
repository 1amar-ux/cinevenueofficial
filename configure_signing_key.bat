@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0configure_signing_key.ps1"
exit /b %ERRORLEVEL%
