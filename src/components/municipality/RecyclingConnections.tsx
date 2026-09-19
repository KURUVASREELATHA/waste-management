import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import dataPersistence from "@/lib/dataPersistence";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Building, Send, CheckCircle, Clock, X, Mail, RefreshCw } from "lucide-react";

interface RecyclingCenter {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  centerName: string;
  wasteTypesProcessed?: string[];
  createdAt: string;
}

interface Invitation {
  _id: string;
  municipalityId: string;
  recyclingCenterId: RecyclingCenter;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  sentAt: string;
  respondedAt?: string;
}

export const RecyclingConnections = () => {
  const { toast } = useToast();
  const [availableCenters, setAvailableCenters] = useState<RecyclingCenter[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingInvitation, setSendingInvitation] = useState<string | null>(null);
  const [invitationMessage, setInvitationMessage] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(null);

  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh to catch new centers
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    
    // Refresh when window gains focus
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Try to load from cache first
      const cachedCenters = dataPersistence.retrieveWithExpiry('recyclingCenters') || [];
      const cachedInvitations = dataPersistence.getSentInvitations();
      
      if (cachedCenters.length > 0) {
        setAvailableCenters(cachedCenters);
      }
      if (cachedInvitations.length > 0) {
        setSentInvitations(cachedInvitations);
      }
      
      // Fetch fresh data from API
      const [centersResponse, invitationsResponse] = await Promise.all([
        api.get('/invitations/available-centers'),
        api.get('/invitations/sent')
      ]);
      
      const centers = centersResponse || [];
      const invitations = invitationsResponse || [];
      
      setAvailableCenters(centers);
      setSentInvitations(invitations);
      
      // Store in cache with shorter expiry for frequent updates
      dataPersistence.storeWithExpiry('recyclingCenters', centers, 5); // 5 minutes expiry
      dataPersistence.storeSentInvitations(invitations);
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      
      // Use cached data if API fails
      const cachedCenters = dataPersistence.retrieveWithExpiry('recyclingCenters') || [];
      const cachedInvitations = dataPersistence.getSentInvitations();
      
      if (cachedCenters.length > 0 || cachedInvitations.length > 0) {
        setAvailableCenters(cachedCenters);
        setSentInvitations(cachedInvitations);
        toast({
          title: "Offline Mode",
          description: "Showing cached data. Some information may be outdated.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load recycling centers data",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (centerId: string) => {
    if (!invitationMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message for the invitation",
        variant: "destructive"
      });
      return;
    }

    const invitationData = {
      recyclingCenterId: centerId,
      message: invitationMessage
    };

    try {
      setSendingInvitation(centerId);
      
      // Try to send immediately
      await api.post('/invitations/send', invitationData);

      toast({
        title: "Invitation Sent",
        description: "Invitation has been sent successfully"
      });

      setInvitationMessage("");
      setSelectedCenter(null);
      fetchData(); // Refresh data
      
    } catch (error: any) {
      // Store for offline sync if network fails
      dataPersistence.storeInvitationSend(invitationData);
      
      // Create optimistic update
      const center = availableCenters.find(c => c._id === centerId);
      if (center) {
        const newInvitation = {
          _id: 'temp_' + Date.now(),
          municipalityId: 'current_user',
          recyclingCenterId: center,
          status: 'pending' as const,
          message: invitationMessage,
          sentAt: new Date().toISOString()
        };
        
        setSentInvitations(prev => [newInvitation, ...prev]);
        dataPersistence.storeSentInvitations([newInvitation, ...sentInvitations]);
      }
      
      toast({
        title: "Invitation Queued",
        description: "Invitation will be sent when connection is restored",
        variant: "default"
      });
      
      setInvitationMessage("");
      setSelectedCenter(null);
    } finally {
      setSendingInvitation(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isInvitationSent = (centerId: string) => {
    return sentInvitations.some(inv => 
      inv.recyclingCenterId._id === centerId && inv.status === 'pending'
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading recycling connections...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <span>Recycling Connections</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Connect with recycling centers and manage partnerships
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="available" className="space-y-4">
            <TabsList>
              <TabsTrigger value="available">Available Centers ({availableCenters.length})</TabsTrigger>
              <TabsTrigger value="invitations">Sent Invitations ({sentInvitations.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {availableCenters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recycling centers available at the moment
                </div>
              ) : (
                <div className="grid gap-4">
                  {availableCenters.map((center) => (
                    <Card key={center._id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{center.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {center.centerName}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p><Mail className="inline h-3 w-3 mr-1" />{center.email}</p>
                              <p>📞 {center.phone}</p>
                              <p>📍 {center.address}</p>
                              <p className="text-xs text-muted-foreground">
                                Registered: {new Date(center.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {center.wasteTypesProcessed && center.wasteTypesProcessed.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium mb-1">Waste Types:</p>
                                <div className="flex flex-wrap gap-1">
                                  {center.wasteTypesProcessed.map((type) => (
                                    <Badge key={type} variant="secondary" className="text-xs">
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {isInvitationSent(center._id) ? (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Invitation Sent
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => setSelectedCenter(center)}
                                disabled={sendingInvitation === center._id}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Send Invitation
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invitations" className="space-y-4">
              {sentInvitations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No invitations sent yet
                </div>
              ) : (
                <div className="grid gap-4">
                  {sentInvitations.map((invitation) => (
                    <Card key={invitation._id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold">{invitation.recyclingCenterId.name}</h4>
                              {getStatusIcon(invitation.status)}
                              <Badge className={getStatusColor(invitation.status)}>
                                {invitation.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {invitation.recyclingCenterId.centerName}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p><Mail className="inline h-3 w-3 mr-1" />{invitation.recyclingCenterId.email}</p>
                              <p>📞 {invitation.recyclingCenterId.phone}</p>
                            </div>
                            <div className="mt-3 p-3 bg-muted/50 rounded">
                              <p className="text-sm font-medium mb-1">Message:</p>
                              <p className="text-sm">{invitation.message}</p>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <p>Sent: {new Date(invitation.sentAt).toLocaleString()}</p>
                              {invitation.respondedAt && (
                                <p>Responded: {new Date(invitation.respondedAt).toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Send Invitation Modal */}
      {selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Send Invitation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Invite {selectedCenter.name} to partner with your municipality
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Recycling Center</label>
                <Input value={selectedCenter.name} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Enter your invitation message..."
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => sendInvitation(selectedCenter._id)}
                  disabled={sendingInvitation === selectedCenter._id}
                  className="flex-1"
                >
                  {sendingInvitation === selectedCenter._id ? "Sending..." : "Send Invitation"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCenter(null);
                    setInvitationMessage("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};