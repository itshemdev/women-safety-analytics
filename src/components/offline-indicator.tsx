"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium shadow-sm">
        <Wifi className="h-4 w-4" />
        Online
      </div>
    );
  }

  return (
    <>
      {/* Status indicator */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2 bg-red-100 text-red-800 px-3 py-2 rounded-full text-sm font-medium shadow-sm">
        <WifiOff className="h-4 w-4" />
        Offline
      </div>

      {/* Offline alert */}
      {showOfflineAlert && (
        <div className="fixed top-16 left-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-top-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800">
                You&apos;re offline
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Some features may be limited. Your safety data is cached and
                will sync when you&apos;re back online.
              </p>
            </div>
            <button
              onClick={() => setShowOfflineAlert(false)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
