"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { MapPin, AlertTriangle, Shield, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface LocationDetails {
  lat: number;
  lng: number;
  category: "safe" | "moderate" | "danger";
  radius: number;
  notes: string;
}

interface LocationDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  location: { lat: number; lng: number } | null;
  onSave: (details: LocationDetails) => void;
  onRadiusChange?: (radius: number) => void;
}

const categoryOptions = [
  { value: "safe", label: "Safe", icon: Shield, color: "text-green-600" },
  {
    value: "moderate",
    label: "Moderate",
    icon: Info,
    color: "text-yellow-600",
  },
  {
    value: "danger",
    label: "Danger",
    icon: AlertTriangle,
    color: "text-red-600",
  },
];

export function LocationDetailsSheet({
  isOpen,
  onOpenChange,
  location,
  onSave,
  onRadiusChange,
}: LocationDetailsSheetProps) {
  const [formData, setFormData] = useState<
    Omit<LocationDetails, "lat" | "lng">
  >({
    category: "moderate",
    radius: 500,
    notes: "",
  });

  const handleSave = () => {
    if (location) {
      onSave({
        ...formData,
        lat: location.lat,
        lng: location.lng,
      });
      onOpenChange(false);
      setFormData({
        category: "moderate",
        radius: 500,
        notes: "",
      });
    }
  };

  const handleCategoryChange = (category: "safe" | "moderate" | "danger") => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleRadiusChange = (value: number[]) => {
    const newRadius = value[0];
    setFormData((prev) => ({ ...prev, radius: newRadius }));
    onRadiusChange?.(newRadius);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add Location Details
          </SheetTitle>
          <SheetDescription>
            Provide information about this location to help others stay safe.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-2 space-y-6 px-4">
          {location && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Location Coordinates
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Latitude
                  </Label>
                  <Input
                    value={location.lat.toFixed(6)}
                    disabled
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    Longitude
                  </Label>
                  <Input
                    value={location.lng.toFixed(6)}
                    disabled
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Safety Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <span className={option.color}>{option.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Radius: {formData.radius} meters</Label>
            <Slider
              value={[formData.radius]}
              onValueChange={handleRadiusChange}
              max={5000}
              min={500}
              step={100}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground">
              This will create a circle around the location to mark the affected
              area.
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe the situation, provide context, or add any relevant information..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Location
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
