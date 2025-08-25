# Environment Variables Setup

To enable the SOS button and push notifications, you need to set up the following environment variables in your `.env.local` file:

## Required Environment Variables

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Firebase Cloud Messaging VAPID Key
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Enable Cloud Messaging

### 2. Firebase Admin SDK

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values for:
   - `project_id`
   - `client_email`
   - `private_key`

### 3. Firebase Cloud Messaging

1. Go to Project Settings > Cloud Messaging
2. Generate a new Web Push certificate
3. Copy the VAPID key

### 4. Update Firebase Config

Update `src/lib/firebaseConfig.ts` with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
```

### 5. Update Firebase Messaging Service Worker

Update `public/firebase-messaging-sw.js` with your Firebase config:

```javascript
firebase.initializeApp({
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
});
```

## Testing the SOS Feature

1. Start the development server: `npm run dev`
2. Open the app in a supported browser
3. Grant notification permissions when prompted
4. Click the SOS button in the bottom right corner
5. Confirm the emergency alert
6. Check that notifications are sent to other users

## Troubleshooting

### Common Issues

1. **"Firebase not initialized"**: Check your Firebase config values
2. **"Permission denied"**: Ensure notification permissions are granted
3. **"Token registration failed"**: Check your API routes and Firebase Admin SDK setup
4. **"Push notifications not working"**: Verify VAPID key and service worker setup

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test Firebase Admin SDK connection
4. Check service worker registration
5. Verify notification permissions

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your Firebase Admin SDK private key secure
- Use appropriate Firebase security rules
- Consider rate limiting for SOS alerts
- Implement user authentication for production use
