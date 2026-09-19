import { VehicleMap } from "@/components/map/VehicleMap";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

export const VehicleTracking = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Live Vehicle Tracking</h1>
          <p className="text-muted-foreground">
            Real-time GPS tracking of waste collection vehicles across the city
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          📍 <strong>Live Tracking:</strong> This map shows real-time locations of active workers who have enabled GPS tracking in their dashboard.
          Workers must start GPS tracking from their "Vehicle Status" tab to appear on this map.
        </p>
      </div>

      <VehicleMap key={refreshKey} />
    </div>
  );
};