import { NextRequest, NextResponse } from "next/server";

interface TokenRegistrationData {
  token: string;
  userId: string;
  deviceInfo?: {
    platform: string;
    browser: string;
    userAgent: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: TokenRegistrationData = await request.json();
    const { token, userId, deviceInfo } = body;

    // Validate required fields
    if (!token || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Mock implementation for development
    console.log("📱 Token Registration (Mock):", {
      token: token.substring(0, 20) + "...",
      userId,
      deviceInfo,
      timestamp: new Date().toISOString(),
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: "Token registered successfully (mock mode)",
      tokenId: `mock-token-${Date.now()}`,
      note: "This is a development mock. In production, this would store tokens in Firebase.",
    });

  } catch (error) {
    console.error("Error registering token:", error);
    return NextResponse.json(
      { error: "Failed to register token" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token parameter is required" },
        { status: 400 }
      );
    }

    // Mock implementation for development
    console.log("🗑️ Token Unregistration (Mock):", {
      token: token.substring(0, 20) + "...",
      timestamp: new Date().toISOString(),
    });

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      message: "Token unregistered successfully (mock mode)",
      note: "This is a development mock. In production, this would remove tokens from Firebase.",
    });

  } catch (error) {
    console.error("Error unregistering token:", error);
    return NextResponse.json(
      { error: "Failed to unregister token" },
      { status: 500 }
    );
  }
}
