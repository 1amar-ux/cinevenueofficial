# 🎬 CineVenue Mobile Application (Android + iOS)

> **Official native mobile application for CineVenue Entertainments.**  
> Built with React Native, Expo SDK, TypeScript, React Navigation, and direct real-time integration with CineVenue's authoritative Backend API & POS engines.

---

## 🌟 Features

- **Luxury Gold & Dark UI**: Bespoke cinema-grade aesthetic with typography, micro-animations, glassmorphism, and responsive layouts.
- **Authoritative Booking Flow**: Real-time theatre and showtime queries, interactive seat selection, server-side seat holds/locks (preventing double-booking), and POS integration.
- **CineCoins VIP Loyalty Vault**: Cashless reward balances, instant checkout deductions (1 Coin = ₹1.00), daily streak check-in bonus, and lucky spin wheel.
- **Digital QR Ticket Passes**: Secure offline-ready digital tickets with live POS booking references and native QR code generation.
- **Film Production Marketplace**: Verified creator profiles, director casting calls, and audition submission pipelines.
- **Events & Concerts**: Full ticketing and pass booking for VIP events and movie premier galas.
- **Secure Authentication**: JWT token storage with hardware-backed encryption via `expo-secure-store`.
- **Cross-Platform Deep Linking**: Handles `cinevenue://movie/:id`, `cinevenue://event/:id`, and `cinevenue://ticket/:id`.

---

## 📁 App Architecture

```text
cinevenue-app/
├── app.json                     # Expo & Native metadata (bundle IDs, schemes, permissions)
├── babel.config.js              # Babel compiler configuration
├── package.json                 # Mobile dependencies
├── tsconfig.json                # TypeScript compiler config
├── .env.example                 # Environment variable templates
├── index.js                     # Root entry registration
├── App.tsx                      # Root application provider hierarchy
└── src/
    ├── api/                     # Axios API clients & endpoints
    │   ├── client.ts            # SecureStore JWT interceptor client
    │   ├── authApi.ts           # Login, registration, token refresh
    │   ├── movieApi.ts          # Movies, theatres, showtimes, seat maps
    │   ├── bookingApi.ts        # Seat locks, order creation, verification, tickets
    │   └── services.ts          # Events, CineCoins, Production Marketplace
    ├── components/              # Modular UI components
    │   ├── common/              # Buttons, Inputs, Badges, Headers, Empty States
    │   ├── home/                # Hero Carousel, Poster Cards, Quick Coin Widget
    │   ├── movies/              # Showtime Chips, Interactive Seat Map
    │   └── tickets/             # Digital QR Ticket Pass
    ├── constants/               # Global Design System & Configuration
    │   ├── theme.ts             # Colors, Typography, Spacing, Radii, Shadows
    │   └── config.ts            # API base URLs, deep links, city lists
    ├── navigation/              # React Navigation routers
    │   ├── RootNavigator.tsx    # Native Stack Navigator + Deep Links
    │   └── MainTabNavigator.tsx # Bottom Tabs (Home, Movies, Events, Coins, Account)
    ├── screens/                 # Full application views
    │   ├── account/             # Profile, My Bookings, Ticket View, Help, Notifications
    │   ├── auth/                # Login, Register, Password Reset
    │   ├── cinecoins/           # Vault, Daily Spin, Transaction History
    │   ├── events/              # Event listings, Event Details
    │   ├── home/                # Home dashboard, Search, City selector
    │   ├── marketplace/         # Film projects, Casting calls, Talent directory
    │   └── movies/              # Movies, Showtime select, Seat map, Payment
    ├── store/                   # Context state providers
    │   ├── AuthContext.tsx      # Current user & authentication state
    │   ├── BookingContext.tsx   # Active booking funnel state & seat holds
    │   └── LocationContext.tsx  # GPS location & active city selection
    └── types/                   # Strict TypeScript contracts & interfaces
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli eas-cli`
- For Android: Android Studio & Android SDK
- For iOS: macOS with Xcode (or Expo Go / EAS Cloud Build)

### 2. Installation
Navigate into the mobile app directory:
```bash
cd cinevenue-app
npm install
```

### 3. Environment Configuration
Copy the example environment file and customize:
```bash
cp .env.example .env
```

| Key | Description | Default |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | CineVenue Backend API URL | `http://10.0.2.2:5000/api` (Android Emulator) or `http://localhost:5000/api` |
| `EXPO_PUBLIC_APP_SCHEME` | Deep Linking Scheme | `cinevenue` |

> 💡 **Tip for Android Emulator**: Use `http://10.0.2.2:5000/api` to connect to a backend running on `localhost:5000` on your development machine.  
> 💡 **Tip for Physical Device / Expo Go**: Use your computer's local Wi-Fi IP address (e.g., `http://192.168.1.100:5000/api`).

---

## 📱 Running the App

### Start Development Server
```bash
npx expo start
```

- Press **`a`** to open on connected **Android Emulator / Device**.
- Press **`i`** to open on **iOS Simulator**.
- Scan the QR code using the **Expo Go** mobile app on your physical Android or iPhone.

---

## 📦 Building Production Binaries (EAS Build)

### 1. Configure EAS
```bash
eas login
eas build:configure
```

### 2. Build Android APK / App Bundle (AAB)
```bash
# Standalone Android APK for direct installation
eas build -p android --profile preview

# Production Google Play Store AAB
eas build -p android --profile production
```

### 3. Build iOS IPA (App Store / TestFlight)
```bash
# Production Apple App Store / TestFlight build
eas build -p ios --profile production
```

---

## 🔗 Deep Linking

The app supports custom URI schemes and universal links:

- `cinevenue://movie/:movieId` ➡️ Opens movie details & showtimes.
- `cinevenue://event/:eventId` ➡️ Opens event pass booking.
- `cinevenue://ticket/:bookingId` ➡️ Displays digital ticket pass QR code.
- `cinevenue://spin` ➡️ Launches daily CineCoin wheel.

---

## 🛡️ Security & Zero Exposure

- User authentication tokens and biometric credentials are saved using `expo-secure-store`.
- No sensitive payment keys or admin secrets are bundled into client-side code.
- All payments and seat hold releases are validated authoritatively by the CineVenue backend.
