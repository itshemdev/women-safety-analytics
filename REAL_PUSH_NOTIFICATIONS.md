# Real Push Notifications Setup

This guide will help you set up real push notifications that work between your laptop and mobile device.

## 🚀 Quick Setup

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Firestore Database**
4. Enable **Cloud Messaging**

### 2. Get Firebase Configuration

1. Go to Project Settings → General
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app
4. Register your app and copy the config

### 3. Set Environment Variables

Create a `.env.local` file with your Firebase config:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Cloud Messaging VAPID Key
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
```

### 4. Get VAPID Key

1. Go to Project Settings → Cloud Messaging
2. Scroll down to "Web configuration"
3. Click "Generate key pair"
4. Copy the VAPID key

### 5. Update Firebase Config

Update `src/lib/firebaseConfig.ts` with your config:

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

## 📱 Testing Cross-Device Notifications

### Step 1: Enable Notifications on Both Devices

1. **Laptop**: Open the app in Chrome/Edge
2. **Mobile**: Open the app in mobile browser or install as PWA
3. **Both devices**: Click "Enable SOS alerts" in top-left
4. **Both devices**: Grant notification permissions when prompted

### Step 2: Test Real Notifications

1. **On laptop**: Click the red SOS button
2. **On mobile**: You should receive a notification within seconds
3. **On mobile**: Tap the notification to view the location

### Step 3: Verify Device Registration

Check the browser console on both devices for:

```
📱 Firebase messaging initialized
Token registered successfully in Firestore
🔔 Starting notification polling for device: device-xxx
```

## 🔧 How It Works

### Device Registration

- Each device gets a unique ID stored in localStorage
- Firebase messaging token is stored in Firestore
- Device info (platform, user agent) is also stored

### SOS Alert Flow

1. User clicks SOS button
2. Location is captured
3. Alert is sent to `/api/real-sos-alert`
4. Alert is stored in Firestore
5. All other device tokens are retrieved
6. Notification data is stored in `pendingNotifications` collection
7. Other devices poll for new notifications
8. Notifications are displayed on all devices

### Real-time Updates

- Uses Firestore real-time listeners
- Notifications appear instantly across devices
- No polling delays or missed notifications

## 🛠️ Troubleshooting

### Notifications Not Working?

1. **Check Firebase config**: Verify all environment variables are set
2. **Check VAPID key**: Ensure it's correct and valid
3. **Check permissions**: Both devices need notification permission
4. **Check console logs**: Look for Firebase initialization errors
5. **Check network**: Both devices need internet connection

### Common Issues

1. **"Firebase not initialized"**: Check your config values
2. **"No registration token"**: VAPID key might be wrong
3. **"Permission denied"**: User needs to grant notification permission
4. **"Network error"**: Check internet connection

### Debug Steps

1. Open browser console on both devices
2. Look for these success messages:
   ```
   📱 Firebase messaging initialized
   Token registered successfully in Firestore
   🔔 Starting notification polling for device: device-xxx
   ```
3. Send SOS alert and check for:
   ```
   🚨 Real SOS Alert Received
   📱 Found X other device tokens to notify
   🔔 New notification received
   ```

## 🎯 Production Considerations

### Security

- Add user authentication
- Implement rate limiting
- Add device verification
- Use Firebase security rules

### Performance

- Implement notification batching
- Add notification delivery tracking
- Optimize Firestore queries
- Add offline support

### Features

- Add notification history
- Implement notification preferences
- Add emergency contact integration
- Add location-based filtering

## 📞 Support

If you're still having issues:

1. Check the browser console for errors
2. Verify Firebase project settings
3. Test with different browsers/devices
4. Check Firestore security rules
