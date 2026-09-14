# CineVenue Android App & APK Guide

This project is now fully configured with **Capacitor** to run as a native Android application.

---

## 📱 How to Get Your APK

### Option 1: Automatic Cloud Build via GitHub Actions (Easiest — No Setup Required)
We have included a pre-configured GitHub Actions workflow in [`.github/workflows/build-apk.yml`](.github/workflows/build-apk.yml).
1. Commit and push this repository to GitHub:
   ```bash
   git add .
   git commit -m "Add Capacitor Android project and APK builder"
   git push origin main
   ```
2. In your GitHub repository, click on the **Actions** tab.
3. Select the **Build Android APK** workflow.
4. Once completed (takes ~2 minutes), download the **`cinevenue-debug-apk`** artifact containing `app-debug.apk` directly to your phone or computer.

---

### Option 2: Build with Android Studio
If you have Android Studio installed on your computer:
1. Open terminal in `d:\cinevenuefinal` and run:
   ```bash
   npm run cap:android
   ```
   *(or open Android Studio and choose `Open Project` -> select the `android` folder)*
2. In Android Studio, go to the top menu:
   **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. When it finishes, click the notification popup link **locate** to find `app-debug.apk`.

---

### Option 3: Command Line (Windows)
If you have Android SDK configured in your `ANDROID_HOME` or Android Studio:
```bash
build_apk_local.bat
```
The APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### Option 4: Instant Mobile Install (PWA)
1. Open the app URL on your phone's browser (Chrome / Brave / Edge).
2. Tap the browser menu (three dots) and tap **"Install App"** or **"Add to Home Screen"**.
3. CineVenue will install directly onto your phone's home screen with the official CineVenue icon, splash screen, and full-screen standalone mobile experience.
