import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Navigation, Focus } from "lucide-react";
import { api } from "@/lib/api";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet with Vite-compatible URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="8" width="20" height="8" rx="2" fill="#22c55e"/>
      <circle cx="7" cy="18" r="2" fill="#16a34a"/>
      <circle cx="17" cy="18" r="2" fill="#16a34a"/>
      <rect x="2" y="6" width="12" height="2" rx="1" fill="#16a34a"/>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface Vehicle {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  status: "collecting" | "en_route" | "available" | "offline";
  route: string;
  capacity: number;
  currentLoad: number;
  vehicleId?: string;
  workerId?: string;
  lastUpdated?: string;
}




const MapUpdater = ({ vehicles, shouldFitBounds, setShouldFitBounds }: { vehicles: Vehicle[], shouldFitBounds: boolean, setShouldFitBounds: (value: boolean) => void }) => {
  const map = useMap();

  useEffect(() => {
    if (shouldFitBounds && vehicles.length > 0) {
      const bounds = L.latLngBounds(vehicles.map(v => [v.lat, v.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
      setShouldFitBounds(false);
    }
  }, [shouldFitBounds, vehicles, map, setShouldFitBounds]);

  return null;
};

export const VehicleMap = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  const [shouldFitBounds, setShouldFitBounds] = useState(false);

  // Fetch real worker locations with GPS tracking
  const fetchActiveWorkers = async () => {
    try {
      const response = await api.get('/workers/active');
      const workers = response || [];
      
      console.log('Fetched workers:', workers.length, workers);
      
      if (workers.length === 0) {
        setVehicles([]);
        setError("No active workers found. Workers must start GPS tracking from their dashboard.");
        return;
      }
      
      // Filter workers with valid GPS coordinates and check if they're truly active
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const workersWithLocation = workers.filter((worker: any) => {
        if (!worker.currentLocation?.lat || !worker.currentLocation?.lng) {
          return false;
        }
        
        // Check if worker is truly offline based on last update time
        const lastUpdated = new Date(worker.currentLocation.lastUpdated || 0);
        const isRecentlyActive = lastUpdated > fiveMinutesAgo;
        
        return worker.status !== 'offline' && isRecentlyActive;
      });
      
      console.log('Workers with location:', workersWithLocation.length, workersWithLocation);
      
      if (workersWithLocation.length === 0) {
        setVehicles([]);
        setError("No workers with GPS location found. Workers must enable location tracking in their dashboard.");
        return;
      }
      
      const mappedVehicles: Vehicle[] = workersWithLocation.map((worker: any) => ({
        _id: worker._id,
        name: worker.name || `Worker ${worker.workerId || worker._id.slice(-4)}`,
        lat: worker.currentLocation.lat,
        lng: worker.currentLocation.lng,
        status: (() => {
          const lastUpdated = new Date(worker.currentLocation.lastUpdated || 0);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          
          // If last update was more than 5 minutes ago, consider offline
          if (lastUpdated < fiveMinutesAgo) {
            return 'offline';
          }
          
          return worker.status || 'available';
        })(),
        route: worker.route || 'Route not assigned',
        capacity: worker.vehicleCapacity || 1000,
        currentLoad: worker.currentLoad || 0,
        vehicleId: worker.vehicleId || 'Not assigned',
        workerId: worker.workerId || worker._id,
        lastUpdated: worker.currentLocation.lastUpdated
      }));
      
      console.log('Mapped vehicles:', mappedVehicles);
      setVehicles(mappedVehicles);
      setError(null);
    } catch (error: any) {
      console.error('Failed to fetch active workers:', error);
      setVehicles([]);
      setError(`Failed to load worker locations: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveWorkers();
  }, []);
  
  // Debug: Log vehicles state changes
  useEffect(() => {
    console.log('VehicleMap: vehicles state updated:', vehicles);
  }, [vehicles]);

  const getStatusColor = (status: Vehicle["status"]) => {
    switch (status) {
      case "collecting":
        return "text-warning";
      case "en_route":
        return "text-primary";
      case "available":
        return "text-success";
      case "offline":
        return "text-gray-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getLoadPercentage = (vehicle: Vehicle) => {
    return Math.round((vehicle.currentLoad / vehicle.capacity) * 100);
  };

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>Live Vehicle Tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShouldFitBounds(true)}
                disabled={vehicles.length === 0}
              >
                <Focus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={mapType === 'street' ? 'default' : 'outline'}
                onClick={() => setMapType('street')}
              >
                Street
              </Button>
              <Button
                size="sm"
                variant={mapType === 'satellite' ? 'default' : 'outline'}
                onClick={() => setMapType('satellite')}
              >
                Satellite
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] rounded-lg overflow-hidden">
            <MapContainer
              center={vehicles.length > 0 ? [vehicles[0].lat, vehicles[0].lng] : [13.5497, 78.5004]}
              zoom={vehicles.length > 0 ? 15 : 12}
              style={{ height: "100%", width: "100%" }}
              className="rounded-lg"
            >
              {mapType === 'street' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
              )}
              <MapUpdater vehicles={vehicles} shouldFitBounds={shouldFitBounds} setShouldFitBounds={setShouldFitBounds} />
              {vehicles.map((vehicle) => (
                <>
                  <Circle
                    key={`circle-${vehicle._id}`}
                    center={[vehicle.lat, vehicle.lng]}
                    radius={100}
                    pathOptions={{
                      color: '#22c55e',
                      fillColor: '#22c55e',
                      fillOpacity: 0.1,
                      weight: 2
                    }}
                  />
                  <Marker
                    key={vehicle._id}
                    position={[vehicle.lat, vehicle.lng]}
                    icon={truckIcon}
                  >
                    <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-semibold text-foreground">{vehicle.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{vehicle.route}</p>
                      {vehicle.vehicleId && (
                        <p className="text-xs text-muted-foreground mb-2">Vehicle: {vehicle.vehicleId}</p>
                      )}
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Status:</span>
                          <span className={`font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Load:</span>
                          <span className="font-medium">
                            {vehicle.currentLoad}kg / {vehicle.capacity}kg
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all duration-300"
                            style={{ width: `${getLoadPercentage(vehicle)}%` }}
                          />
                        </div>

                      </div>
                    </div>
                    </Popup>
                  </Marker>
                </>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Message */}
      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">⚠️ {error}</p>
          <p className="text-yellow-700 text-xs mt-1">
            💡 Tip: Workers need to go to their dashboard → Vehicle Status tab → Start GPS Tracking to appear on this map.
          </p>
        </div>
      )}
      
      {loading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">🔄 Loading active workers...</p>
        </div>
      )}
      
      {!loading && !error && vehicles.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 text-sm">✅ Showing {vehicles.length} active worker(s) with GPS tracking enabled</p>
        </div>
      )}
      
      {!loading && !error && vehicles.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">🔄 Your location (13.630434, 78.479515) has been captured and should appear here once the backend processes the update.</p>
          <p className="text-blue-600 text-xs mt-1">If you don't see your location, try refreshing the page or restarting the backend server.</p>
        </div>
      )}

      {/* Vehicle Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle._id} className="card-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{vehicle.name}</h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vehicle.status === "collecting" ? "bg-warning/20 text-warning" :
                  vehicle.status === "en_route" ? "bg-primary/20 text-primary" :
                  vehicle.status === "available" ? "bg-success/20 text-success" :
                  "bg-gray/20 text-gray-600"
                }`}>
                  {vehicle.status.replace("_", " ").toUpperCase()}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{vehicle.route}</p>
              {vehicle.vehicleId && (
                <p className="text-xs text-muted-foreground mb-2">Vehicle: {vehicle.vehicleId}</p>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Load:</span>
                  <span className="font-medium">{getLoadPercentage(vehicle)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${getLoadPercentage(vehicle)}%` }}
                  />
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}</span>
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};