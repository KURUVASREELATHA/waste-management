import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Home, 
  Trash2, 
  Calendar, 
  Wifi, 
  WifiOff, 
  Battery, 
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Plus,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface QRScanResultProps {
  qrCode: string;
  onClose?: () => void;
}

export const QRScanResult = ({ qrCode, onClose }: QRScanResultProps) => {
  const { toast } = useToast();
  const [citizenData, setCitizenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showWasteEntry, setShowWasteEntry] = useState(false);
  const [wasteData, setWasteData] = useState({
    type: '',
    weight: '',
    description: ''
  });
  const [submittingWaste, setSubmittingWaste] = useState(false);

  const fetchCitizenData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`http://localhost:3001/api/qrcode/scan/${qrCode}`);
      
      if (!response.ok) {
        throw new Error('QR code not found or invalid');
      }
      
      const data = await response.json();
      setCitizenData(data);
      
      toast({
        title: "QR Code Scanned Successfully!",
        description: `Loaded data for ${data.citizen.name}`,
      });
    } catch (error: any) {
      setError(error.message || 'Failed to fetch citizen data');
      toast({
        title: "Scan Failed",
        description: error.message || 'Invalid QR code',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-green-600";
    if (level > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "text-green-600";
      case 'maintenance': return "text-yellow-600";
      case 'inactive': return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return "default";
      case 'maintenance': return "secondary";
      case 'inactive': return "destructive";
      default: return "outline";
    }
  };

  const handleWasteSubmit = async () => {
    if (!wasteData.type || !wasteData.weight) {
      toast({
        title: "Missing Information",
        description: "Please fill in waste type and weight",
        variant: "destructive",
      });
      return;
    }

    setSubmittingWaste(true);
    try {
      const response = await fetch('http://localhost:3001/api/waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: citizenData.citizen.id,
          type: wasteData.type,
          weight: parseFloat(wasteData.weight),
          description: wasteData.description || 'IoT Device Entry',
          location: citizenData.citizen.address || 'IoT Location',
          citizenName: citizenData.citizen.name,
          citizenHouseId: citizenData.houseId,
          status: 'collected',
          collectedAt: new Date().toISOString(),
          completionNotes: 'Collected via IoT device scan'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit waste data');
      }

      toast({
        title: "Waste Entry Added!",
        description: `${wasteData.weight}kg of ${wasteData.type} waste recorded for ${citizenData.citizen.name}`,
      });

      setWasteData({ type: '', weight: '', description: '' });
      setShowWasteEntry(false);
      fetchCitizenData();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || 'Failed to record waste data',
        variant: "destructive",
      });
    } finally {
      setSubmittingWaste(false);
    }
  };

  useEffect(() => {
    if (qrCode) {
      fetchCitizenData();
    }
  }, [qrCode]);

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto card-shadow">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center space-y-2">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading citizen data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto card-shadow">
        <CardContent className="text-center py-8 space-y-4">
          <div className="text-red-500">
            <p className="font-medium">Error: {error}</p>
            <p className="text-sm text-muted-foreground">Please check the QR code and try again</p>
          </div>
          <div className="flex space-x-2 justify-center">
            <Button onClick={fetchCitizenData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="ghost">
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!citizenData) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="card-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <span>Citizen Information</span>
            </CardTitle>
            {onClose && (
              <Button onClick={onClose} variant="ghost" size="sm">
                Close
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            {citizenData.citizen.profileImage ? (
              <img 
                src={citizenData.citizen.profileImage} 
                alt={citizenData.citizen.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold">{citizenData.citizen.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>House ID: <strong>{citizenData.houseId}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{citizenData.citizen.email}</span>
                </div>
                {citizenData.citizen.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{citizenData.citizen.phone}</span>
                  </div>
                )}
                {citizenData.citizen.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{citizenData.citizen.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waste Collection Data */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-green-600" />
            <span>Waste Collection Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {citizenData.wasteData.totalCollected || 0} kg
              </div>
              <div className="text-sm text-green-700">Total Collected</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {citizenData.wasteData.lastCollection 
                  ? new Date(citizenData.wasteData.lastCollection).toLocaleDateString()
                  : 'No collections'
                }
              </div>
              <div className="text-sm text-blue-700">Last Collection</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">
                {citizenData.wasteData.recentWaste?.length || 0}
              </div>
              <div className="text-sm text-purple-700">Recent Entries</div>
            </div>
          </div>

          {/* Recent Waste Entries */}
          {citizenData.wasteData.recentWaste && citizenData.wasteData.recentWaste.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Recent Waste Entries</h4>
              <div className="space-y-2">
                {citizenData.wasteData.recentWaste.slice(0, 3).map((waste: any) => (
                  <div key={waste._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Badge variant={waste.status === 'collected' ? 'default' : 'secondary'}>
                        {waste.type}
                      </Badge>
                      <span className="text-sm">{waste.weight} kg</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(waste.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IoT Sensor Data */}
      {citizenData.iotSensor && (
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wifi className="h-5 w-5 text-purple-600" />
              <span>IoT Sensor Status</span>
              <Badge variant={getStatusBadgeVariant(citizenData.iotSensor.status)}>
                {citizenData.iotSensor.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {citizenData.iotSensor.sensorId}
                </div>
                <div className="text-sm text-blue-700">Sensor ID</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {citizenData.iotSensor.currentWeight} kg
                </div>
                <div className="text-sm text-orange-700">Current Weight</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className={`text-xl font-bold flex items-center justify-center ${getBatteryColor(citizenData.iotSensor.batteryLevel)}`}>
                  <Battery className="h-5 w-5 mr-1" />
                  {citizenData.iotSensor.batteryLevel}%
                </div>
                <div className="text-sm text-green-700">Battery Level</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className={`text-lg font-semibold flex items-center justify-center ${getStatusColor(citizenData.iotSensor.status)}`}>
                  {citizenData.iotSensor.status === 'active' ? (
                    <Wifi className="h-5 w-5 mr-1" />
                  ) : (
                    <WifiOff className="h-5 w-5 mr-1" />
                  )}
                  {citizenData.iotSensor.status.charAt(0).toUpperCase() + citizenData.iotSensor.status.slice(1)}
                </div>
                <div className="text-sm text-purple-700">Connection Status</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Last Reading:</span>
                <span className="text-muted-foreground">
                  {new Date(citizenData.iotSensor.lastReading).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Details */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span>Scan Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">QR Code:</span>
              <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">{citizenData.qrCode}</code>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <span className="ml-2">{new Date(citizenData.lastUpdated).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button onClick={fetchCitizenData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button 
              onClick={() => setShowWasteEntry(!showWasteEntry)} 
              variant="default" 
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showWasteEntry ? 'Cancel' : 'Add IoT Waste Entry'}
            </Button>
          </div>

          {showWasteEntry && (
            <Card className="mt-4 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">IoT Waste Entry</CardTitle>
                <p className="text-sm text-green-600">Record waste collection for {citizenData.citizen.name} - House ID: {citizenData.houseId}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waste-type">Waste Type</Label>
                    <Select value={wasteData.type} onValueChange={(value) => setWasteData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organic">Organic</SelectItem>
                        <SelectItem value="plastic">Plastic</SelectItem>
                        <SelectItem value="paper">Paper</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="glass">Glass</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="waste-weight">Weight (kg)</Label>
                    <Input
                      id="waste-weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Enter weight"
                      value={wasteData.weight}
                      onChange={(e) => setWasteData(prev => ({ ...prev, weight: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="waste-description">Description (Optional)</Label>
                  <Textarea
                    id="waste-description"
                    placeholder="Additional notes about the waste collection..."
                    value={wasteData.description}
                    onChange={(e) => setWasteData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Citizen:</strong> {citizenData.citizen.name}<br/>
                    <strong>House ID:</strong> {citizenData.houseId}<br/>
                    <strong>IoT Sensor:</strong> {citizenData.iotSensor?.sensorId || 'N/A'}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleWasteSubmit} 
                    disabled={submittingWaste || !wasteData.type || !wasteData.weight}
                    className="flex-1"
                  >
                    {submittingWaste ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {submittingWaste ? 'Recording...' : 'Record Waste Collection'}
                  </Button>
                  <Button 
                    onClick={() => setShowWasteEntry(false)} 
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};