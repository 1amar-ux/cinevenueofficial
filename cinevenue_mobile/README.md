# CineVenue Mobile Application (Flutter)

Official cross-platform mobile application for CineVenue (Android & iOS) built with Google Flutter and Dart.

---

## 1. Project Overview

* **Framework**: Flutter 3.x (Dart 3.x)
* **Platforms**: Android (API 23+) & iOS (iOS 14.0+)
* **Architecture**: Feature-Driven Clean Architecture with Riverpod
* **Backend API**: Unified CineVenue REST API (`https://cinevenue.com/api/v1` / `http://10.0.2.2:3000/api/v1` for Android Emulator)
* **Payment Gateways**: Razorpay Flutter Native SDK (`razorpay_flutter`) & Cashfree PG Native SDK (`cashfree_pg`)
* **Push Notifications**: Firebase Cloud Messaging (FCM) & Apple Push Notification service (APNs)

---

## 2. Directory Structure

```text
cinevenue_mobile/
├── .env.example                     # Environment template without secrets
├── README.md                        # Project overview & quick start
├── pubspec.yaml                     # Dependencies specification
├── docs/
│   ├── API_INTEGRATION_GUIDE.md     # Full REST API contracts & models
│   ├── FLUTTER_ARCHITECTURE.md      # Clean architecture & Riverpod state guide
│   └── MOBILE_SETUP_GUIDE.md        # Android Studio & Xcode setup instructions
├── assets/
│   ├── icons/                       # App icons & SVGs
│   └── images/                      # Placeholder banners & logos
└── lib/
    ├── app/                         # App entry, router & luxury dark theme
    ├── core/                        # Network client, secure storage, errors, utils
    └── features/                    # Modular domain feature packages
        ├── auth/                    # Login, Register, Google Sign-In, Token Refresh
        ├── movies/                  # Showcase, Movie Details, Trailers, Search
        ├── shows/                   # City Picker, Theatres, Date & Showtime Selector
        ├── seats/                   # Interactive Seat Layout & Distributed Locking
        ├── checkout/                # Centralized Pricing & Gateway Launch
        ├── tickets/                 # Digital QR Pass & Offline Entry
        ├── bookings/                # My Bookings History
        ├── events/                  # Live Events, Concerts & Capacity Passes
        ├── cinecoins/               # CineCoins Vault (Launching Soon State)
        ├── profile/                 # Profile Editing & Notification Settings
        └── gate_scanner/            # Staff QR Scanner for Ticket Validation
```

---

## 3. Quick Start

1. **Prerequisites**:
   * Flutter SDK `>=3.19.0`
   * Android Studio (Android SDK 34, Build-Tools 34.0.0)
   * Xcode 15+ (for macOS / iOS development)
   * CocoaPods (for iOS native pods)

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies**:
   ```bash
   flutter pub get
   ```

4. **Run Application**:
   ```bash
   # Android Emulator / Connected Device
   flutter run -d android

   # iOS Simulator / Connected iPhone
   flutter run -d ios
   ```

---

## 4. Documentation Links

* [API Integration Guide](docs/API_INTEGRATION_GUIDE.md)
* [Flutter Clean Architecture Guide](docs/FLUTTER_ARCHITECTURE.md)
* [Mobile Setup & Build Instructions](docs/MOBILE_SETUP_GUIDE.md)

