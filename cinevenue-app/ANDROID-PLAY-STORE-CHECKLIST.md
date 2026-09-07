# 📱 Google Play Store Submission & Compliance Checklist

> **Application**: CineVenue  
> **Package ID**: `com.cinevenue.app`  
> **Version**: `1.0.0` (VersionCode: `1`)  
> **Primary Release Format**: Android App Bundle (`.aab`)

---

## 1. Store Listing Metadata

| Field | Requirement | Recommended Production Value |
| :--- | :--- | :--- |
| **App Name** | Max 30 chars | `CineVenue: Movies, Events & VIP` |
| **Short Description** | Max 80 chars | `Book movie tickets, live event passes, and earn CineCoins VIP rewards.` |
| **Full Description** | Max 4000 chars | *(See Full Description Copy below)* |
| **App Category** | Category selection | `Entertainment` |
| **Tags** | 5 tags | `Movies`, `Ticketing`, `Events`, `Cinema`, `Entertainment` |
| **Contact Email** | Public support email | `support@cinevenue.in` |
| **Contact Phone** | Public helpline | `+91 1800-123-4567` |
| **Website URL** | Official web portal | `https://cinevenue.in` |

### Full Description Copy
```text
Welcome to CineVenue – India's Premier Cinema Ticketing, Live Events & Film Production Platform.

Experience ultra-fast, seamless movie and live event ticketing with instant digital QR passes, real-time theatre seat layouts, Dolby Atmos & IMAX showtimes, and the exclusive CineCoins VIP loyalty vault.

✨ KEY FEATURES:

🎬 LIVE MOVIE TICKETING
- Explore the latest blockbusters, trailers, synopsis, and critic ratings.
- Real-time cinema showtime synchronization directly with theatre POS systems.
- Interactive seat selection with instant seat locking to prevent double-bookings.
- Multiplexes & single screens across Hyderabad, Bengaluru, Mumbai, Chennai, Delhi NCR, and more.

🎟️ LIVE CONCERTS & VIP EVENTS
- Book passes for celebrity galas, music festivals, movie launches, and standup comedy.
- Instant digital QR entry pass sent to your device and email inbox.

🪙 CINECOINS VIP LOYALTY REWARDS
- Earn CineCoins cashback on every movie and event ticket.
- Daily check-in streak rewards and lucky spin-the-wheel prizes.
- 1 CineCoin = ₹1.00 instant cashless discount applied during checkout.

🎥 FILM PRODUCTION & CREATOR MARKETPLACE
- Direct access to verified filmmaker casting calls, auditions, and story submissions.
- Connect with certified actors, directors, cinematographers, and technicians.

💳 100% SECURE CHECKOUT
- Encrypted UPI, Cards, NetBanking, and Instant Wallet checkout with zero hidden fees.
```

---

## 2. Play Store Graphics & Assets Checklist

- [ ] **App Icon**: 512 x 512 px, 32-bit PNG, max 1MB (High-res CineVenue Gold emblem).
- [ ] **Feature Graphic**: 1024 x 500 px, JPG or 24-bit PNG, max 15MB (Cinema aesthetic banner with CineVenue logo).
- [ ] **Phone Screenshots**: Minimum 4 screenshots, 16:9 or 9:16 aspect ratio (Recommended: 1080 x 2400 px):
  1. *Home Screen & Currently Running Blockbusters*
  2. *Interactive Real-Time Seat Selection Layout*
  3. *Digital QR Ticket Pass with POS Reference*
  4. *CineCoins Loyalty Vault & Daily Spin Wheel*
  5. *Live Concerts & Event Pass Booking*
- [ ] **Tablet Screenshots (Optional)**: 7-inch and 10-inch screenshots for tablet store optimization.

---

## 3. Official Policy & Legal Links

| Legal Document | Official Production URL |
| :--- | :--- |
| **Privacy Policy** | `https://cinevenue.in/privacy-policy` |
| **Terms & Conditions** | `https://cinevenue.in/terms-and-conditions` |
| **Refund & Cancellation** | `https://cinevenue.in/cancellation-refund-policy` |

---

## 4. Google Play Data Safety Form Guide

When filling out the **Data safety** questionnaire in Google Play Console, answer according to actual app behavior:

### Data Collection & Purpose
1. **Location (Approximate & Precise)**:
   - *Collected*: Yes (Optional when granted).
   - *Purpose*: App functionality (Locating nearby cinemas, theatres, and local showtimes).
   - *Shared with third parties*: No.
   - *User control*: Users can deny permission and manually select a city.
2. **Personal Info (Name, Email, Phone Number)**:
   - *Collected*: Yes (Upon user account registration and ticket checkout).
   - *Purpose*: Account management, booking confirmations, and e-ticket delivery.
   - *Shared with third parties*: No.
3. **Financial Info (Purchase History)**:
   - *Collected*: Yes (Stored on CineVenue secure server for booking history).
   - *Purpose*: Customer support, ticket dispute resolution, and transaction receipts.
   - *Shared with third parties*: Payment processing handled directly via PCI-DSS compliant payment gateways (Razorpay/UPI). App does NOT store card numbers.
4. **App Activity & Performance**:
   - *Collected*: Crash logs and diagnostics.
   - *Purpose*: Analytics and app reliability.

### Security Practices
- **Data encrypted in transit**: Yes (All network calls use TLS 1.3 / HTTPS).
- **Data deletion mechanism**: Yes (Users can request account/data deletion via `support@cinevenue.in` or Account Settings).

---

## 5. Android Permissions Justification

| Permission | Justification for Google Play Reviewers |
| :--- | :--- |
| `android.permission.INTERNET` | Required to communicate with CineVenue backend for live showtimes, seat layout maps, booking verification, and CineCoin balances. |
| `android.permission.ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION` | Optional. Allows users to automatically discover theatres and cinemas closest to their current physical location. If denied, users manually pick their city. |
| `android.permission.POST_NOTIFICATIONS` | Android 13+ runtime permission used to send booking confirmations, showtime reminders, and CineCoin reward notifications. |

---

## 6. Content Rating Questionnaire (IARC)

Complete the rating questionnaire honestly:
- **Violence**: None (0).
- **Sexuality / Nudity**: None (0).
- **Profanity / Crude Humor**: None (0).
- **Gambling / Real Money Gaming**: None (0) — CineCoins are a non-cash loyalty reward program and cannot be cashed out for real fiat currency outside ticket discounts.
- **Expected Rating**: `PEGI 3` / `Everyone (ESRB)` / `USK 0`.

---

## 7. Pre-Submission Checklist

- [ ] Package name verified: `com.cinevenue.app`
- [ ] Version code set: `1` (Version: `1.0.0`)
- [ ] Production backend API URL configured (`https://api.cinevenue.in/api`)
- [ ] Release signing keystore generated and safely backed up
- [ ] Google Play App Signing enabled in Play Console
- [ ] Privacy Policy URL verified and publicly accessible
- [ ] Internal Testing Track release uploaded and tested on physical Android devices
