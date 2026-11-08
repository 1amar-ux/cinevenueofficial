# CineVenue Flutter Mobile — Setup & Build Instructions

Step-by-step setup guide for building, running, and testing the CineVenue mobile application on Android and iOS.

---

## 1. Environment Requirements

* **Flutter SDK**: `>=3.19.0` (Channel stable)
* **Dart SDK**: `>=3.3.0`
* **Android Development**:
  * Android Studio Hedgehog or newer
  * Android SDK 34 (API Level 34)
  * Java Development Kit (JDK) 17
* **iOS Development**:
  * macOS Sonoma (for iOS development)
  * Xcode 15+
  * CocoaPods 1.14+

---

## 2. Android Configuration

### 2.1 Android SDK Versions (`android/app/build.gradle`)
* `minSdkVersion = 23` (Android 6.0 Marshmallow+)
* `targetSdkVersion = 34` (Android 14)
* `compileSdkVersion = 34`

### 2.2 Permissions (`android/app/src/main/AndroidManifest.xml`)
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Internet Access for API and Media -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Push Notifications (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Camera for Ticket Gate QR Scanner -->
    <uses-permission android:name="android.permission.CAMERA" />
</manifest>
```

### 2.3 UPI Payment Intent Queries (`AndroidManifest.xml`)
To allow Razorpay and Cashfree to detect installed UPI apps (GPay, PhonePe, Paytm, BHIM):
```xml
<queries>
    <package android:name="com.google.android.apps.nbu.paisa.user" />
    <package android:name="com.phonepe.app" />
    <package android:name="net.one97.paytm" />
    <package android:name="in.org.npci.upiapp" />
    <intent>
        <action android:name="android.intent.action.VIEW" />
        <data android:scheme="upi" />
    </intent>
</queries>
```

---

## 3. iOS Configuration

### 3.1 Minimum iOS Target
* Set `platform :ios, '14.0'` in `ios/Podfile`.

### 3.2 Privacy Keys (`ios/Runner/Info.plist`)
```xml
<dict>
    <!-- Camera for Staff QR Scanner -->
    <key>NSCameraUsageDescription</key>
    <string>CineVenue requires camera access to scan and validate admission tickets at theatre gates.</string>

    <!-- Location for Nearby Theatres (Optional) -->
    <key>NSLocationWhenInUseUsageDescription</key>
    <string>CineVenue uses your location to discover multiplexes and showtimes nearest to you.</string>
</dict>
```

### 3.3 Google Sign-In URL Scheme (`Info.plist`)
Add the reversed Google Client ID as a URL scheme to handle the native redirect callback.

---

## 4. Running the Application

```bash
# 1. Install Flutter dependencies
flutter pub get

# 2. Check environment health
flutter doctor -v

# 3. Launch debug on connected device or emulator
flutter run

# 4. Build release APK / App Bundle
flutter build appbundle --release

# 5. Build iOS IPA (on macOS)
flutter build ipa --release
```

