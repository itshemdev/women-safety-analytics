"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SOSButtonProps {
  userPosition: { lat: number; lng: number } | null;
}

export function SOSButton({ userPosition }: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleSOSPress = () => {
    setIsPressed(true);
    setShowConfirmDialog(true);
  };

  const handleSOSRelease = () => {
    setIsPressed(false);
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return Notification.permission;
  };

  const sendSOSAlert = async () => {
    try {
      setIsSending(true);

      // Request notification permission if needed
      const permission = await requestNotificationPermission();

      if (permission !== "granted") {
        toast.error("Notification permission is required for SOS alerts");
        return;
      }

      // Get user's current location
      const location = userPosition || (await getCurrentLocation());

      if (!location) {
        toast.error("Unable to get your location");
        return;
      }

      // Send SOS alert to server
      const response = await fetch("/api/sos-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          timestamp: new Date().toISOString(),
          userId: "user-" + Date.now(), // In a real app, use actual user ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send SOS alert");
      }

      // Show local notification
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification("SOS Alert Sent!", {
          body: "Emergency services and nearby users have been notified",
          icon: "/icon-192x192.svg",
          badge: "/icon-192x192.svg",
          tag: "sos-alert",
          requireInteraction: true,
        });
      }

      toast.success(
        "SOS Alert sent! Emergency services and nearby users notified."
      );

      // Auto-dial emergency number (if supported)
      if (navigator.userAgent.includes("Mobile")) {
        window.location.href = "tel:911";
      }
    } catch (error) {
      console.error("Error sending SOS alert:", error);
      toast.error("Failed to send SOS alert. Please try again.");
    } finally {
      setIsSending(false);
      setShowConfirmDialog(false);
    }
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  return (
    <>
      {/* SOS Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className={`
            h-16 w-16 rounded-full shadow-lg transition-all duration-200
            ${
              isPressed
                ? "bg-red-700 scale-95 shadow-xl"
                : "bg-red-600 hover:bg-red-700 hover:scale-105"
            }
            ${isSending ? "animate-pulse" : ""}
          `}
          onMouseDown={handleSOSPress}
          onMouseUp={handleSOSRelease}
          onMouseLeave={handleSOSRelease}
          onTouchStart={handleSOSPress}
          onTouchEnd={handleSOSRelease}
          disabled={isSending}
        >
          <AlertTriangle className="h-8 w-8" />
        </Button>

        {/* Label */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          SOS
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Emergency SOS Alert
            </DialogTitle>
            <DialogDescription>
              This will send an emergency alert to all nearby users and
              emergency services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Location Info */}
            {userPosition && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-4 w-4 text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium">Your Location</div>
                  <div className="text-gray-600">
                    {userPosition.lat.toFixed(6)}, {userPosition.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            )}

            {/* Notification Status */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium">Alert Recipients</div>
                <div className="text-blue-600">
                  {notificationPermission === "granted"
                    ? "All nearby users will be notified"
                    : "Notification permission required"}
                </div>
              </div>
            </div>

            {/* Emergency Call */}
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <Phone className="h-4 w-4 text-red-600" />
              <div className="text-sm">
                <div className="font-medium">Emergency Services</div>
                <div className="text-red-600">
                  911 will be called automatically
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                onClick={sendSOSAlert}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send SOS Alert"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
