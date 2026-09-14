@echo off
echo ==============================================
echo  CineVenue Android APK Builder (Local)
echo ==============================================

echo [1/3] Building Web Production Bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Web build failed.
    exit /b %ERRORLEVEL%
)

echo [2/3] Syncing Capacitor Android Project...
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo Error: Capacitor sync failed.
    exit /b %ERRORLEVEL%
)

echo [3/3] Assembling Android Debug APK via Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo Note: To assemble APK locally, Android SDK and Studio/cmdline-tools are required.
    echo If you do not have Android SDK installed locally, push this repository to GitHub
    echo and GitHub Actions will automatically compile your APK for download!
    cd ..
    exit /b %ERRORLEVEL%
)

cd ..
echo ==============================================
echo SUCCESS! APK Generated at:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo ==============================================
