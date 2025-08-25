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
    console.error("Error saving device token:", error);
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
    console.error("Error getting device tokens:", error);
    throw error;
  }
};

// Delete device token
export const deleteDeviceToken = async (tokenId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, DEVICE_TOKENS_COLLECTION, tokenId));
  } catch (error) {
    console.error("Error deleting device token:", error);
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
    console.error("Error checking token existence:", error);
    return false;
  }
};
