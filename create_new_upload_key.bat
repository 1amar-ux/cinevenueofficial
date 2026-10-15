@echo off
setlocal
echo ======================================================================
echo  CineVenue - Generate New Upload Keystore & Export Certificate
echo ======================================================================
echo.
echo IMPORTANT:
echo 1. Keep your password manager open to securely store the password you choose.
echo 2. Keytool will now prompt you to enter and confirm your new keystore password.
echo.

set KEYTOOL="C:\Program Files\Java\jdk-24\bin\keytool.exe"
if not exist %KEYTOOL% (
    set KEYTOOL="C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
)

echo [Step 1/3] Generating new keystore: android\cinevenue-upload-key-new.jks...
echo.
%KEYTOOL% -genkeypair -v -storetype PKCS12 -keystore "android\cinevenue-upload-key-new.jks" -alias cinevenue-upload-key-new -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=CineVenue, OU=Mobile, O=CineVenue, L=Hyderabad, ST=Telangana, C=IN"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Keystore generation was cancelled or failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 2/3] Exporting public upload certificate (.pem)...
echo (Please enter the keystore password you just created to export the certificate)
%KEYTOOL% -exportcert -rfc -keystore "android\cinevenue-upload-key-new.jks" -alias cinevenue-upload-key-new -file "android\cinevenue-upload-cert.pem"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Certificate export failed.
    exit /b %ERRORLEVEL%
)

echo.
echo [Step 3/3] Verifying public certificate details...
%KEYTOOL% -printcert -file "android\cinevenue-upload-cert.pem"

echo.
echo ======================================================================
echo SUCCESS!
echo - New Keystore: android\cinevenue-upload-key-new.jks
echo - Public Cert:  android\cinevenue-upload-cert.pem
echo - Key Alias:    cinevenue-upload-key-new
echo ======================================================================
