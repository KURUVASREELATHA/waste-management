import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Package, CheckCircle, X, Clock, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PendingWaste {
  id: string;
  workerName: string;
  wasteType: string;
  quantity: number;
  pricePerKg: number;
  totalAmount: number;
  submittedAt: string;
  notes?: string;
  status: "pending" | "confirmed" | "rejected";
}

export const WasteConfirmation = () => {
  const { toast } = useToast();
  const [pendingWastes, setPendingWastes] = useState<PendingWaste[]>([]);

  useEffect(() => {
    fetchPendingWastes();
  }, []);

  const fetchPendingWastes = async () => {
    try {
      // This should use the actual recycling center ID from auth context
      const centerId = "65a1b2c3d4e5f6789abcdef1";
      const response = await fetch(`http://localhost:5000/api/waste-sales/center/${centerId}/pending`);
      const data = await response.json();
      setPendingWastes(data.map((waste: any) => ({
        id: waste._id,
        workerName: waste.workerId.name,
        wasteType: waste.wasteType.charAt(0).toUpperCase() + waste.wasteType.slice(1),
        quantity: waste.quantity,
        pricePerKg: waste.pricePerKg,
        totalAmount: waste.totalAmount,
        submittedAt: waste.createdAt,
        notes: waste.notes,
        status: waste.status
      })));
    } catch (error) {
      console.error('Failed to fetch pending wastes:', error);
    }
  };

  const [rejectionNotes, setRejectionNotes] = useState<{ [key: string]: string }>({});

  const handleConfirm = async (wasteId: string) => {
    try {
      await fetch(`http://localhost:5000/api/waste-sales/${wasteId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'confirmed' })
      });
      
      const waste = pendingWastes.find(w => w.id === wasteId);
      setPendingWastes(prev => prev.filter(w => w.id !== wasteId));
      
      toast({
        title: "Waste Confirmed",
        description: `${waste?.quantity}kg of ${waste?.wasteType} confirmed for ₹${waste?.totalAmount}`,
      });
    } catch (error) {
      toast({
        title: "Confirmation Failed",
        description: "Failed to confirm waste",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (wasteId: string) => {
    const notes = rejectionNotes[wasteId];
    if (!notes?.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/waste-sales/${wasteId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejectionReason: notes })
      });
      
      setPendingWastes(prev => prev.filter(w => w.id !== wasteId));
      
      toast({
        title: "Waste Rejected",
        description: "Worker has been notified of the rejection",
      });
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: "Failed to reject waste",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/20 text-success";
      case "pending":
        return "bg-warning/20 text-warning";
      case "rejected":
        return "bg-error/20 text-error";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <X className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const pendingCount = pendingWastes.filter(w => w.status === "pending").length;
  const confirmedCount = pendingWastes.filter(w => w.status === "confirmed").length;
  const totalValue = pendingWastes.filter(w => w.status === "confirmed").reduce((sum, w) => sum + w.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Confirmations</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed Today</p>
                <p className="text-2xl font-bold">{confirmedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">₹{totalValue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Waste Confirmation Queue</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingWastes.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No pending waste confirmations. Waste submissions will appear here when workers sell to your center.</div>
            ) : (
              pendingWastes.map((waste) => (
              <div key={waste.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{waste.workerName}</p>
                      <p className="text-sm text-muted-foreground">Sale #{waste.id}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(waste.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(waste.status)}
                      <span>{waste.status.charAt(0).toUpperCase() + waste.status.slice(1)}</span>
                    </div>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Waste Type</p>
                    <p className="font-medium">{waste.wasteType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-medium">{waste.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rate</p>
                    <p className="font-medium">₹{waste.pricePerKg}/kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Amount</p>
                    <p className="font-medium text-lg">₹{waste.totalAmount}</p>
                  </div>
                </div>

                {waste.notes && (
                  <div className="mb-4 p-3 bg-muted/50 rounded">
                    <p className="text-sm font-medium mb-1">Worker Notes:</p>
                    <p className="text-sm text-muted-foreground">{waste.notes}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-4">
                  <Calendar className="h-3 w-3" />
                  <span>Submitted: {new Date(waste.submittedAt).toLocaleString()}</span>
                </div>

                {waste.status === "pending" && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Rejection reason (required if rejecting)..."
                      value={rejectionNotes[waste.id] || ""}
                      onChange={(e) => setRejectionNotes(prev => ({ ...prev, [waste.id]: e.target.value }))}
                      className="min-h-[60px]"
                    />
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleConfirm(waste.id)}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm & Accept
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleReject(waste.id)}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {waste.status === "confirmed" && (
                  <div className="p-3 bg-success/10 rounded border border-success/20">
                    <p className="text-sm font-medium text-success">✓ Confirmed and processed</p>
                  </div>
                )}

                {waste.status === "rejected" && (
                  <div className="p-3 bg-error/10 rounded border border-error/20">
                    <p className="text-sm font-medium text-error">✗ Rejected</p>
                    {rejectionNotes[waste.id] && (
                      <p className="text-sm text-muted-foreground mt-1">Reason: {rejectionNotes[waste.id]}</p>
                    )}
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};