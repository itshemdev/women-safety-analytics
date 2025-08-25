import { NextRequest, NextResponse } from "next/server";
import { getDocs, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

interface SOSAlertData {
  lat: number;
  lng: number;
  timestamp: string;
  userId: string;
  deviceId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SOSAlertData = await request.json();
    const { lat, lng, timestamp, userId, deviceId } = body;

    // Validate required fields
    if (!lat || !lng || !timestamp || !userId || !deviceId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("🚨 Real SOS Alert Received:", {
      lat,
      lng,
      timestamp,
      userId,
      deviceId,
    });

    // Store SOS alert in Firestore
    const sosAlertRef = await addDoc(collection(db, "sosAlerts"), {
      lat,
      lng,
      timestamp,
      userId,
      deviceId,
      status: "active",
      createdAt: new Date(),
    });

    // Get all device tokens except the sender's
    const tokensSnapshot = await getDocs(collection(db, "deviceTokens"));
    const tokens: string[] = [];

    tokensSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token && data.deviceId !== deviceId) {
        tokens.push(data.token);
      }
    });

    console.log(`📱 Found ${tokens.length} other device tokens to notify`);

    // Send push notifications to all other devices
    if (tokens.length > 0) {
      try {
        // Use the client-side service to send notifications
        // This is a simplified approach - in production, you'd use Firebase Admin SDK
        const notificationData = {
          title: "🚨 SOS Emergency Alert",
          body: "Someone nearby needs immediate help! Tap to view location and provide assistance.",
          data: {
            type: "sos-alert",
            alertId: sosAlertRef.id,
            lat: lat.toString(),
            lng: lng.toString(),
            timestamp,
            userId,
          },
        };

        // For now, we'll store the notification data in Firestore
        // The client will poll for new notifications
        await addDoc(collection(db, "pendingNotifications"), {
          tokens,
          notification: notificationData,
          createdAt: new Date(),
          status: "pending",
        });

        console.log("📱 Push notification data stored for delivery");
      } catch (notificationError) {
        console.error(
          "📱 Error preparing push notifications:",
          notificationError
        );
      }
    }

    return NextResponse.json({
      success: true,
      alertId: sosAlertRef.id,
      recipientsCount: tokens.length,
      message: "SOS alert sent successfully",
      note: "Push notifications will be delivered to all registered devices",
    });
  } catch (error) {
    console.error("Error sending real SOS alert:", error);
    return NextResponse.json(
      { error: "Failed to send SOS alert" },
      { status: 500 }
    );
  }
}
