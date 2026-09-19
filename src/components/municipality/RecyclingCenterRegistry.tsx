import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building, MapPin, Phone, Mail, TrendingUp, Package, CheckCircle, Clock, Send } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface RecyclingCenter {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  centerName: string;
  wasteTypesProcessed: string[];
  paymentStatus: "active" | "overdue" | "suspended";
  createdAt: string;
}

export const RecyclingCenterRegistry = () => {
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteMessage, setInviteMessage] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

  useEffect(() => {
    fetchCenters();
    fetchInvitations();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/recycling-centers');
      const data = await response.json();
      console.log('Fetched centers:', data);
      setCenters(data);
    } catch (error) {
      console.error('Failed to fetch recycling centers:', error);
      toast({ title: "Failed to load recycling centers", variant: "destructive" });
    }
  };

  const fetchInvitations = async () => {
    try {
      const data = await api.get('/invitations/sent');
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const sendInvitation = async () => {
    if (!selectedCenter) return;
    
    try {
      await api.post('/invitations/send', {
        recyclingCenterId: selectedCenter,
        message: inviteMessage
      });
      toast({ title: "Invitation sent successfully" });
      setInviteMessage("");
      setSelectedCenter(null);
      fetchInvitations();
    } catch (error) {
      toast({ 
        title: "Failed to send invitation", 
        variant: "destructive" 
      });
    }
  };

  const isInvited = (centerId: string) => {
    return invitations.some(inv => 
      inv.recyclingCenterId._id === centerId && inv.status === 'pending'
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "suspended":
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleApprove = async (centerId: string) => {
    try {
      await fetch(`http://localhost:3001/api/recycling-centers/${centerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      });
      fetchCenters();
    } catch (error) {
      console.error('Failed to approve center:', error);
    }
  };

  const handleSuspend = async (centerId: string) => {
    try {
      await fetch(`http://localhost:3001/api/recycling-centers/${centerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'suspended' })
      });
      fetchCenters();
    } catch (error) {
      console.error('Failed to suspend center:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Centers</p>
                <p className="text-2xl font-bold">{centers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Centers</p>
                <p className="text-2xl font-bold">{centers.filter(c => (c.paymentStatus || 'active') === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Waste Types</p>
                <p className="text-2xl font-bold">{new Set(centers.flatMap(c => c.wasteTypesProcessed || [])).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {centers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recycling Centers Found</h3>
            <p className="text-gray-500">No recycling centers are currently registered in the system.</p>
          </div>
        ) : (
          centers.map((center) => (
          <Card key={center._id} className="card-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{center.centerName || center.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{center.name}</p>
                </div>
                <Badge className={getStatusColor(center.paymentStatus || 'active')}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(center.paymentStatus || 'active')}
                    <span>{(center.paymentStatus || 'active').charAt(0).toUpperCase() + (center.paymentStatus || 'active').slice(1)}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{center.address || 'Address not provided'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{center.phone || 'Phone not provided'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{center.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Waste Types Processed:</p>
                <div className="flex flex-wrap gap-1">
                  {(center.wasteTypesProcessed || []).map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Registered: {new Date(center.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex space-x-2">
                {(center.paymentStatus || 'active') === "active" && !isInvited(center._id) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => setSelectedCenter(center._id)}
                        className="flex-1"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Request
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Send Request to {center.centerName}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea
                            id="message"
                            placeholder="Add a message for the recycling center..."
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <Button onClick={sendInvitation} className="w-full">
                          Send Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {isInvited(center._id) && (
                  <Badge variant="outline" className="text-orange-600">
                    Request Sent
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );
};