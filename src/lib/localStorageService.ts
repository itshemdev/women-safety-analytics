export interface LocationDetails {
  id: string;
  lat: number;
  lng: number;
  category: "safe" | "moderate" | "danger";
  radius: number;
  notes: string;
  createdAt: Date;
}

const STORAGE_KEY = "safetyZones";

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Save a new safety zone to localStorage
export const saveSafetyZone = async (
  locationData: Omit<LocationDetails, "id" | "createdAt">
): Promise<string> => {
  try {
    const id = generateId();
    const newZone: LocationDetails = {
      ...locationData,
      id,
      createdAt: new Date(),
    };

    const existingZones = getSafetyZones();
    const updatedZones = [newZone, ...existingZones];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedZones));
    return id;
  } catch (error) {
    console.error("Error saving safety zone:", error);
    throw error;
  }
};

// Retrieve all safety zones from localStorage
export const getSafetyZones = (): LocationDetails[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const zones = JSON.parse(stored);
    // Convert createdAt strings back to Date objects
    return zones.map((zone: any) => ({
      ...zone,
      createdAt: new Date(zone.createdAt),
    }));
  } catch (error) {
    console.error("Error getting safety zones:", error);
    return [];
  }
};

// Delete a safety zone from localStorage
export const deleteSafetyZone = async (zoneId: string): Promise<void> => {
  try {
    const existingZones = getSafetyZones();
    const updatedZones = existingZones.filter((zone) => zone.id !== zoneId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedZones));
  } catch (error) {
    console.error("Error deleting safety zone:", error);
    throw error;
  }
};
