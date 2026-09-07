export const Config = {
  APP_NAME: 'CineVenue',
  APP_VERSION: '1.0.0',
  ANDROID_PACKAGE: 'com.cinevenue.app',
  ANDROID_VERSION_CODE: 1,
  API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.cinevenue.in/api',
  RAZORPAY_KEY_ID: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_PLACEHOLDER',
  DEEP_LINK_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME || 'cinevenue',
  DEFAULT_CITY: 'Hyderabad',
  SUPPORT_EMAIL: 'support@cinevenue.in',
  SUPPORT_PHONE: '1800-123-4567',
  PRIVACY_POLICY_URL: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || 'https://cinevenue.in/privacy-policy',
  TERMS_URL: process.env.EXPO_PUBLIC_TERMS_URL || 'https://cinevenue.in/terms-and-conditions',
  REFUND_URL: process.env.EXPO_PUBLIC_REFUND_URL || 'https://cinevenue.in/cancellation-refund-policy',
  DEFAULT_SEAT_HOLD_MINUTES: 10,
  AVAILABLE_CITIES: [
    'Hyderabad',
    'Bengaluru',
    'Mumbai',
    'Chennai',
    'Delhi NCR',
    'Kochi',
    'Kolkata',
    'Pune',
    'Vijayawada',
    'Visakhapatnam'
  ]
};

export const POPULAR_CITIES = [
  { id: 'hyd', name: 'Hyderabad', state: 'Telangana' },
  { id: 'blr', name: 'Bengaluru', state: 'Karnataka' },
  { id: 'mum', name: 'Mumbai', state: 'Maharashtra' },
  { id: 'chn', name: 'Chennai', state: 'Tamil Nadu' },
  { id: 'del', name: 'Delhi NCR', state: 'Delhi' },
  { id: 'vja', name: 'Vijayawada', state: 'Andhra Pradesh' },
  { id: 'vzg', name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { id: 'koc', name: 'Kochi', state: 'Kerala' },
  { id: 'kol', name: 'Kolkata', state: 'West Bengal' },
  { id: 'pun', name: 'Pune', state: 'Maharashtra' }
];

export const ALL_CITIES = POPULAR_CITIES;
