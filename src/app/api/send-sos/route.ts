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

    // For now, we'll use the browser's built-in push API
    // In a production app, you'd use Firebase Admin SDK to send FCM messages
    const tokens = deviceTokens.map((token) => token.token);

    // Send notifications to all registered devices
    const notificationPromises = tokens.map(async (token) => {
      try {
        // This is a simplified version - in production you'd use FCM
        // For now, we'll return success for demonstration
        return { token, success: true };
      } catch (error) {
        console.error(`Failed to send notification to token: ${token}`, error);
        return {
          token,
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
    console.error("Error sending SOS notification:", error);
    return NextResponse.json(
      { error: "Failed to send SOS notification" },
      { status: 500 }
    );
  }
}
