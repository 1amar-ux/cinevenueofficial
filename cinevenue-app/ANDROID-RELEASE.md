# 🚀 CineVenue Android Production Release Guide

> **Official Release Documentation for Google Play Store Distribution**  
> Application: **CineVenue**  
> Package Identifier: **`com.cinevenue.app`**  
> Initial Version: **`1.0.0`** | Version Code: **`1`**

---

## 1. Release Architecture Summary

| Property | Production Setting |
| :--- | :--- |
| **Android Application ID** | `com.cinevenue.app` |
| **App Name** | `CineVenue` |
| **Version Name** | `1.0.0` |
| **Version Code** | `1` *(Must increment by +1 on every subsequent update)* |
| **Artifact Format** | **Android App Bundle (`.aab`)** |
| **Target SDK** | Android 14+ (API 34/35 compatible with current Play Store requirements) |
| **Minimum SDK** | Android 7.0 (API 24 - 99.5%+ device coverage) |

---

## 2. Production Environment Configuration

In [`cinevenue-app/.env`](file:///d:/cinevenuefinal/cinevenue-app/.env), verify your production variables:

```env
# Production CineVenue Backend
EXPO_PUBLIC_API_URL=https://api.cinevenue.in/api

# Deep Linking URI Scheme
EXPO_PUBLIC_APP_SCHEME=cinevenue

# Google Cloud OAuth Client ID for Android
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=YOUR_PRODUCTION_CLIENT_ID.apps.googleusercontent.com

# Public Payment Gateway ID (Public key only; secrets remain securely on backend)
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY_ID

# Official Legal Policy Endpoints
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://cinevenue.in/privacy-policy
EXPO_PUBLIC_TERMS_URL=https://cinevenue.in/terms-and-conditions
EXPO_PUBLIC_REFUND_URL=https://cinevenue.in/cancellation-refund-policy
```

> ⚠️ **Zero Secret Exposure**: Never place backend secrets (`JWT_SECRET`, database passwords, private API keys) into client code or `.env`. All authentication and payments are verified authoritatively on your server.

---

## 3. Keystore Generation & Release Signing

Google Play Store requires signed Android App Bundles. You can sign via **EAS Cloud Keystore** (Recommended) or generate a local upload keystore.

### Option A: Automatic Signing with Expo EAS (Recommended)
When you run `eas build -p android --profile production`, EAS automatically generates, encrypts, and manages your production upload keystore securely in the cloud.

### Option B: Generating a Local Keystore
To generate your own local upload keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore cinevenue-upload-key.keystore -alias cinevenue-alias -keyalg RSA -keysize 2048 -validity 10000
```
*Keep this keystore file and passwords stored safely in an offline password vault.*

---

## 4. Google Sign-In & SHA-1 Configuration

To enable Google Sign-In for `com.cinevenue.app`:

1. Open [Google Cloud Console](https://console.cloud.google.com/) -> **APIs & Services** -> **Credentials**.
2. Create an **OAuth 2.0 Client ID**:
   - **Application Type**: Android
   - **Package Name**: `com.cinevenue.app`
   - **SHA-1 Certificate Fingerprint**:
     - For EAS builds: Retrieve from `eas credentials:show` -> Android -> Keystore SHA-1.
     - For Google Play App Signing: Copy the **App Signing key SHA-1** from Google Play Console (*Release > Setup > App Signing*).
3. Paste the generated client ID into `.env` as `EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID`.

---

## 5. Building the Production Android App Bundle (.aab)

### Step 1: Login to EAS
```bash
cd cinevenue-app
npx eas login
```

### Step 2: Configure Project ID (One-time)
```bash
npx eas build:configure
```

### Step 3: Run Production AAB Build
```bash
npx eas build -p android --profile production
```

This compiles your optimized, minified Android App Bundle ready for Google Play Store. When complete, EAS will provide a direct download link for `CineVenue-release.aab`.

### Building a Local Test APK (For Physical Device Testing)
```bash
npx eas build -p android --profile preview
```

---

## 6. Google Play Console Upload & Release Flow

```text
Build Production AAB
       ↓
Upload to Google Play Console (Internal Testing Track)
       ↓
Test on internal devices & verify booking flow
       ↓
Promote to Closed Testing (Optional)
       ↓
Promote to Production Release Track
```

### Step-by-Step Instructions:

1. **Log in to Play Console**: Go to [Google Play Console](https://play.google.com/console).
2. **Select / Create App**:
   - App Name: `CineVenue`
   - Default Language: `English (India)`
   - App Type: `App`
   - Free / Paid: `Free`
3. **Upload AAB to Internal Testing Track**:
   - Navigate to **Testing** -> **Internal testing**.
   - Click **Create new release**.
   - Upload the downloaded `.aab` file.
   - Release name: `1.0.0 (1)`.
   - Release notes: *"Initial production release of CineVenue for cinema booking and VIP rewards."*
   - Click **Save** -> **Review release** -> **Start rollout to internal testing**.
4. **Complete Store Presence & Data Safety**:
   - Use the pre-filled fields from [`ANDROID-PLAY-STORE-CHECKLIST.md`](file:///d:/cinevenuefinal/cinevenue-app/ANDROID-PLAY-STORE-CHECKLIST.md).
   - Provide Privacy Policy URL: `https://cinevenue.in/privacy-policy`.
   - Complete Data Safety declarations.
5. **Publish to Production**:
   - When ready, click **Promote release** -> **Production** to submit for Google review.

---

## 7. Manual Action Items Checklist Before Rollout

- [ ] Ensure backend API server (`https://api.cinevenue.in/api`) is running and reachable over HTTPS.
- [ ] Add your production Razorpay live key ID to `.env`.
- [ ] Add SHA-1 fingerprint to Google Cloud Console for Google Sign-In.
- [ ] Upload 512x512 app icon and 1024x500 feature banner to Play Console store listing.
- [ ] Run `npx eas build -p android --profile production` to produce the final `.aab`.
