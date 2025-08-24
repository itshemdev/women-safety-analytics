"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Shield, AlertTriangle, Info, MapPin } from "lucide-react";
import { LocationDetailsWithId } from "@/lib/firestoreService";

interface AnalyticsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  savedLocations: LocationDetailsWithId[];
}

export function AnalyticsSheet({
  isOpen,
  onOpenChange,
  savedLocations,
}: AnalyticsSheetProps) {
  const totalZones = savedLocations.length;
  const safeZones = savedLocations.filter(
    (loc) => loc.category === "safe"
  ).length;
  const moderateZones = savedLocations.filter(
    (loc) => loc.category === "moderate"
  ).length;
  const dangerZones = savedLocations.filter(
    (loc) => loc.category === "danger"
  ).length;

  const totalRadius = savedLocations.reduce((sum, loc) => sum + loc.radius, 0);
  const averageRadius =
    totalZones > 0 ? Math.round(totalRadius / totalZones) : 0;

  const zonesWithNotes = savedLocations.filter(
    (loc) => loc.notes.trim() !== ""
  ).length;
  const notesPercentage =
    totalZones > 0 ? Math.round((zonesWithNotes / totalZones) * 100) : 0;

  const categoryStats = [
    {
      name: "Safe Zones",
      count: safeZones,
      color: "bg-green-100 text-green-800",
      icon: Shield,
    },
    {
      name: "Moderate Zones",
      count: moderateZones,
      color: "bg-yellow-100 text-yellow-800",
      icon: Info,
    },
    {
      name: "Danger Zones",
      count: dangerZones,
      color: "bg-red-100 text-red-800",
      icon: AlertTriangle,
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Safety Analytics
          </SheetTitle>
          <SheetDescription>
            Overview of safety zones and statistics
          </SheetDescription>
        </SheetHeader>

        <div className="mt-2 space-y-6 px-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  Total Zones
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-800 mt-1">
                {totalZones}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Avg Radius
                </span>
              </div>
              <div className="text-2xl font-bold text-green-800 mt-1">
                {averageRadius}m
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Zone Categories</h3>
            <div className="space-y-2">
              {categoryStats.map((stat) => {
                const Icon = stat.icon;
                const percentage =
                  totalZones > 0
                    ? Math.round((stat.count / totalZones) * 100)
                    : 0;

                return (
                  <div
                    key={stat.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{stat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={stat.color}>{stat.count}</Badge>
                      <span className="text-sm text-gray-600">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Additional Insights</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Zones with Notes</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{zonesWithNotes}</Badge>
                  <span className="text-sm text-gray-600">
                    ({notesPercentage}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Coverage Area</span>
                <Badge variant="outline">{totalRadius.toLocaleString()}m</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Recent Activity</h3>
            <div className="space-y-2">
              {savedLocations.slice(0, 3).map((location) => (
                <div
                  key={location.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      location.category === "safe"
                        ? "bg-green-500"
                        : location.category === "moderate"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {location.category.charAt(0).toUpperCase() +
                        location.category.slice(1)}{" "}
                      Zone
                    </div>
                    <div className="text-xs text-gray-600">
                      {location.radius}m radius
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
