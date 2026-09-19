import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface LocationTrackerProps {
  workerId: string;
}

export const LocationTracker = ({ workerId }: LocationTrackerProps) => {
  const [isTracking, setIsTracking] = useState(() => {
    return localStorage.getItem('locationTracking') === 'true';
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(() => {
    const saved = localStorage.getItem('currentLocation');
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(newLocation);
        localStorage.setItem('currentLocation', JSON.stringify(newLocation));
        setError(null);
        updateWorkerLocation(newLocation);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );

    setWatchId(id);
    setIsTracking(true);
    localStorage.setItem('locationTracking', 'true');
    localStorage.setItem('locationWatchId', id.toString());
  };

  const stopTracking = async () => {
    const savedWatchId = localStorage.getItem('locationWatchId');
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    if (savedWatchId) {
      navigator.geolocation.clearWatch(parseInt(savedWatchId));
    }
    
    setIsTracking(false);
    localStorage.setItem('locationTracking', 'false');
    localStorage.removeItem('locationWatchId');
    localStorage.removeItem('currentLocation');
    
    // Update worker status to offline when stopping tracking
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const actualWorkerId = user?.workerId || workerId || 'TW001';
      await api.patch('/workers/status', { 
        status: 'offline',
        workerId: actualWorkerId
      }, false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const updateWorkerLocation = async (location: { lat: number; lng: number }) => {
    try {
      // Get the current user's workerId from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const actualWorkerId = user?.workerId || workerId || 'TW001';
      
      const response = await api.patch('/workers/location', {
        lat: location.lat,
        lng: location.lng,
        workerId: actualWorkerId
      }, false);
      console.log('Location update response:', response);
      
      const statusResponse = await api.patch('/workers/status', { 
        status: 'available',
        workerId: actualWorkerId
      }, false);
      console.log('Status update response:', statusResponse);
      setError(null);
    } catch (error: any) {
      console.error('LocationTracker: Failed to update location:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update location';
      setError(errorMessage);
      
      if (error.response?.status === 404) {
        setError('No worker found. Please ensure you are logged in as a worker.');
      }
    }
  };

  useEffect(() => {
    // Resume tracking if it was active before page refresh
    if (isTracking && !watchId) {
      startTracking();
    }
    
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Navigation className="h-5 w-5 text-primary" />
          <span>GPS Location Tracking</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Location Sharing:</span>
          <Button
            onClick={isTracking ? stopTracking : startTracking}
            variant={isTracking ? "destructive" : "default"}
            size="sm"
            className={isTracking ? "" : "bg-green-600 hover:bg-green-700"}
          >
            {isTracking ? "Stop Tracking" : "Start GPS Tracking"}
          </Button>
        </div>

        {location && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Current Location:</span>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p>Latitude: {location.lat.toFixed(6)}</p>
              <p>Longitude: {location.lng.toFixed(6)}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        {isTracking && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700">Location tracking active - Continues until stopped</span>
          </div>
        )}
        
        {location && (
          <div className="flex space-x-2 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`https://www.google.com/maps?q=${location.lat},${location.lng}`, '_blank')}
            >
              <MapPin className="h-3 w-3 mr-1" />
              View on Maps
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => window.open('/dashboard/tracking', '_blank')}
            >
              <Navigation className="h-3 w-3 mr-1" />
              Live Tracking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};