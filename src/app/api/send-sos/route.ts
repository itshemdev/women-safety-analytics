import { NextRequest, NextResponse } from "next/server";
import { getAllDeviceTokens } from "@/lib/fcmService";

export async function POST(request: NextRequest) {
  try {
    // Get all device tokens from Firestore
    const deviceTokens = await getAllDeviceTokens();

    if (deviceTokens.length === 0) {
      return NextResponse.json(
        { message: "No devices registered for notifications" },
        { status: 404 }
      );
    }

    // Send actual push notifications to all registered devices
    const notificationPromises = deviceTokens.map(async (deviceToken) => {
      try {
        // Parse the device token to get subscription details
        const subscription = JSON.parse(deviceToken.token);

        // Send push notification using Web Push protocol
        const pushPayload = {
          title: "🚨 SOS Alert",
          body: "Emergency situation detected! Please check the safety app immediately.",
          icon: "/icon-192x192.svg",
          badge: "/icon-192x192.svg",
          tag: "sos-alert",
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200, 100, 200],
          data: {
            url: "/",
            timestamp: Date.now(),
            type: "sos-alert",
          },
          actions: [
            {
              action: "view",
              title: "View Details",
            },
            {
              action: "dismiss",
              title: "Dismiss",
            },
          ],
        };

        // Send the push notification
        const response = await fetch(subscription.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            TTL: "86400", // 24 hours
            Urgency: "high",
          },
          body: JSON.stringify(pushPayload),
        });

        if (response.ok) {
          return { token: deviceToken.token, success: true };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
              } catch (error) {
          return {
            token: deviceToken.token,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
    });

    const results = await Promise.all(notificationPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `SOS notification sent to ${successful} devices`,
      totalDevices: deviceTokens.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send SOS notification" },
      { status: 500 }
    );
  }
}
