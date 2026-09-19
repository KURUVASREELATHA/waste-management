import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  CheckCircle, 
  Clock, 
  X, 
  Mail, 
  Phone, 
  MapPin,
  RefreshCw,
  Calendar,
  MessageSquare
} from "lucide-react";

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
  recyclingCenterDetails?: {
    name: string;
    centerName: string;
    email: string;
    phone: string;
    address: string;
    wasteTypesProcessed: string[];
  };
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  sentAt: string;
  respondedAt?: string;
  createdAt: string;
}

export const SentInvitations = () => {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/invitations/sent');
      setInvitations(response || []);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load sent invitations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  const cancelInvitation = async (invitationId: string) => {
    try {
      await api.delete(`/invitations/${invitationId}`);
      toast({
        title: "Success",
        description: "Invitation cancelled successfully"
      });
      fetchInvitations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading sent invitations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <span>Sent Invitations</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track invitations sent to recycling centers
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInvitations}
            disabled={loading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No invitations sent yet
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              // Use stored details if available, otherwise fall back to populated data
              const centerDetails = invitation.recyclingCenterDetails || invitation.recyclingCenterId;
              
              return (
                <Card key={invitation._id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* Header with status */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-lg">{centerDetails.name}</h4>
                          {getStatusIcon(invitation.status)}
                          <Badge className={getStatusColor(invitation.status)}>
                            {invitation.status}
                          </Badge>
                        </div>
                        {invitation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelInvitation(invitation._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>

                      {/* Center Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 text-sm">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Center:</span>
                            <span>{centerDetails.centerName || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Email:</span>
                            <span>{centerDetails.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Phone:</span>
                            <span>{centerDetails.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Address:</span>
                              <p className="text-muted-foreground">{centerDetails.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Waste Types */}
                      {centerDetails.wasteTypesProcessed && centerDetails.wasteTypesProcessed.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Waste Types Processed:</p>
                          <div className="flex flex-wrap gap-1">
                            {centerDetails.wasteTypesProcessed.map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <div className="p-3 bg-muted/50 rounded">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium mb-1">Invitation Message:</p>
                            <p className="text-sm text-muted-foreground">{invitation.message}</p>
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="flex justify-between items-center text-xs text-muted-foreground border-t pt-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Sent: {new Date(invitation.sentAt).toLocaleString()}</span>
                        </div>
                        {invitation.respondedAt && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Responded: {new Date(invitation.respondedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};