"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, AlertTriangle, Shield, Info, X } from "lucide-react";
import { LocationDetailsWithId } from "@/lib/firestoreService";

interface LocationDetailPageProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  location: LocationDetailsWithId | null;
  onDelete?: (location: LocationDetailsWithId) => void;
}

const categoryConfig = {
  safe: {
    label: "Safe",
    icon: Shield,
    color: "bg-green-100 text-green-800 border-green-200",
  },
  moderate: {
    label: "Moderate",
    icon: Info,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  danger: {
    label: "Danger",
    icon: AlertTriangle,
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

export function LocationDetailPage({
  isOpen,
  onOpenChange,
  location,
  onDelete,
}: LocationDetailPageProps) {
  if (!location) return null;

  const config = categoryConfig[location.category];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[400px] sm:w-[540px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Details
          </DialogTitle>
          <DialogDescription>
            Information about this safety location
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Location Coordinates</h3>
            <div className="text-sm text-muted-foreground">
              Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Safety Category</h3>
            <Badge className={`${config.color} flex items-center gap-2 w-fit`}>
              <Icon className="h-4 w-4" />
              {config.label}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Radius</h3>
            <div className="text-sm">{location.radius} meters</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${Math.min((location.radius / 5000) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground">
              This creates a {location.radius}m circle around the location
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Additional Notes</h3>
            <div className="text-sm bg-gray-50 p-3 rounded-md min-h-[60px]">
              {location.notes || "No additional notes provided."}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            {onDelete && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(location);
                  onOpenChange(false);
                }}
                className="flex-1"
              >
                Delete Location
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
