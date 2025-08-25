"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function APITestButton() {
  const [isTesting, setIsTesting] = useState(false);

  const testAPI = async () => {
    setIsTesting(true);
    try {
      console.log("🧪 Testing API endpoints...");

      // Test SOS alert API
      const apiUrl = `${window.location.origin}/api/sos-alert`;
      console.log("🧪 Testing SOS API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: 40.7128,
          lng: -74.006,
          timestamp: new Date().toISOString(),
          userId: "test-user",
        }),
      });

      console.log("🧪 Response status:", response.status);
      console.log("🧪 Response ok:", response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log("🧪 API test successful:", result);
        toast.success("API test successful! Check console for details.");
      } else {
        const errorText = await response.text();
        console.error("🧪 API test failed:", errorText);
        toast.error(`API test failed: ${response.status}`);
      }
    } catch (error) {
      console.error("🧪 API test error:", error);
      toast.error(
        `API test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed top-20 left-4 z-40">
      <Button
        onClick={testAPI}
        disabled={isTesting}
        variant="outline"
        size="sm"
        className="bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
      >
        {isTesting ? "Testing..." : "🧪 Test API"}
      </Button>
    </div>
  );
}
