"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { pushNotificationService } from "@/lib/pushNotificationService";

export function PushNotificationSetup() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    setIsSupported(pushNotificationService.isSupported());

    // Check current permission status
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Check if token is already registered
    const checkRegistration = async () => {
      const token = pushNotificationService.getCurrentToken();
      setIsRegistered(!!token);
    };

    checkRegistration();
  }, []);

  const handleEnableNotifications = async () => {
    try {
      setIsLoading(true);

      // Request permission
      const granted = await pushNotificationService.requestPermission();

      if (!granted) {
        toast.error("Notification permission is required for SOS alerts");
        return;
      }

      setPermission("granted");

      // Register token
      const userId = `user-${Date.now()}`; // In a real app, use actual user ID
      const success = await pushNotificationService.registerToken(userId);

      if (success) {
        setIsRegistered(true);
        toast.success("Push notifications enabled! You'll receive SOS alerts.");
      } else {
        toast.error("Failed to enable push notifications");
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      setIsLoading(true);

      const success = await pushNotificationService.unregisterToken();

      if (success) {
        setIsRegistered(false);
        toast.success("Push notifications disabled");
      } else {
        toast.error("Failed to disable notifications");
      }
    } catch (error) {
      console.error("Error disabling notifications:", error);
      toast.error("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="fixed top-4 left-4 z-40 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Push notifications not supported in this browser
          </span>
        </div>
      </div>
    );
  }

  if (permission === "granted" && isRegistered) {
    return (
      <div className="fixed top-4 left-4 z-40 bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-800">SOS alerts enabled</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDisableNotifications}
            disabled={isLoading}
            className="ml-2 h-6 px-2 text-xs"
          >
            {isLoading ? "Disabling..." : "Disable"}
          </Button>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="fixed top-4 left-4 z-40 bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <BellOff className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-800">
            Notifications blocked. Please enable in browser settings.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-40 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-800">Enable SOS alerts</span>
        <Button
          size="sm"
          onClick={handleEnableNotifications}
          disabled={isLoading}
          className="ml-2 h-6 px-2 text-xs"
        >
          {isLoading ? "Enabling..." : "Enable"}
        </Button>
      </div>
    </div>
  );
}
