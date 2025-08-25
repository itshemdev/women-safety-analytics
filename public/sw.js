// Service Worker for Women Safety App
const CACHE_NAME = 'women-safety-v1';
const urlsToCache = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
            )
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Handle background sync tasks
    console.log('Background sync triggered');
    // You can add logic here to sync data when connection is restored
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SOS_NOTIFICATION') {
        event.waitUntil(
            self.registration.showNotification(
                event.data.payload.title,
                {
                    ...event.data.payload,
                    vibrate: [200, 100, 200, 100, 200, 100, 200],
                    requireInteraction: true,
                    silent: false,
                    sound: 'default'
                }
            )
        );
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    let notificationData = {
        title: 'Women Safety Alert',
        body: 'Safety alert!',
        icon: '/icon-192x192.svg',
        badge: '/icon-192x192.svg',
        vibrate: [200, 100, 200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
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

    // Parse push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            if (data.notification) {
                notificationData = {
                    ...notificationData,
                    ...data.notification,
                    data: {
                        ...notificationData.data,
                        ...data.data
                    }
                };
            }
        } catch (error) {
            console.log('Push data parsing failed, using default notification');
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, notificationData)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view-location') {
        // Open the app with location data
        const notificationData = event.notification.data;
        const url = notificationData && notificationData.lat && notificationData.lng
            ? `/?lat=${notificationData.lat}&lng=${notificationData.lng}&alert=true`
            : '/';

        event.waitUntil(
            clients.openWindow(url)
        );
    } else if (event.action === 'call-emergency') {
        // Open phone dialer
        event.waitUntil(
            clients.openWindow('tel:911')
        );
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
