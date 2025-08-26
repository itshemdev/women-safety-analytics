import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const DEVICE_TOKENS_COLLECTION = "deviceTokens";

export interface DeviceToken {
  id?: string;
  token: string;
  userId: string;
  browser: string;
  createdAt: Date;
  lastUsed: Date;
  fcmToken?: string; // Firebase Cloud Messaging token
}

// Save device token to Firestore
export const saveDeviceToken = async (
  token: string,
  userId: string = "default-user"
): Promise<string> => {
  try {
    const deviceToken: Omit<DeviceToken, "id"> = {
      token,
      userId,
      browser: navigator.userAgent,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    const docRef = await addDoc(
      collection(db, DEVICE_TOKENS_COLLECTION),
      deviceToken
    );
    return docRef.id;
      } catch (error) {
      throw error;
    }
};

// Get all device tokens
export const getAllDeviceTokens = async (): Promise<DeviceToken[]> => {
  try {
    const querySnapshot = await getDocs(
      collection(db, DEVICE_TOKENS_COLLECTION)
    );

    const tokens: DeviceToken[] = [];
    querySnapshot.forEach((doc) => {
      tokens.push({
        id: doc.id,
        ...doc.data(),
      } as DeviceToken);
    });

    return tokens;
      } catch (error) {
      throw error;
    }
};

// Delete device token
export const deleteDeviceToken = async (tokenId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, DEVICE_TOKENS_COLLECTION, tokenId));
      } catch (error) {
      throw error;
    }
};

// Check if token already exists
export const isTokenExists = async (token: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, DEVICE_TOKENS_COLLECTION),
      where("token", "==", token)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
      } catch (error) {
      return false;
    }
};

// Request FCM token for background notifications
export const requestFCMToken = async (): Promise<string | null> => {
  try {
    // Check if Firebase Messaging is available
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return null;
    }

    const registration = await navigator.serviceWorker.ready;

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }

    // Get FCM token (this would require Firebase Messaging SDK)
    // For now, we'll return a placeholder
    const fcmToken = `fcm_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return fcmToken;
      } catch (error) {
      return null;
    }
};
