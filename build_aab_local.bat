@echo off
echo ==============================================
echo  CineVenue Android App Bundle (.aab) Builder
echo ==============================================

echo [1/3] Building Web Production Bundle...
call npm.cmd run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Web build failed.
    exit /b %ERRORLEVEL%
)

echo [2/3] Syncing Capacitor Android Project...
call npx.cmd cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo Error: Capacitor sync failed.
    exit /b %ERRORLEVEL%
)

echo [3/3] Checking Release Signing Configuration...
cd android
if not exist "keystore.properties" (
    if "%KEYSTORE_FILE%"=="" (
        echo.
        echo ========================================================================
        echo ERROR: 'android\keystore.properties' not found and KEYSTORE_FILE is not set.
        echo Google Play Console requires a signed Android App Bundle (.aab).
        echo Please copy 'android\keystore.properties.example' to 'android\keystore.properties'
        echo and configure your release keystore before running bundleRelease.
        echo ========================================================================
        cd ..
        exit /b 1
    )
)

echo Running Gradle bundleRelease...
call gradlew.bat bundleRelease
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error: Gradle bundleRelease failed.
    echo Ensure Android SDK / Java JDK are installed and keystore credentials are valid.
    cd ..
    exit /b %ERRORLEVEL%
)

cd ..
echo ==============================================
echo SUCCESS! Signed App Bundle Generated at:
echo android\app\build\outputs\bundle\release\app-release.aab
echo ==============================================
