import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, CreditCard, MessageSquare, Calendar, Eye, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Penalty {
  _id: string;
  violationType: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid' | 'disputed' | 'waived';
  createdAt: string;
  dueDate: string;
  evidenceImage?: string;
  location?: string;
  issuedBy: {
    name: string;
    workerId: string;
  };
  paymentDate?: string;
  disputeReason?: string;
  disputeResolution?: string;
}

export const CitizenPenalties = () => {
  const { toast } = useToast();
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [disputeReason, setDisputeReason] = useState("");

  const fetchPenalties = async () => {
    try {
      const response = await api.get('/penalties/my-penalties');
      console.log('Fetched penalties:', response);
      setPenalties(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to fetch penalties:', error);
      // Show user-friendly error message
      toast({
        title: "Failed to Load Penalties",
        description: "Could not fetch your penalties. Please try again later.",
        variant: "destructive",
      });
      setPenalties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPenalties();
  }, []);

  const handlePayPenalty = async (penaltyId: string, amount: number) => {
    try {
      await api.patch(`/penalties/${penaltyId}/pay`, {
        paymentMethod: 'UPI',
        paymentReference: `PAY${Date.now()}`
      });
      
      toast({
        title: "Payment Successful",
        description: `Penalty of ₹${amount} has been paid successfully.`,
      });
      
      fetchPenalties();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDispute = async (penaltyId: string) => {
    if (!disputeReason.trim()) {
      toast({
        title: "Dispute Reason Required",
        description: "Please provide a reason for disputing this penalty.",
        variant: "destructive",
      });
      return;
    }

    try {
      await api.patch(`/penalties/${penaltyId}/dispute`, {
        disputeReason: disputeReason.trim()
      });
      
      toast({
        title: "Dispute Submitted",
        description: "Your dispute has been submitted for review.",
      });
      
      setDisputeReason("");
      fetchPenalties();
    } catch (error) {
      toast({
        title: "Dispute Failed",
        description: "Failed to submit dispute. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-blue-100 text-blue-800';
      case 'waived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getViolationLabel = (type: string) => {
    const labels = {
      'improper_segregation': 'Improper Segregation',
      'mixed_waste': 'Mixed Waste',
      'hazardous_disposal': 'Hazardous Disposal',
      'overweight': 'Overweight Waste',
      'no_segregation': 'No Segregation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const totalPending = penalties.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = penalties.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <p className="text-center text-muted-foreground">Loading penalties...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Penalties</p>
                <p className="text-2xl font-bold text-orange-600">₹{totalPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">₹{totalPaid}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Penalties</p>
                <p className="text-2xl font-bold text-blue-600">{penalties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>Waste Segregation Penalties</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {penalties.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No penalties issued. Keep up the good waste segregation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {penalties.map((penalty) => (
                <div key={penalty._id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{getViolationLabel(penalty.violationType)}</h4>
                        <Badge className={getStatusColor(penalty.status)}>
                          {penalty.status.charAt(0).toUpperCase() + penalty.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{penalty.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Amount: </span>
                          <span className="text-red-600 font-bold">₹{penalty.amount}</span>
                        </div>
                        <div>
                          <span className="font-medium">Issued by: </span>
                          <span>{penalty.issuedBy.name} ({penalty.issuedBy.workerId})</span>
                        </div>
                        <div>
                          <span className="font-medium">Date: </span>
                          <span>{new Date(penalty.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Due Date: </span>
                          <span className={new Date(penalty.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {new Date(penalty.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        {penalty.location && (
                          <div className="col-span-2">
                            <span className="font-medium">Location: </span>
                            <span>{penalty.location}</span>
                          </div>
                        )}
                      </div>

                      {penalty.status === 'paid' && penalty.paymentDate && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm text-green-800">
                            ✅ Paid on {new Date(penalty.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {penalty.status === 'disputed' && (
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-sm text-blue-800">
                            🔍 Dispute submitted: {penalty.disputeReason}
                          </p>
                          {penalty.disputeResolution && (
                            <p className="text-sm text-blue-700 mt-1">
                              Resolution: {penalty.disputeResolution}
                            </p>
                          )}
                        </div>
                      )}

                      {penalty.status === 'waived' && (
                        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                          <p className="text-sm text-gray-800">
                            ✅ Penalty waived by municipality
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {penalty.evidenceImage && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Evidence
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Evidence Photo</DialogTitle>
                            </DialogHeader>
                            <img 
                              src={`http://localhost:3001/uploads/${penalty.evidenceImage}`}
                              alt="Penalty evidence"
                              className="w-full h-auto rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      )}

                      {penalty.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            onClick={() => handlePayPenalty(penalty._id, penalty.amount)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <IndianRupee className="h-4 w-4 mr-1" />
                            Pay ₹{penalty.amount}
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Dispute
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Dispute Penalty</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Explain why you believe this penalty was issued incorrectly:
                                  </p>
                                  <Textarea
                                    placeholder="Enter your dispute reason..."
                                    value={disputeReason}
                                    onChange={(e) => setDisputeReason(e.target.value)}
                                    rows={4}
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={() => handleDispute(penalty._id)}
                                    disabled={!disputeReason.trim()}
                                  >
                                    Submit Dispute
                                  </Button>
                                  <DialogTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogTrigger>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};