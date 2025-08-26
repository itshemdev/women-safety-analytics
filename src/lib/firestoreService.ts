import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export interface LocationDetails {
  lat: number;
  lng: number;
  category: "safe" | "moderate" | "danger";
  radius: number;
  notes: string;
  createdAt: Timestamp;
}

export interface LocationDetailsWithId extends LocationDetails {
  id: string;
}

const COLLECTION_NAME = "safetyZones";

export const saveSafetyZone = async (
  locationData: Omit<LocationDetails, "createdAt">
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...locationData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
      } catch (error) {
      throw error;
    }
};

export const getSafetyZones = async (): Promise<LocationDetailsWithId[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const zones: LocationDetailsWithId[] = [];
    querySnapshot.forEach((doc) => {
      zones.push({
        id: doc.id,
        ...doc.data(),
      } as LocationDetailsWithId);
    });

    return zones;
      } catch (error) {
      throw error;
    }
};

export const deleteSafetyZone = async (zoneId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, zoneId));
      } catch (error) {
      throw error;
    }
};
