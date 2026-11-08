# CineVenue Flutter Mobile — API Integration Guide

This guide specifies how the Flutter mobile application integrates with the unified CineVenue backend REST APIs (`/api/v1`).

---

## 1. Base URL Configuration

* **Android Emulator**: `http://10.0.2.2:3000/api/v1`
* **iOS Simulator**: `http://127.0.0.1:3000/api/v1`
* **Production**: `https://cinevenue.com/api/v1`

---

## 2. Authentication Flow

### 2.1 Login (`POST /api/v1/auth/login`)
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "identifier": "customer@example.com",
  "password": "userPassword123"
}
```
**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "customer@example.com",
      "name": "Ananya Sharma",
      "mobile": "9876543210",
      "role": "CUSTOMER"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```
* **Flutter Action**: Save `accessToken`, `refreshToken`, and `user.id` into `FlutterSecureStorage`. Attach `Authorization: Bearer <accessToken>` to all authenticated requests via Dio `AuthInterceptor`.

### 2.2 Google Native Sign-In (`POST /api/v1/auth/google`)
```http
POST /api/v1/auth/google
Content-Type: application/json

{
  "idToken": "<google_id_token>",
  "email": "customer@gmail.com",
  "name": "Customer Name",
  "profileImageUrl": "https://lh3.googleusercontent.com/..."
}
```
**Response (200 OK)**: Returns the user and token pair identical to password login.

### 2.3 Token Refresh (`POST /api/v1/auth/refresh`)
When an API request returns `401 Unauthorized` with `TokenExpiredError`:
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<stored_refresh_token>"
}
```
**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Session refreshed successfully",
  "token": "eyJhbGciOi...",
  "data": {
    "tokens": {
      "accessToken": "<new_access_token>",
      "refreshToken": "<new_rotated_refresh_token>"
    }
  }
}
```
* **Flutter Action**: Update `FlutterSecureStorage` with the new token pair, release queued requests, and retry the original call.

---

## 3. User Profile API

### 3.1 Get Profile (`GET /api/v1/auth/me`)
```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

### 3.2 Update Profile (`PUT /api/v1/auth/me`)
```http
PUT /api/v1/auth/me
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "name": "Ananya Sharma",
  "mobile": "9876543210",
  "profileImageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb"
}
```
* Strict validation rejects unauthorized modifications to `role`, `email`, or `wallet`.

---

## 4. Push Notification Registration

### 4.1 Register Device Token (`POST /api/v1/notifications/device-token`)
```http
POST /api/v1/notifications/device-token
Authorization: Bearer <accessToken> (Optional)
Content-Type: application/json

{
  "token": "fcm_token_or_apns_device_token_string",
  "platform": "ANDROID",
  "deviceModel": "Google Pixel 8 Pro",
  "appVersion": "1.0.0"
}
```

### 4.2 Deactivate on Logout (`POST /api/v1/notifications/device-token/deactivate`)
```http
POST /api/v1/notifications/device-token/deactivate
Content-Type: application/json

{
  "token": "fcm_token_or_apns_device_token_string"
}
```

---

## 5. Movies & Pagination

### 5.1 List Movies (`GET /api/v1/movies`)
* **Standard Web**: `GET /api/v1/movies?status=NOW_SHOWING`
* **Mobile Paginated**: `GET /api/v1/movies?page=1&limit=10&search=Pushpa`

**Paginated Response**:
```json
{
  "success": true,
  "count": 10,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "data": {
    "movies": [ ... ]
  }
}
```

---

## 6. Movie Booking & Payment Flow

1. **Shows & Theatres**: `GET /api/v1/shows?movieId=mv_1&date=Today&city=Hyderabad`
2. **Realtime Seat Layout**: `GET /api/v1/shows/:id/seats`
3. **Lock Seats (10-min TTL)**:
   ```http
   POST /api/v1/bookings/lock-seats
   {
     "showId": "sch_123",
     "seatIds": ["ss_a1_123", "ss_a2_123"],
     "selectedCity": "Hyderabad"
   }
   ```
4. **Authoritative Price Calculation**:
   ```http
   POST /api/v1/pricing/calculate
   {
     "showId": "sch_123",
     "seatIds": ["ss_a1_123", "ss_a2_123"],
     "couponCode": "CINEVENUE10"
   }
   ```
5. **Pending Booking Creation**:
   ```http
   POST /api/v1/bookings
   {
     "showId": "sch_123",
     "seatIds": ["ss_a1_123", "ss_a2_123"],
     "userId": "usr_abc123"
   }
   ```
6. **Payment Order**:
   * Razorpay: `POST /api/v1/payments/razorpay/create-order`
   * Cashfree: `POST /api/v1/payments/cashfree/create-order`
7. **Native SDK Launch**:
   * Razorpay: `Razorpay.open(options)`
   * Cashfree: `CFPaymentGatewayService.doPayment(session)`
8. **Verify Payment**:
   * Razorpay: `POST /api/v1/payments/razorpay/verify-payment`
   * Cashfree: `POST /api/v1/payments/cashfree/verify-payment`

