import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

class RealPushNotificationService {
  private messaging: any = null;
  private currentToken: string | null = null;
  private deviceId: string;

  constructor() {
    // Generate a unique device ID
    this.deviceId = this.getDeviceId();
    this.initializeMessaging();
  }

  private async initializeMessaging() {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      try {
        const { getMessaging, isSupported } = await import(
          "firebase/messaging"
        );
        const supported = await isSupported();

        if (supported) {
          const { default: app } = await import("./firebaseConfig");
          this.messaging = getMessaging(app);
          console.log("📱 Firebase messaging initialized");
        } else {
          console.log("📱 Firebase messaging not supported");
        }
      } catch (error) {
        console.error("📱 Error initializing messaging:", error);
      }
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

  async registerToken(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    try {
      // Store token in Firestore
      await setDoc(doc(db, "deviceTokens", this.deviceId), {
        token,
        deviceId: this.deviceId,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("Token registered successfully in Firestore");
      return true;
    } catch (error) {
      console.error("Error registering token:", error);
      return false;
    }
  }

  async unregisterToken(): Promise<boolean> {
    if (!this.currentToken) return false;

    try {
      // Remove token from Firestore
      await deleteDoc(doc(db, "deviceTokens", this.deviceId));
      this.currentToken = null;
      console.log("Token unregistered successfully");
      return true;
    } catch (error) {
      console.error("Error unregistering token:", error);
      return false;
    }
  }

  async getAllTokens(): Promise<string[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "deviceTokens"));
      const tokens: string[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.token && data.deviceId !== this.deviceId) {
          tokens.push(data.token);
        }
      });

      console.log(`Found ${tokens.length} other device tokens`);
      return tokens;
    } catch (error) {
      console.error("Error getting all tokens:", error);
      return [];
    }
  }

  onMessageReceived(callback: (payload: any) => void): void {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log("Message received:", payload);
      callback(payload);
    });
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

  getDeviceId(): string {
    return this.deviceId;
  }
}

export const realPushNotificationService = new RealPushNotificationService();
