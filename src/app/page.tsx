"use client";

import Image from "next/image";
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { LocationDetailsSheet } from "@/components/location-details-sheet";
import { LocationDetailPage } from "@/components/location-detail-page";
import { AnalyticsSheet } from "../components/analytics-sheet";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";
import {
  saveSafetyZone,
  getSafetyZones,
  deleteSafetyZone,
  LocationDetailsWithId,
} from "@/lib/firestoreService";
import { Button } from "@/components/ui/button";

interface LocationDetailsInput {
  lat: number;
  lng: number;
  category: "safe" | "moderate" | "danger";
  radius: number;
  notes: string;
}

export default function Home() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [savedLocations, setSavedLocations] = useState<LocationDetailsWithId[]>(
    []
  );
  const [selectedSavedLocation, setSelectedSavedLocation] =
    useState<LocationDetailsWithId | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [tempMarker, setTempMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [tempCircle, setTempCircle] = useState<{
    lat: number;
    lng: number;
    radius: number;
  } | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSafetyZones = async () => {
      try {
        setIsLoading(true);
        const zones = await getSafetyZones();
        setSavedLocations(zones);
      } catch (error) {
        console.error("Error loading safety zones:", error);
        toast.error("Failed to load safety zones");
      } finally {
        setIsLoading(false);
      }
    };

    loadSafetyZones();
  }, []);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setSelectedLocation(clickedLocation);
      setTempMarker(clickedLocation);
      setTempCircle({ ...clickedLocation, radius: 1000 });
      setIsSheetOpen(true);

      if (mapRef) {
        mapRef.panTo(
          new google.maps.LatLng(clickedLocation.lat, clickedLocation.lng)
        );
      }
    }
  };

  const handleMarkerClick = (location: LocationDetailsWithId) => {
    setSelectedSavedLocation(location);
    setIsDetailOpen(true);
  };

  const handleSaveLocation = async (details: LocationDetailsInput) => {
    try {
      const zoneId = await saveSafetyZone(details);
      const newZone: LocationDetailsWithId = {
        ...details,
        id: zoneId,
        createdAt: new Date() as any,
      };
      setSavedLocations((prev) => [newZone, ...prev]);
      setTempMarker(null);
      setTempCircle(null);

      if (mapRef) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(newZone.lat, newZone.lng));
        mapRef.fitBounds(bounds);
        mapRef.setZoom(Math.min(mapRef.getZoom() || 15, 15));
      }

      toast.success("Location saved successfully!");
    } catch (error) {
      console.error("Error saving location:", error);
      toast.error("Failed to save location");
    }
  };

  const handleDeleteLocation = async (location: LocationDetailsWithId) => {
    try {
      await deleteSafetyZone(location.id);
      setSavedLocations((prev) => prev.filter((loc) => loc.id !== location.id));
      toast.success("Location deleted successfully!");
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setTempMarker(null);
      setTempCircle(null);
    }
  };

  const updateTempCircleRadius = (radius: number) => {
    if (tempCircle) {
      setTempCircle({ ...tempCircle, radius });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "safe":
        return "#10b981";
      case "moderate":
        return "#f59e0b";
      case "danger":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="relative w-full h-screen">
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-800">
              Women Safety Analytics
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={{ lat: 13.0827, lng: 80.2707 }}
        zoom={12}
        onClick={handleMapClick}
        onLoad={setMapRef}
      >
        {position && <Marker position={position} />}

        {tempMarker && (
          <Marker
            position={tempMarker}
            icon={{
              url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#6b7280" stroke="white" stroke-width="2"/>
                  <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">?</text>
                </svg>
              `)}`,
              scaledSize: new google.maps.Size(24, 24),
            }}
            title="New location - Fill details to save"
          />
        )}

        {tempCircle && (
          <Circle
            center={{ lat: tempCircle.lat, lng: tempCircle.lng }}
            radius={tempCircle.radius}
            options={{
              fillColor: "#6b7280",
              fillOpacity: 0.1,
              strokeColor: "#6b7280",
              strokeOpacity: 0.6,
              strokeWeight: 2,
            }}
          />
        )}

        {savedLocations.map((location) => (
          <div key={location.id}>
            <Marker
              position={{ lat: location.lat, lng: location.lng }}
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="${getCategoryColor(
                      location.category
                    )}" stroke="white" stroke-width="2"/>
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${location.category
                      .charAt(0)
                      .toUpperCase()}</text>
                  </svg>
                `)}`,
                scaledSize: new google.maps.Size(24, 24),
              }}
              onClick={() => handleMarkerClick(location)}
            />
            <Circle
              center={{ lat: location.lat, lng: location.lng }}
              radius={location.radius}
              options={{
                fillColor: getCategoryColor(location.category),
                fillOpacity: 0.2,
                strokeColor: getCategoryColor(location.category),
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          </div>
        ))}
      </GoogleMap>

      <LocationDetailsSheet
        isOpen={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
        location={selectedLocation}
        onSave={handleSaveLocation}
        onRadiusChange={updateTempCircleRadius}
      />

      <LocationDetailPage
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        location={selectedSavedLocation}
        onDelete={handleDeleteLocation}
      />

      <AnalyticsSheet
        isOpen={isAnalyticsOpen}
        onOpenChange={setIsAnalyticsOpen}
        savedLocations={savedLocations}
      />
    </div>
  );
}
