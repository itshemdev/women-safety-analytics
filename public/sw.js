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
        title: '🚨 SOS Alert',
        body: 'Emergency situation detected! Please check the safety app immediately.',
        icon: '/icon-192x192.svg',
        badge: '/icon-192x192.svg',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        requireInteraction: true,
        tag: 'sos-alert',
        data: {
            dateOfArrival: Date.now(),
            type: 'sos-alert',
            url: '/'
        },
        actions: [
            {
                action: 'view',
                title: 'View Details',
                icon: '/icon-192x192.svg'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: '/icon-192x192.svg'
            }
        ]
    };

    // Parse push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                ...notificationData,
                ...data,
                data: {
                    ...notificationData.data,
                    ...data.data
                }
            };
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

    if (event.action === 'view') {
        // Open the app
        const notificationData = event.notification.data;
        const url = notificationData && notificationData.url ? notificationData.url : '/';

        event.waitUntil(
            clients.openWindow(url)
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification
        console.log('SOS notification dismissed');
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
