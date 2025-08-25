"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export function SOSButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sendSOSNotification = async () => {
    try {
      // First, show local notification
      if ("serviceWorker" in navigator && "PushManager" in window) {
        const registration = await navigator.serviceWorker.ready;

        // Send message to service worker to trigger local push notification
        await registration.active?.postMessage({
          type: "SOS_NOTIFICATION",
          payload: {
            title: "🚨 SOS Alert",
            body: "Emergency situation detected! Please check the safety app immediately.",
            icon: "/icon-192x192.svg",
            badge: "/icon-192x192.svg",
            tag: "sos-alert",
            requireInteraction: true,
            actions: [
              {
                action: "view",
                title: "View Details",
              },
            ],
          },
        });
      }

      // Then send to all registered devices via FCM API
      const response = await fetch("/api/send-sos-fcm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`SOS alert sent to ${result.totalDevices} devices!`);
      } else {
        toast.error(result.message || "Failed to send SOS alert");
      }
    } catch (error) {
      console.error("Error sending SOS notification:", error);
      toast.error("Failed to send SOS alert");
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
        size="lg"
      >
        <AlertTriangle className="h-6 w-6" />
        <span className="sr-only">SOS</span>
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Send SOS Alert
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will send an emergency notification to all registered
              devices. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                sendSOSNotification();
                setIsDialogOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Send SOS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
