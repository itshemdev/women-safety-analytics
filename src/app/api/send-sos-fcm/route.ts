import { NextRequest, NextResponse } from "next/server";
import { getAllDeviceTokens } from "@/lib/fcmService";

// This would require Firebase Admin SDK setup
// For now, we'll simulate FCM functionality

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

    // Simulate FCM notification sending
    const fcmPayload = {
      notification: {
        title: "🚨 SOS Alert",
        body: "Emergency situation detected! Please check the safety app immediately.",
        icon: "/icon-192x192.svg",
        badge: "/icon-192x192.svg",
        tag: "sos-alert",
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        sound: "default",
        priority: "high",
        data: {
          url: "/",
          timestamp: Date.now().toString(),
          type: "sos-alert",
          click_action: "/",
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
      },
      android: {
        notification: {
          sound: "default",
          priority: "high",
          channel_id: "sos-alerts",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            category: "SOS_ALERT",
          },
        },
      },
      webpush: {
        notification: {
          requireInteraction: true,
          tag: "sos-alert",
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
        },
        fcm_options: {
          link: "/",
        },
      },
    };

    // Simulate sending to all devices
    const results = deviceTokens.map((deviceToken) => {
      // In real implementation, you would use Firebase Admin SDK:
      // await admin.messaging().send({
      //   token: deviceToken.fcmToken,
      //   ...fcmPayload
      // });

      return {
        deviceId: deviceToken.id,
        success: true,
        message: "FCM notification sent successfully",
      };
    });

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `SOS FCM notification sent to ${successful} devices`,
      totalDevices: deviceTokens.length,
      successful,
      failed,
      results,
      note: "This is a simulation. For real FCM, you need Firebase Admin SDK setup.",
    });
  } catch (error) {
    console.error("Error sending FCM SOS notification:", error);
    return NextResponse.json(
      { error: "Failed to send FCM SOS notification" },
      { status: 500 }
    );
  }
}
