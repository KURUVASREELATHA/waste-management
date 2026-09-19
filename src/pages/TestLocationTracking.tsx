import { useState } from "react";
import { LocationTracker } from "@/components/worker/LocationTracker";
import { VehicleMap } from "@/components/map/VehicleMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export const TestLocationTracking = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Location Tracking Test</h1>
          <p className="text-muted-foreground">
            Test the integration between LocationTracker and VehicleMap components
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Map</span>
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🧪 Testing Instructions:</h3>
        <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
          <li>Click "Start GPS Tracking" in the LocationTracker component below</li>
          <li>Allow location permissions when prompted by your browser</li>
          <li>Wait a few seconds for location to be acquired and sent to server</li>
          <li>Check the VehicleMap below - you should see your location appear as a truck marker</li>
          <li>The map should auto-refresh every 10 seconds to show real-time updates</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>LocationTracker Component</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationTracker workerId="test-worker" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Backend URL:</strong> http://localhost:3001/api</p>
              <p><strong>Workers Endpoint:</strong> /workers/active</p>
              <p><strong>Location Update:</strong> PATCH /workers/location</p>
              <p><strong>Status Update:</strong> PATCH /workers/status</p>
              <div className="mt-4 p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">
                  Open browser console (F12) to see detailed logs of API calls and responses
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>VehicleMap Component</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleMap key={refreshKey} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};