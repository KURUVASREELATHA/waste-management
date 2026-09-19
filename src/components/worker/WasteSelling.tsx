import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Scale, DollarSign, Truck, History, Package, Calendar, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WasteSelling = () => {
  const { toast } = useToast();
  const [recyclingCenters, setRecyclingCenters] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [wasteWeight, setWasteWeight] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [soldHistory, setSoldHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const filteredCenters = recyclingCenters.filter(center => 
    (center.centerName || center.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
    center.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const wasteTypes = [
    { value: "plastic", label: "Plastic Waste", price: 15 },
    { value: "paper", label: "Paper Waste", price: 8 },
    { value: "glass", label: "Glass Waste", price: 5 },
    { value: "metal", label: "Metal Waste", price: 25 },
    { value: "organic", label: "Organic Waste", price: 3 },
    { value: "mixed", label: "Mixed Waste", price: 10 }
  ];

  useEffect(() => {
    const fetchRecyclingCenters = async () => {
      try {
        const response = await api.get('/auth/users/role/recycler');
        setRecyclingCenters(response || []);
      } catch (error) {
        console.error('Failed to fetch recycling centers:', error);
        setRecyclingCenters([]);
      }
    };

    fetchRecyclingCenters();
    fetchSoldHistory();
  }, []);

  const fetchSoldHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/waste/my-sales');
      console.log('Sold history response:', response);
      setSoldHistory(response || []);
    } catch (error) {
      console.error('Failed to fetch sold history:', error);
      // Fallback to debug endpoint
      try {
        const debugResponse = await api.get('/waste/debug/sales');
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        const userSales = debugResponse.filter((sale: any) => {
          const sellerId = sale.sellerId?._id || sale.sellerId;
          return sellerId === user?.id;
        });
        
        console.log('Debug sales response:', debugResponse);
        console.log('User sales filtered:', userSales);
        setSoldHistory(userSales || []);
      } catch (debugError) {
        console.error('Debug endpoint also failed:', debugError);
        setSoldHistory([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (wasteType && wasteWeight) {
      const selectedWasteType = wasteTypes.find(w => w.value === wasteType);
      if (selectedWasteType) {
        setEstimatedPrice(parseFloat(wasteWeight) * selectedWasteType.price);
      }
    } else {
      setEstimatedPrice(0);
    }
  }, [wasteType, wasteWeight]);

  const handleSellWaste = async () => {
    if (!selectedCenter || !wasteType || !wasteWeight) {
      toast({
        title: "Missing Information",
        description: "Please select a recycling center and fill all waste details",
        variant: "destructive",
      });
      return;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      toast({
        title: "Authentication Error",
        description: "Please login again",
        variant: "destructive",
      });
      return;
    }
    
    const user = JSON.parse(userStr);

    try {
      const saleData = {
        recyclerId: selectedCenter,
        wasteType,
        weight: parseFloat(wasteWeight),
        pricePerKg: wasteTypes.find(w => w.value === wasteType)?.price || 0,
        totalAmount: estimatedPrice
      };

      const response = await api.post('/waste/sell', saleData);

      // Add the new sale to local state immediately with proper structure
      const selectedRecycler = recyclingCenters.find(c => c._id === selectedCenter);
      const newSale = {
        _id: response.sale?._id || Date.now().toString(),
        ...saleData,
        sellerId: { _id: user.id, name: user.name },
        recyclerId: { 
          _id: selectedCenter,
          centerName: selectedRecycler?.centerName || selectedRecycler?.name || 'Recycling Center'
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setSoldHistory(prev => [newSale, ...prev]);

      toast({
        title: "Sale Request Submitted!",
        description: `Submitted ${wasteWeight}kg of ${wasteType} waste for ₹${estimatedPrice.toFixed(2)}`,
      });

      // Reset form
      setSelectedCenter("");
      setWasteType("");
      setWasteWeight("");
      setEstimatedPrice(0);
      
      // Refresh sold history from server
      setTimeout(fetchSoldHistory, 1000);
    } catch (error) {
      console.error('Sale submission error:', error);
      toast({
        title: "Sale Failed",
        description: error.response?.data?.message || "Failed to submit waste sale request",
        variant: "destructive",
      });
    }
  };

  const copyVerificationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Verification code copied to clipboard" });
  };

  const deleteSoldWaste = async (wasteId: string) => {
    try {
      // Update status to cancelled instead of deleting
      await api.patch(`/waste-sales/${wasteId}/status`, { status: 'cancelled' });
      setSoldHistory(prev => prev.map(w => 
        w._id === wasteId ? { ...w, status: 'cancelled' } : w
      ));
      toast({
        title: "Sale Cancelled",
        description: "Waste sale has been cancelled and will remain in history"
      });
    } catch (error) {
      console.error('Failed to cancel sale:', error);
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel waste sale",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, paymentStatus?: string) => {
    if (paymentStatus === 'paid' || status === 'completed') {
      return <Badge className="bg-green-100 text-green-800 font-semibold">✅ Completed</Badge>;
    }
    if (status === 'accepted') {
      return <Badge className="bg-blue-100 text-blue-800">💰 Payment Pending</Badge>;
    }
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
    }
    if (status === 'rejected') {
      return <Badge className="bg-red-100 text-red-800">❌ Rejected</Badge>;
    }
    if (status === 'cancelled') {
      return <Badge className="bg-red-100 text-red-800">❌ Cancelled</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="sell" className="space-y-6" onValueChange={(value) => {
          if (value === 'history') {
            fetchSoldHistory();
          }
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sell">Sell Waste</TabsTrigger>
            <TabsTrigger value="history">Sold History</TabsTrigger>
          </TabsList>

          <TabsContent value="sell">
            {/* Waste Sale Form */}
            <Card className="card-shadow border-2 border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-lg">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-primary font-semibold">Sell Waste to Recycling Centers</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="recycling-center" className="text-sm font-semibold text-gray-700">Select Recycling Center</Label>
                    <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                        <SelectValue placeholder="Choose a recycling center" />
                      </SelectTrigger>
                      <SelectContent>
                        {recyclingCenters.map((center) => (
                          <SelectItem key={center._id} value={center._id}>
                            {center.centerName || center.name} - {center.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="waste-type" className="text-sm font-semibold text-gray-700">Waste Type</Label>
                    <Select value={wasteType} onValueChange={setWasteType}>
                      <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                        <SelectValue placeholder="Select waste type" />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} - ₹{type.price}/kg
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="weight" className="text-sm font-semibold text-gray-700">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Enter weight of waste"
                    value={wasteWeight}
                    onChange={(e) => setWasteWeight(e.target.value)}
                    step="0.1"
                    className="h-12 border-2 border-gray-200 focus:border-primary text-lg"
                  />
                </div>

                {estimatedPrice > 0 && (
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-xl font-bold text-green-800">
                        Estimated Price: ₹{estimatedPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSellWaste}
                  variant="success"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                  disabled={!selectedCenter || !wasteType || !wasteWeight}
                >
                  <Truck className="mr-3 h-5 w-5" />
                  Submit Sale Request
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            {/* Sold History Section */}
            <Card className="card-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Sold Waste History</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchSoldHistory}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading sold history...</div>
                ) : soldHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No sold waste records found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {soldHistory.map((waste) => (
                      <div key={waste._id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{waste.wasteType} Waste</h4>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <Building className="h-3 w-3 mr-1" />
                              {waste.recyclerId?.centerName || waste.recyclerId?.name || 'Recycling Center'}
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
                            {(waste.paymentStatus === 'paid' || waste.status === 'completed') ? (
                              <span className="text-xs text-green-600 font-medium">✅ Payment Received</span>
                            ) : waste.status === 'cancelled' ? (
                              <span className="text-xs text-red-600 font-medium">❌ Cancelled</span>
                            ) : waste.status === 'rejected' ? (
                              <span className="text-xs text-red-600 font-medium">❌ Rejected</span>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to cancel this sale?')) {
                                    deleteSoldWaste(waste._id);
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Pricing Information */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Current Waste Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {wasteTypes.map((type) => (
              <div key={type.value} className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="font-medium text-sm">{type.label}</p>
                <p className="text-lg font-bold text-primary">₹{type.price}/kg</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};