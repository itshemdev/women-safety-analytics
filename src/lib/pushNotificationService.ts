import { getMessaging, getToken, onMessage } from "firebase/messaging";
import app from "./firebaseConfig";

class PushNotificationService {
  private messaging: any = null;
  private currentToken: string | null = null;

  constructor() {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      this.messaging = getMessaging(app);
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.messaging) return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.messaging) return null;

    try {
      const currentToken = await getToken(this.messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (currentToken) {
        this.currentToken = currentToken;
        return currentToken;
      } else {
        console.log("No registration token available");
        return null;
      }
    } catch (error) {
      console.error("An error occurred while retrieving token:", error);
      return null;
    }
  }

  async registerToken(userId: string): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    try {
      const response = await fetch("/api/register-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          userId,
          deviceInfo: {
            platform: navigator.platform,
            browser: this.getBrowserInfo(),
            userAgent: navigator.userAgent,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register token");
      }

      const result = await response.json();
      console.log("Token registered successfully:", result);
      return true;
    } catch (error) {
      console.error("Error registering token:", error);
      return false;
    }
  }

  async unregisterToken(): Promise<boolean> {
    if (!this.currentToken) return false;

    try {
      const response = await fetch(
        `/api/register-token?token=${this.currentToken}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unregister token");
      }

      this.currentToken = null;
      console.log("Token unregistered successfully");
      return true;
    } catch (error) {
      console.error("Error unregistering token:", error);
      return false;
    }
  }

  onMessageReceived(callback: (payload: any) => void): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log("Message received:", payload);
      callback(payload);
    });
  }

  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  }

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

export const pushNotificationService = new PushNotificationService();
