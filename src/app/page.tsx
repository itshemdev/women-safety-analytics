"use client";

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
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PWARegistration } from "@/components/pwa-registration";
import { NotificationRegistration } from "@/components/notification-registration";
import { SOSButton } from "@/components/sos-button";

import { toast } from "sonner";
import { BarChart3 } from "lucide-react";
import {
  saveSafetyZone,
  getSafetyZones,
  deleteSafetyZone,
  LocationDetailsWithId,
} from "@/lib/firestoreService";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  const [isSaving, setIsSaving] = useState(false);
  const [tempMarker, setTempMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [tempCircle, setTempCircle] = useState<{
    lat: number;
    lng: number;
    radius: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [mapZoom, setMapZoom] = useState(11);
  const [mapCenter, setMapCenter] = useState({ lat: 13.0827, lng: 80.2707 });

  useEffect(() => {
    const loadSafetyZones = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(0);

        // Simulate loading progress
        const progressInterval = setInterval(() => {
          setLoadingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 100);

        const zones = await getSafetyZones();
        setSavedLocations(zones);

        // Complete the progress
        clearInterval(progressInterval);
        setLoadingProgress(100);

        // Small delay to show completion
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(0);
        }, 200);
      } catch (error) {
        toast.error("Failed to load safety zones");
        setIsLoading(false);
        setLoadingProgress(0);
      }
    };

    loadSafetyZones();
  }, []);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {},
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

      // Update map center and zoom
      setMapCenter(clickedLocation);
      setMapZoom(15);
    }
  };

  const handleMarkerClick = (location: LocationDetailsWithId) => {
    setSelectedSavedLocation(location);
    setIsDetailOpen(true);

    // Center map on the clicked location and zoom in
    setMapCenter({ lat: location.lat, lng: location.lng });
    setMapZoom(16);
  };

  const handleCircleClick = (lat: number, lng: number) => {
    // Center map on the clicked circle and zoom in
    setMapCenter({ lat, lng });
    setMapZoom(15);
  };

  const handleSaveLocation = async (details: LocationDetailsInput) => {
    try {
      setIsSaving(true);
      const zoneId = await saveSafetyZone(details);
      const newZone: LocationDetailsWithId = {
        ...details,
        id: zoneId,
        createdAt: Timestamp.now(),
      };
      setSavedLocations((prev) => [newZone, ...prev]);
      setTempMarker(null);
      setTempCircle(null);

      // Update map center and zoom to the saved location
      setMapCenter({ lat: newZone.lat, lng: newZone.lng });
      setMapZoom(15);

      toast.success("Location saved successfully!");
    } catch (error) {
      toast.error("Failed to save location");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLocation = async (location: LocationDetailsWithId) => {
    try {
      await deleteSafetyZone(location.id);
      setSavedLocations((prev) => prev.filter((loc) => loc.id !== location.id));
      toast.success("Location deleted successfully!");
    } catch (error) {
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

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    );

  return (
    <div className="relative w-full h-screen">
      {/* Loading Oveay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Loading Safety Zones
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we load your safety data...
              </p>
              <div className="space-y-2">
                <Progress value={loadingProgress} className="w-full" />
                <p className="text-xs text-gray-500">
                  {loadingProgress}% complete
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saving Overlay */}
      {isSaving && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Saving Location
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we save your safety zone...
              </p>
            </div>
          </div>
        </div>
      )}

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
        center={mapCenter}
        zoom={mapZoom}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
        }}
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
            onClick={() => handleCircleClick(tempCircle.lat, tempCircle.lng)}
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
              onClick={() => handleCircleClick(location.lat, location.lng)}
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

      {/* PWA Components */}
      <PWARegistration />
      <NotificationRegistration />
      <PWAInstallPrompt />

      {/* SOS Button */}
      <SOSButton />
    </div>
  );
}
