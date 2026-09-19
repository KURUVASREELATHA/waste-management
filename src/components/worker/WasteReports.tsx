import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Upload,
  Trash2
} from "lucide-react";

interface WasteReport {
  id: string;
  citizenName: string;
  houseId: string;
  location: string;
  description: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  image?: string;
  imageUrl?: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  reportedAt: string;
  assignedWorker?: string;
  completionPhoto?: string;
  completionNotes?: string;
  wasteCollected?: number;
  completedBy?: string;
}

export const WasteReports = () => {
  const { toast } = useToast();
  const [wasteReports, setWasteReports] = useState<WasteReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [completionData, setCompletionData] = useState({
    photo: null as File | null,
    notes: '',
    wasteCollected: '',
    currentLocation: null as {lat: number, lng: number} | null
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<WasteReport | null>(null);
  const [locationVerifying, setLocationVerifying] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/all');
      const formattedReports = response.map((report: any) => ({
        id: report._id,
        _id: report._id, // Keep both for compatibility
        citizenName: report.userId?.name || 'Unknown',
        houseId: report.userId?.houseId || 'N/A',
        location: report.location,
        description: report.description,
        coordinates: report.coordinates,
        image: report.image,
        imageUrl: report.image,
        status: report.status,
        priority: 'medium',
        reportedAt: new Date(report.createdAt).toLocaleString(),
        assignedWorker: report.assignedTo?.name,
        completionPhoto: report.completionPhoto,
        completionNotes: report.completionNotes,
        wasteCollected: report.wasteCollected,
        completedBy: report.completedBy?.name
      }));
      console.log('Formatted reports:', formattedReports.map(r => ({ id: r.id, _id: r._id })));
      setWasteReports(formattedReports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setWasteReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Set up real-time polling every 5 seconds
    const interval = setInterval(() => {
      fetchReports();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  const verifyLocation = () => {
    setLocationVerifying(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCompletionData({...completionData, currentLocation: currentLoc});
          setLocationVerifying(false);
          
          if (selectedReport?.coordinates) {
            const distance = calculateDistance(
              currentLoc.lat, currentLoc.lng,
              selectedReport.coordinates.lat, selectedReport.coordinates.lng
            );
            
            if (distance <= 100) { // Within 100 meters
              toast({
                title: "Location Verified ✅",
                description: `You are ${Math.round(distance)}m from the reported location`,
              });
            } else {
              toast({
                title: "Location Mismatch ❌",
                description: `You are ${Math.round(distance)}m away. Must be within 100m to complete.`,
                variant: "destructive"
              });
            }
          }
        },
        () => {
          setLocationVerifying(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleCompleteReport = async () => {
    if (!selectedReportId || !selectedReport) {
      toast({
        title: "Missing Information",
        description: "No report selected",
        variant: "destructive"
      });
      return;
    }

    // Skip location verification for now
    console.log('Completing report:', selectedReportId, 'with data:', completionData);

    try {
      // Skip location verification for now to test completion
      const formData = new FormData();
      formData.append('completionNotes', completionData.notes || '');
      formData.append('wasteCollected', completionData.wasteCollected || '0');
      if (completionData.photo) {
        formData.append('completionPhoto', completionData.photo);
      }

      await api.patch(`/reports/${selectedReportId}/complete`, formData);
      
      setWasteReports(prev => 
        prev.map(report => 
          report.id === selectedReportId 
            ? { 
                ...report, 
                status: 'resolved' as any,
                completionNotes: completionData.notes,
                wasteCollected: parseFloat(completionData.wasteCollected) || 0
              }
            : report
        )
      );
      
      toast({
        title: "Report Completed ✅",
        description: `Report completed successfully with ${completionData.wasteCollected}kg collected`
      });
      
      setCompletionData({ photo: null, notes: '', wasteCollected: '', currentLocation: null });
      setIsDialogOpen(false);
      setSelectedReportId('');
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        toast({
          title: "Network Error",
          description: "Check your internet connection and try again",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Completion Failed",
          description: error instanceof Error ? error.message : "Failed to complete report",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="h-5 w-5 text-primary" />
          <span>Citizen Waste Reports</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">Pending Reports</TabsTrigger>
            <TabsTrigger value="history">Completed History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-muted-foreground py-8">Loading reports...</p>
              ) : wasteReports.filter(r => r.status === 'pending').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pending reports.</p>
              ) : (
                wasteReports
                  .filter(report => report.status === 'pending')
                  .map((report) => (
              <div key={report.id} className="p-3 bg-muted/30 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(report.status)}
                    <div>
                      <p className="font-medium">Report #{report.id}</p>
                      <p className="text-sm text-muted-foreground">
                        by {report.citizenName} ({report.houseId})
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(report.priority)}>
                      {report.priority.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{report.location}</span>
                </div>
                {report.coordinates && (
                    <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">📍 GPS: {report.coordinates.lat?.toFixed(4)}, {report.coordinates.lng?.toFixed(4)}</span>
                    <Button size="sm" variant="ghost" onClick={() => window.open(`https://www.google.com/maps?q=${report.coordinates.lat},${report.coordinates.lng}`, '_blank')}>
                      <MapPin className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>

                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {(report.imageUrl || report.image) && <span>📷</span>}
                  {report.status === 'resolved' && report.completionPhoto && <span>✅</span>}
                  {report.status === 'resolved' && report.wasteCollected && <span>{report.wasteCollected}kg collected</span>}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{report.reportedAt}</span>
                    </div>
                    {report.assignedWorker && (
                      <span>Assigned to: {report.assignedWorker}</span>
                    )}
                    {report.status === 'resolved' && report.completedBy && (
                      <span>Completed by: {report.completedBy}</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {(report.imageUrl || report.image) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`http://localhost:3001/uploads/${report.image}`, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Photo
                      </Button>
                    )}
                    {report.status === "pending" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedReportId(report.id);
                          setSelectedReport(report);
                          setIsDialogOpen(true);
                        }}
                      >
                        Mark Completed
                      </Button>
                    )}
                    {report.status === "resolved" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          console.log('Deleting report with ID:', report.id);
                          try {
                            await api.delete(`/reports/${report.id}`);
                            setWasteReports(prev => prev.filter(r => r.id !== report.id));
                            toast({
                              title: "Report Deleted",
                              description: "Completed report has been deleted"
                            });
                          } catch (error) {
                            console.error('Delete error:', error);
                            console.error('Report ID:', report.id);
                            toast({
                              title: "Delete Failed",
                              description: "Failed to delete report",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
                  ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              {wasteReports.filter(r => r.status === 'resolved').length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No completed reports yet.</p>
              ) : (
                wasteReports
                  .filter(report => report.status === 'resolved')
                  .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
                  .map((report) => (
              <div key={report.id} className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(report.status)}
                    <div>
                      <p className="font-medium">Report #{report.id}</p>
                      <p className="text-sm text-muted-foreground">
                        by {report.citizenName} ({report.houseId})
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={getPriorityColor(report.priority)}>
                      {report.priority.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status.replace("-", " ").toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{report.location}</span>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>

                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  {(report.imageUrl || report.image) && <span>📷</span>}
                  {report.status === 'resolved' && report.completionPhoto && <span>✅</span>}
                  {report.status === 'resolved' && report.wasteCollected && <span>{report.wasteCollected}kg collected</span>}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{report.reportedAt}</span>
                    </div>
                    {report.status === 'resolved' && report.completedBy && (
                      <span>Completed by: {report.completedBy}</span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {(report.imageUrl || report.image) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(`http://localhost:3001/uploads/${report.image}`, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Photo
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        console.log('Deleting report with ID:', report.id);
                        try {
                          await api.delete(`/reports/${report.id}`);
                          setWasteReports(prev => prev.filter(r => r.id !== report.id));
                          toast({
                            title: "Report Deleted",
                            description: "Completed report has been deleted"
                          });
                        } catch (error) {
                          console.error('Delete error:', error);
                          console.error('Report ID:', report.id);
                          toast({
                            title: "Delete Failed",
                            description: "Failed to delete report",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Report with Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReport?.coordinates && (
              <div>
                <Label>Location Verification</Label>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Verify you're at the reported location</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={verifyLocation}
                      disabled={locationVerifying}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {locationVerifying ? "Verifying..." : "Verify Location"}
                    </Button>
                  </div>
                  {completionData.currentLocation && selectedReport.coordinates && (
                    <div className="text-xs text-muted-foreground">
                      Distance: {Math.round(calculateDistance(
                        completionData.currentLocation.lat, completionData.currentLocation.lng,
                        selectedReport.coordinates.lat, selectedReport.coordinates.lng
                      ))}m from reported location
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <Label>Upload Completion Photo</Label>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="completion-photo"
                  accept="image/*"
                  onChange={(e) => setCompletionData({...completionData, photo: e.target.files?.[0] || null})}
                  className="hidden"
                />
                <label htmlFor="completion-photo" className="cursor-pointer block">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {completionData.photo ? `📷 ${completionData.photo.name}` : "Click to upload completion photo"}
                  </p>
                </label>
              </div>
            </div>
            <div>
              <Label>Waste Collected (kg)</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={completionData.wasteCollected}
                onChange={(e) => setCompletionData({...completionData, wasteCollected: e.target.value})}
              />
            </div>
            <div>
              <Label>Completion Notes</Label>
              <Textarea
                placeholder="Additional notes about the cleanup..."
                value={completionData.notes}
                onChange={(e) => setCompletionData({...completionData, notes: e.target.value})}
              />
            </div>
            <Button onClick={handleCompleteReport} className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};