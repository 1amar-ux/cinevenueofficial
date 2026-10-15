# Google Play Release & Signing Guide for CineVenue

This document explains how to generate a release signing key, configure the build securely, and generate a signed Android App Bundle (`.aab`) for Google Play Console closed testing.

---

## 1. Application Details
- **Application ID:** `com.cinevenue.app`
- **Initial Version Code:** `1`
- **Initial Version Name:** `1.0`
- **Output Format:** Android App Bundle (`.aab`) required by Google Play Console

---

## 2. Generate Your Release Upload Keystore

Run the following command using Java's `keytool` (available with any JDK or Android Studio):

```bash
keytool -genkey -v -keystore android/cinevenue-upload-key.jks -alias cinevenue-upload-key -keyalg RSA -keysize 2048 -validity 10000
```

During generation:
1. You will be prompted to enter a **Keystore password** (choose a strong password).
2. You will be asked for your name, organization, city, state, country code.
3. Confirm with `yes`.

> ⚠️ **CRITICAL BACKUP RULE**: 
> Store `cinevenue-upload-key.jks` and your passwords in a secure password manager (e.g., 1Password, Bitwarden, KeePass) or encrypted offline backup.
> If this key is lost, Google Play will **not** accept future app updates without an identity reset request through Google Play Support.
> **NEVER commit `.jks` or `keystore.properties` to version control.** They are automatically ignored in `.gitignore`.

---

## 3. Configure Signing Properties

1. Copy the example properties file:
   ```bash
   cp android/keystore.properties.example android/keystore.properties
   ```
   *(or copy manually in File Explorer)*

2. Open `android/keystore.properties` and enter your credentials:
   ```properties
   storeFile=cinevenue-upload-key.jks
   storePassword=YOUR_KEYSTORE_PASSWORD
   keyAlias=cinevenue-upload-key
   keyPassword=YOUR_KEY_PASSWORD
   ```

*(Alternatively, you can supply these via environment variables: `KEYSTORE_FILE`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD`)*

---

## 4. Build the Signed Android App Bundle (.aab)

### Option A: Using the Windows Batch Script (Recommended for Windows)
Double-click or run from command prompt:
```bash
build_aab_local.bat
```

### Option B: Using npm & Gradle
```bash
npm run build
npx cap sync android
cd android
./gradlew bundleRelease
```

---

## 5. Locate the Output Bundle

Upon successful build, your signed release bundle will be generated at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 6. Upload to Google Play Console Closed Testing

1. Go to [Google Play Console](https://play.google.com/console).
2. Select your CineVenue application (or create a new app with package name `com.cinevenue.app`).
3. In the left navigation, go to **Testing** → **Closed testing**.
4. Click **Create track** or select an existing closed testing track (e.g., Alpha / Closed Beta).
5. Click **Create new release**.
6. Upload the signed `app-release.aab`.
7. Add release notes and save.
8. Add your closed testing tester email list.
9. Review and start the rollout to closed testing!
