import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Package, Calendar, Building, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface SoldWaste {
  _id: string;
  wasteType: string;
  weight: number;
  pricePerKg: number;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  verificationCode?: string;
  recyclerId: {
    name: string;
    centerName?: string;
  };
  createdAt: string;
  paidAt?: string;
}

export const SoldHistory = () => {
  const [soldWastes, setSoldWastes] = useState<SoldWaste[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSoldHistory();
  }, []);

  const fetchSoldHistory = async () => {
    try {
      // Get municipality ID from auth context
      const municipalityId = localStorage.getItem('userId');
      const response = await api.get(`/waste-sales/municipality/${municipalityId}/history`);
      setSoldWastes(response || []);
    } catch (error) {
      console.error('Failed to fetch sold history:', error);
      toast({ title: "Failed to load sold history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyVerificationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Verification code copied to clipboard" });
  };

  const deleteSoldWaste = async (wasteId: string) => {
    try {
      await api.delete(`/waste-sales/${wasteId}`);
      setSoldWastes(prev => prev.filter(w => w._id !== wasteId));
      toast({
        title: "Record Deleted",
        description: "Sold waste record has been deleted successfully"
      });
    } catch (error) {
      console.error('Failed to delete sold waste:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete sold waste record",
        variant: "destructive"
      });
    }
  };

  const cancelSoldWaste = async (wasteId: string) => {
    try {
      await api.patch(`/waste-sales/${wasteId}/cancel`);
      setSoldWastes(prev => prev.map(w => 
        w._id === wasteId ? { ...w, status: 'cancelled' } : w
      ));
      toast({
        title: "Sale Cancelled",
        description: "Waste sale has been cancelled successfully"
      });
    } catch (error) {
      console.error('Failed to cancel sold waste:', error);
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel waste sale",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'paid') {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (status === 'accepted') {
      return <Badge className="bg-blue-100 text-blue-800">Payment Pending</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading sold history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>Sold Waste History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {soldWastes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No sold waste records found
          </div>
        ) : (
          <div className="space-y-4">
            {soldWastes.map((waste) => (
              <div key={waste._id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{waste.wasteType} Waste</h4>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {waste.recyclerId.centerName || waste.recyclerId.name}
                    </p>
                  </div>
                  {getStatusBadge(waste.status, waste.paymentStatus)}
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Weight</p>
                    <p className="font-bold">{waste.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rate</p>
                    <p className="font-bold">₹{waste.pricePerKg}/kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-green-600">₹{waste.totalAmount}</p>
                  </div>
                </div>

                {waste.verificationCode && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Verification Code
                        </p>
                        <p className="text-lg font-mono font-bold text-yellow-900">
                          {waste.verificationCode}
                        </p>
                        <p className="text-xs text-yellow-700">
                          Share this code with the recycling center for payment
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyVerificationCode(waste.verificationCode!)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Sold: {new Date(waste.createdAt).toLocaleDateString()}
                    </span>
                    {waste.paidAt && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Paid: {new Date(waste.paidAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {(waste.paymentStatus === 'paid' || waste.status === 'completed') && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteSoldWaste(waste._id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel this sale?')) {
                          cancelSoldWaste(waste._id);
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};