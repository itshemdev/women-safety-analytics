// Firebase messaging service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "your-api-key",
    authDomain: "your-auth-domain",
    projectId: "your-project-id",
    storageBucket: "your-storage-bucket",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'Women Safety Alert';
    const notificationOptions = {
        body: payload.notification?.body || 'Safety alert!',
        icon: '/icon-192x192.svg',
        badge: '/icon-192x192.svg',
        vibrate: [200, 100, 200, 100, 200],
        data: payload.data || {},
        requireInteraction: true,
        actions: [
            {
                action: 'view-location',
                title: 'View Location',
                icon: '/icon-192x192.svg'
            },
            {
                action: 'call-emergency',
                title: 'Call Emergency',
                icon: '/icon-192x192.svg'
            }
        ]
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view-location') {
        const notificationData = event.notification.data;
        const url = notificationData && notificationData.lat && notificationData.lng
            ? `/?lat=${notificationData.lat}&lng=${notificationData.lng}&alert=true`
            : '/';

        event.waitUntil(
            clients.openWindow(url)
        );
    } else if (event.action === 'call-emergency') {
        event.waitUntil(
            clients.openWindow('tel:911')
        );
    } else {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
