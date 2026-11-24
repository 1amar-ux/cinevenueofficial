# CINEVENUE — STAGING FLUTTER MOBILE AUDIT & SETUP REPORT

**Application Directory:** [`cinevenue_mobile/`](../../cinevenue_mobile/)  
**Framework:** Flutter (Dart SDK `>=3.3.0 <4.0.0`, Flutter `>=3.19.0`)  
**State Architecture:** Flutter Riverpod 2.5.1  
**Status Breakdown:**
* **Source Code & Dependency Inspection:** **VERIFIED**
* **Native Android APK Build:** **BLOCKED — FLUTTER SDK NOT INSTALLED**
* **Native Device / Emulator Testing:** **NOT TESTED**  

---

## 1. MOBILE APPLICATION STRUCTURE & ARCHITECTURE

The CineVenue mobile app is located in [`cinevenue_mobile/`](../../cinevenue_mobile/) and designed for cross-platform deployment on Android and iOS:

```
cinevenue_mobile/
├── android/               # Native Android Gradle configuration
├── ios/                   # Native iOS CocoaPods / Runner configuration
├── lib/
│   ├── core/             # HTTP client (Dio), theme, routing, constants
│   ├── features/         # Domain feature modules (Auth, Movies, Booking, Tickets, CineCoins)
│   ├── models/           # Data models with JSON serialization
│   └── main.dart         # Application bootstrap entrypoint
├── docs/                 # Mobile setup and architecture guides
├── .env.example          # Mobile environment configuration template
└── pubspec.yaml          # Project dependencies and SDK constraints
```

---

## 2. DEPENDENCY & SDK SPECIFICATIONS (`pubspec.yaml`)

* **Dart SDK Constraint:** `>=3.3.0 <4.0.0`
* **Flutter Version Requirement:** `>=3.19.0`
* **Key Dependencies:**
  * **State Management:** `flutter_riverpod: ^2.5.1`
  * **Routing:** `go_router: ^14.0.0`
  * **Network Client:** `dio: ^5.4.3+1` (supports baseUrl configuration, auth interceptors, and retry policies)
  * **Secure Storage:** `flutter_secure_storage: ^9.0.0` (stores JWT access and refresh tokens securely in Android Keystore / iOS Keychain)
  * **Payment Gateways:**
    * `razorpay_flutter: ^1.3.7` (Native Android/iOS Razorpay Checkout)
    * `cashfree_pg: ^2.0.12` (Native Cashfree PG SDK)
  * **Authentication:** `google_sign_in: ^6.2.1`
  * **Push Notifications:** `firebase_core: ^2.30.0`, `firebase_messaging: ^14.8.0`, `flutter_local_notifications: ^17.1.1`
  * **QR Code Rendering & Gate Scanning:** `qr_flutter: ^4.1.0`, `mobile_scanner: ^5.0.0`

---

## 3. STAGING CONFIGURATION TEMPLATE (`.env.staging`)

To configure the mobile app for the staging environment:

```env
# Point to the Vercel Staging Preview Backend:
API_BASE_URL=https://staging-api.cinevenue.com/api/v1

# Razorpay Test Key:
RAZORPAY_KEY_ID=rzp_test_YourStagingKeyIdHere

# Cashfree Test Environment:
CASHFREE_ENV=TEST

# Google Sign-In Staging Client IDs:
GOOGLE_SERVER_CLIENT_ID=your-staging-server-client-id.apps.googleusercontent.com
GOOGLE_IOS_CLIENT_ID=your-staging-ios-client-id.apps.googleusercontent.com

# Staging Environment Tag:
APP_NAME=CineVenue Staging
APP_ENV=staging
API_CONNECT_TIMEOUT_MS=15000
API_RECEIVE_TIMEOUT_MS=15000
```

---

## 4. LOCAL ENVIRONMENT AUDIT & SDK STATUS

A command execution probe verified the local system PATH:
* `flutter --version`: **Command not found**
* `dart --version`: **Command not found**

### Audit Finding:
The Flutter SDK is not currently installed or added to PATH on this Windows development workstation. In accordance with strict audit rules, **no native APK or iOS build is claimed**. The mobile architecture and source code have been inspected and confirmed valid, but native compilation remains blocked pending SDK installation.

---

## 5. INSTALLATION & STAGING BUILD PROCEDURE

To build the staging Android APK once Flutter is installed:

### Step 1: Install Flutter SDK
1. Download Flutter SDK (3.19+) from [https://flutter.dev](https://flutter.dev).
2. Extract to `C:\src\flutter` and append `C:\src\flutter\bin` to user PATH.
3. Verify toolchains via PowerShell:
   ```powershell
   flutter doctor
   ```

### Step 2: Resolve Dependencies & Run Tests
```powershell
cd cinevenue_mobile
flutter pub get
flutter analyze
flutter test
```

### Step 3: Build Android Staging APK
```powershell
flutter build apk --debug
# Or for optimized release staging:
flutter build apk --release
```
The compiled staging APK will be generated at:
`cinevenue_mobile/build/app/outputs/flutter-apk/app-release.apk`

