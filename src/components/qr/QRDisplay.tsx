import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, RefreshCw, Wifi, WifiOff, Battery } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface QRDisplayProps {
  onGenerate?: () => void;
}

export const QRDisplay = ({ onGenerate }: QRDisplayProps) => {
  const { toast } = useToast();
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await api.post('/qrcode/generate');
      setQrData(response);
      
      // Generate QR code with just the code for Google Lens
      const qrValue = response.qrCode;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`;
      setQrCodeUrl(qrUrl);
      
      toast({
        title: "QR Code Generated!",
        description: "Your QR code is ready for scanning with Google Lens",
      });
      
      onGenerate?.();
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.response?.data?.message || "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchQRCode = async () => {
    try {
      const response = await api.get('/qrcode/my-qr');
      setQrData(response);
      
      const qrValue = response.qrCode;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrValue)}`;
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.log('No QR code found');
    }
  };

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `wastewise-qr-${qrData?.houseId || 'code'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "QR Code Downloaded",
        description: "QR code saved to your device",
      });
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

  useEffect(() => {
    fetchQRCode();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span>My QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!qrData ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">Generate your QR code for waste collection verification</p>
              <Button onClick={generateQRCode} disabled={loading} variant="hero">
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Code Display */}
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg border-2 border-gray-200">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Scan with Google Lens or any QR scanner
                </p>
              </div>

              {/* Citizen Details */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Citizen Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {qrData.citizenName}
                  </div>
                  <div>
                    <span className="font-medium">House ID:</span> {qrData.houseId}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {qrData.citizenEmail}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {qrData.citizenPhone || 'Not provided'}
                  </div>
                </div>
                {qrData.citizenAddress && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Address:</span> {qrData.citizenAddress}
                  </div>
                )}
              </div>

              {/* Waste Collection Stats */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Waste Collection Data</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Total Collected:</span> {qrData.totalWasteCollected || 0} kg
                  </div>
                  <div>
                    <span className="font-medium">Last Collection:</span> {
                      qrData.lastCollectionDate 
                        ? new Date(qrData.lastCollectionDate).toLocaleDateString()
                        : 'No collections yet'
                    }
                  </div>
                </div>
              </div>

              {/* IoT Sensor Data */}
              {qrData.iotData && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2 flex items-center">
                    <Wifi className="h-4 w-4 mr-1" />
                    IoT Sensor Status
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Sensor ID:</span> {qrData.iotData.sensorId}
                    </div>
                    <div>
                      <span className="font-medium">Current Weight:</span> {qrData.iotData.currentWeight} kg
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Battery:</span>
                      <Battery className={`h-4 w-4 mr-1 ${getBatteryColor(qrData.iotData.batteryLevel)}`} />
                      <span className={getBatteryColor(qrData.iotData.batteryLevel)}>
                        {qrData.iotData.batteryLevel}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-1">Status:</span>
                      {qrData.iotData.status === 'active' ? (
                        <Wifi className={`h-4 w-4 mr-1 ${getStatusColor(qrData.iotData.status)}`} />
                      ) : (
                        <WifiOff className={`h-4 w-4 mr-1 ${getStatusColor(qrData.iotData.status)}`} />
                      )}
                      <span className={getStatusColor(qrData.iotData.status)}>
                        {qrData.iotData.status.charAt(0).toUpperCase() + qrData.iotData.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-700">
                    Last Reading: {new Date(qrData.iotData.lastReading).toLocaleString()}
                  </div>
                </div>
              )}

              {/* QR Code Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">QR Code Information</h3>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">QR Code:</span> 
                    <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">{qrData.qrCode}</code>
                  </div>
                  <div>
                    <span className="font-medium">Scan URL:</span> 
                    <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs break-all">
                      http://localhost:5173/scan/{qrData.qrCode}
                    </code>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    ✅ Compatible with Google Lens, Camera apps, and QR scanners
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
                <Button onClick={fetchQRCode} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};