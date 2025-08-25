"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { realPushNotificationService } from "@/lib/realPushNotificationService";
import { toast } from "sonner";

export function NotificationPolling() {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const deviceId = realPushNotificationService.getDeviceId();

    if (!deviceId) return;

    console.log("🔔 Starting notification polling for device:", deviceId);

    // Listen for pending notifications for this device
    const notificationsQuery = query(
      collection(db, "pendingNotifications"),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const notificationData = change.doc.data();

          // Check if this notification is for this device
          if (
            notificationData.tokens &&
            notificationData.tokens.includes(
              realPushNotificationService.getCurrentToken()
            )
          ) {
            console.log("🔔 New notification received:", notificationData);

            // Show the notification
            showNotification(notificationData.notification);

            // Mark as delivered (optional - you could update the document status)
          }
        }
      });
    });

    setIsListening(true);

    return () => {
      unsubscribe();
      setIsListening(false);
    };
  }, []);

  const showNotification = (notification: any) => {
    // Show browser notification
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.body,
          icon: "/icon-192x192.svg",
          badge: "/icon-192x192.svg",
          tag: "sos-alert",
          requireInteraction: true,
          data: notification.data,
        });

        // Handle notification click
        browserNotification.onclick = () => {
          if (
            notification.data &&
            notification.data.lat &&
            notification.data.lng
          ) {
            // Open the app with location data
            const url = `/?lat=${notification.data.lat}&lng=${notification.data.lng}&alert=true`;
            window.open(url, "_blank");
          }
          browserNotification.close();
        };

        console.log("🔔 Browser notification shown");
      } catch (error) {
        console.error("🔔 Error showing browser notification:", error);
      }
    }

    // Show toast notification
    toast(notification.title, {
      description: notification.body,
      duration: 10000,
      action: {
        label: "View",
        onClick: () => {
          if (
            notification.data &&
            notification.data.lat &&
            notification.data.lng
          ) {
            const url = `/?lat=${notification.data.lat}&lng=${notification.data.lng}&alert=true`;
            window.open(url, "_blank");
          }
        },
      },
    });
  };

  return null; // This component doesn't render anything visible
}
