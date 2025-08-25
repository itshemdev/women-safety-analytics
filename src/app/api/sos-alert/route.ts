import { NextRequest, NextResponse } from "next/server";

interface SOSAlertData {
  lat: number;
  lng: number;
  timestamp: string;
  userId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SOSAlertData = await request.json();
    const { lat, lng, timestamp, userId } = body;

    // Validate required fields
    if (!lat || !lng || !timestamp || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock implementation for development
    // In production, this would use Firebase Admin SDK
    console.log("🚨 SOS Alert Received:", {
      lat,
      lng,
      timestamp,
      userId,
      status: "active",
      createdAt: new Date().toISOString(),
    });

    // Simulate sending notifications to all users
    const mockRecipientsCount = Math.floor(Math.random() * 10) + 1;

    console.log(
      `📱 Mock: SOS Alert would be sent to ${mockRecipientsCount} users`
    );
    console.log("📞 Mock: Emergency services would be notified");
    console.log("📍 Mock: Location data would be shared with responders");

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      alertId: `mock-alert-${Date.now()}`,
      recipientsCount: mockRecipientsCount,
      message: "SOS alert sent successfully (mock mode)",
      note: "This is a development mock. In production, this would send real push notifications.",
    });
  } catch (error) {
    console.error("Error sending SOS alert:", error);
    return NextResponse.json(
      { error: "Failed to send SOS alert" },
      { status: 500 }
    );
  }
}

// Mock function for emergency services
async function sendToEmergencyServices(
  lat: number,
  lng: number,
  userId: string
) {
  console.log(`🚨 Emergency Services Alert (Mock):
    Location: ${lat}, ${lng}
    User: ${userId}
    Time: ${new Date().toISOString()}
    Status: Would trigger emergency response
  `);
}
