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

        // For demonstration, we'll use a simple device identifier
        // In production, you'd use proper VAPID keys and push subscriptions
        const deviceId = `device_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Save device identifier to Firestore
        const exists = await isTokenExists(deviceId);

        if (!exists) {
          await saveDeviceToken(deviceId);
          console.log("Device registered for notifications");
          toast.success("Notifications enabled!");
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
