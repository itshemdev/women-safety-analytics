"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { saveDeviceToken, isTokenExists } from "@/lib/fcmService";

export function NotificationRegistration() {
  useEffect(() => {
    const registerForNotifications = async () => {
      try {
        // Check if service worker is available
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
          console.log("Push notifications not supported");
          return;
        }

        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Check if already subscribed
        const existingSubscription =
          await registration.pushManager.getSubscription();

        if (existingSubscription) {
          console.log("Already subscribed to push notifications");
          return;
        }

        // Request notification permission
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
          console.log("Notification permission denied");
          return;
        }

        // Create a simple subscription for demonstration
        // In production, you'd use proper VAPID keys
        const subscription = {
          endpoint: `https://fcm.googleapis.com/fcm/send/${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          keys: {
            p256dh: `p256dh_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            auth: `auth_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          },
        };

        // Save subscription to Firestore
        const subscriptionJson = JSON.stringify(subscription);
        const exists = await isTokenExists(subscriptionJson);

        if (!exists) {
          await saveDeviceToken(subscriptionJson);
          console.log("Device registered for push notifications");
          toast.success("Push notifications enabled!");
        }
      } catch (error) {
        console.error("Error registering for notifications:", error);
        toast.error("Failed to enable notifications");
      }
    };

    // Register for notifications when component mounts
    registerForNotifications();
  }, []);

  return null; // This component doesn't render anything
}
