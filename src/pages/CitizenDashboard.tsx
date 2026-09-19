import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { WasteUploadForm } from "@/components/waste/WasteUploadForm";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { VehicleMap } from "@/components/map/VehicleMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CitizenProfile } from "@/components/profile/CitizenProfile";
import { EcoShopping } from "@/components/EcoShopping";
import { CitizenPenalties } from "@/components/penalties/CitizenPenalties";

import {
  Trash2,
  TrendingUp,
  Camera,
  MapPin,
  Calendar,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShoppingBag,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dataSync } from "@/lib/dataSync";
import { dataRecovery } from "@/lib/dataRecovery";

export const CitizenDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [reportImage, setReportImage] = useState<File | null>(null);
  const [reportLocation, setReportLocation] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [wasteHistory, setWasteHistory] = useState(() => {
    const saved = localStorage.getItem('wasteHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [myReports, setMyReports] = useState(() => {
    const saved = localStorage.getItem('myReports');
    return saved ? JSON.parse(saved) : [];
  });
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('wasteStats');
    return saved ? JSON.parse(saved) : { todayWaste: 0, totalWaste: 0, thisMonth: 0, recycledPercent: 0 };
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(() => {
    const saved = localStorage.getItem('lastUpdate');
    return saved ? new Date(saved) : new Date();
  });
  const [purchaseHistory, setPurchaseHistory] = useState(() => {
    const saved = localStorage.getItem('purchaseHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [filteredWasteHistory, setFilteredWasteHistory] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchDashboardData = async (showErrors = false) => {
    // First, try to load from cache if we need fresh data
    if (!dataSync.needsRefresh('wasteHistory') && !loading) {
      const cachedWaste = dataSync.getCachedData('wasteHistory');
      const cachedReports = dataSync.getCachedData('myReports');
      const cachedStats = dataSync.getCachedData('wasteStats');
      const cachedPurchases = dataSync.getCachedData('purchaseHistory');
      
      if (cachedWaste && cachedReports && cachedStats) {
        setWasteHistory(cachedWaste);
        setMyReports(cachedReports);
        setStats(cachedStats);
        setPurchaseHistory(cachedPurchases || []);
        return;
      }
    }
    
    try {
      const [wasteRes, reportsRes, statsRes] = await Promise.all([
        api.get('/waste/history'),
        api.get('/reports/my-reports'),
        api.get('/waste/stats')
      ]);
      
      let purchasesRes = [];
      try {
        purchasesRes = await api.get('/products/purchases/my');
        console.log('Fetched purchases:', purchasesRes);
      } catch (purchaseError) {
        console.error('Failed to fetch purchases:', purchaseError);
      }
      
      const newStats = statsRes || { todayWaste: 0, totalWaste: 0, thisMonth: 0, recycledPercent: 0 };
      
      // Check if stats have increased (waste was collected)
      if (stats.totalWaste > 0 && newStats.totalWaste > stats.totalWaste) {
        const increase = newStats.totalWaste - stats.totalWaste;
        toast({
          title: "Waste Collected!",
          description: `${increase}kg of your waste was collected by municipality`,
          variant: "default"
        });
      }
      
      // Update state and cache data
      const wasteData = wasteRes || [];
      const reportsData = reportsRes || [];
      const purchaseData = purchasesRes || [];
      const currentTime = new Date();
      
      setWasteHistory(wasteData);
      setMyReports(reportsData);
      setStats(newStats);
      setPurchaseHistory(purchaseData);
      setLastUpdate(currentTime);
      
      // Cache data using sync service
      dataSync.cacheData('wasteHistory', wasteData);
      dataSync.cacheData('myReports', reportsData);
      dataSync.cacheData('wasteStats', newStats);
      dataSync.cacheData('purchaseHistory', purchaseData);
      
      // Also persist to localStorage as backup
      localStorage.setItem('wasteHistory', JSON.stringify(wasteData));
      localStorage.setItem('myReports', JSON.stringify(reportsData));
      localStorage.setItem('wasteStats', JSON.stringify(newStats));
      localStorage.setItem('purchaseHistory', JSON.stringify(purchaseData));
      localStorage.setItem('lastUpdate', currentTime.toISOString());
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      
      // Try to load from cache on error
      const cachedWaste = dataSync.getCachedData('wasteHistory', 24 * 60 * 60 * 1000); // 24 hours
      const cachedReports = dataSync.getCachedData('myReports', 24 * 60 * 60 * 1000);
      const cachedStats = dataSync.getCachedData('wasteStats', 24 * 60 * 60 * 1000);
      const cachedPurchases = dataSync.getCachedData('purchaseHistory', 24 * 60 * 60 * 1000);
      
      if (cachedWaste || cachedReports || cachedStats) {
        if (cachedWaste) setWasteHistory(cachedWaste);
        if (cachedReports) setMyReports(cachedReports);
        if (cachedStats) setStats(cachedStats);
        if (cachedPurchases) setPurchaseHistory(cachedPurchases);
        
        if (showErrors) {
          toast({
            title: "Using Cached Data",
            description: "Showing previously saved data. Will sync when connection is restored.",
            variant: "default"
          });
        }
      } else if (showErrors) {
        toast({
          title: "Connection Error",
          description: "Failed to fetch data and no cached data available.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(true); // Show errors on initial load
    
    // Set up polling every 30 seconds (less aggressive)
    const interval = setInterval(() => {
      fetchDashboardData(false); // Don't show errors for background updates
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  
  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('wasteHistory', JSON.stringify(wasteHistory));
  }, [wasteHistory]);
  
  useEffect(() => {
    localStorage.setItem('myReports', JSON.stringify(myReports));
  }, [myReports]);
  
  useEffect(() => {
    localStorage.setItem('wasteStats', JSON.stringify(stats));
  }, [stats]);
  
  useEffect(() => {
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setReportLocation(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
          setLocationLoading(false);
          toast({
            title: "Location Captured",
            description: "Your current location has been captured for the report.",
          });
        },
        (error) => {
          setLocationLoading(false);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      setLocationLoading(false);
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  };

  const handleReportSubmit = async () => {
    if (!reportLocation || !reportDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('location', reportLocation);
      formData.append('description', reportDescription);
      if (currentLocation) {
        formData.append('coordinates', JSON.stringify(currentLocation));
      }
      if (reportImage) {
        formData.append('image', reportImage);
      }

      const response = await fetch('http://localhost:3001/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }
      
      toast({
        title: "Report Submitted!",
        description: "Your waste dumping report has been sent to the municipality.",
      });

      setReportLocation("");
      setReportDescription("");
      setReportImage(null);
      setCurrentLocation(null);
      
      const reportsRes = await api.get('/reports/my-reports');
      setMyReports(reportsRes);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelPurchase = async (purchaseId: string) => {
    try {
      await api.patch(`/products/purchases/${purchaseId}/cancel`, {});
      toast({
        title: "Purchase Cancelled",
        description: "Your purchase has been cancelled successfully.",
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel purchase. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-error" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      {/* Hero Header Section */}
      <div className="hero-gradient text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">🌱 Citizen Dashboard</h1>
              <p className="text-green-100 text-lg">
                Welcome back, <span className="font-semibold">{user?.name}</span> {user?.houseId && `(House ID: ${user.houseId})`}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                <p className="text-xs text-green-100 mb-2">
                  🔄 Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${dataSync.isConnected() ? 'bg-green-300' : 'bg-red-300'}`} />
                    <span className="text-xs text-white font-medium">
                      {dataSync.isConnected() ? '✅ Online' : '❌ Offline'}
                    </span>
                  </div>
                  {dataRecovery.needsRecovery('citizen') && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          await dataRecovery.recoverCitizenData();
                          toast({
                            title: "Data Recovered",
                            description: "Your dashboard data has been restored from the server.",
                          });
                          window.location.reload();
                        } catch (error) {
                          toast({
                            title: "Recovery Failed",
                            description: "Failed to recover data. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                      className="text-xs h-7 bg-white/20 hover:bg-white/30 border-white/30"
                    >
                      🔄 Recover Data
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        const response = await api.post('/fix/fix-citizen-data');
                        toast({
                          title: "Data Fixed!",
                          description: `Fixed citizen data. Today: ${response.todayWaste}kg, Total: ${response.totalWaste}kg`,
                        });
                        setTimeout(() => {
                          fetchDashboardData();
                        }, 1000);
                      } catch (error) {
                        toast({
                          title: "Fix Failed",
                          description: "Failed to fix data. Please try again.",
                          variant: "destructive"
                        });
                      }
                    }}
                    className="text-xs h-7 bg-red-500/20 hover:bg-red-500/30 border-red-300"
                  >
                    🔧 Fix Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">

        {/* Beautiful Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group">
            <DashboardCard
              title="Today Waste Collected"
              value={`${stats.todayWaste || 0} kg`}
              icon={Clock}
              description="🌅 Collected today"
            />
          </div>
          <div className="group">
            <DashboardCard
              title="Total Waste Collected"
              value={`${stats.totalWaste} kg`}
              icon={Trash2}
              description="🏆 Successfully collected by municipality"
            />
          </div>
          <div className="group">
            <DashboardCard
              title="This Month Collected"
              value={`${stats.thisMonth} kg`}
              icon={Calendar}
              description="📅 Waste collected this month"
              variant="success"
            />
          </div>
          <div className="group">
            <DashboardCard
              title="Recycling Rate"
              value={`${stats.recycledPercent}%`}
              icon={TrendingUp}
              description="♻️ Your contribution to recycling"
              variant="success"
            />
          </div>
        </div>

        {/* Beautiful Tabs Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <Tabs defaultValue="profile" className="">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-1">
              <TabsList className="grid w-full grid-cols-9 bg-white/90 backdrop-blur-sm rounded-xl">
                <TabsTrigger value="profile" className="text-xs font-medium">👤 Profile</TabsTrigger>
                <TabsTrigger value="upload" className="text-xs font-medium">📤 Upload</TabsTrigger>
                <TabsTrigger value="history" className="text-xs font-medium">📋 History</TabsTrigger>
                <TabsTrigger value="tracking" className="text-xs font-medium">🚛 Tracking</TabsTrigger>
                <TabsTrigger value="report" className="text-xs font-medium">📸 Report</TabsTrigger>
                <TabsTrigger value="reports" className="text-xs font-medium">📊 Reports</TabsTrigger>
                <TabsTrigger value="penalties" className="text-xs font-medium">⚠️ Penalties</TabsTrigger>
                <TabsTrigger value="shopping" className="text-xs font-medium">🛒 Shopping</TabsTrigger>
                <TabsTrigger value="purchases" className="text-xs font-medium">💳 Purchases</TabsTrigger>
              </TabsList>
            </div>
            <div className="p-6">

              <TabsContent value="profile" className="mt-0">
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
                  <CitizenProfile />
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-0">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                  <WasteUploadForm onUploadSuccess={fetchDashboardData} />
                </div>
              </TabsContent>

              <TabsContent value="shopping" className="mt-0">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                  <EcoShopping />
                </div>
              </TabsContent>

              <TabsContent value="penalties" className="mt-0">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6">
                  <CitizenPenalties />
                </div>
              </TabsContent>

              <TabsContent value="purchases" className="mt-0">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                  <Card className="card-shadow border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2">
                        <ShoppingBag className="h-5 w-5" />
                        <span>🛒 My Purchase History</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {loading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">🔄 Loading purchase history...</p>
                        </div>
                      ) : purchaseHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground text-lg">🛒 No purchases yet.</p>
                          <p className="text-sm text-muted-foreground mt-2">Start shopping for eco-friendly products!</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {purchaseHistory.map((purchase: any) => (
                            <div key={purchase._id} className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center overflow-hidden shadow-md">
                                    {purchase.productId?.imageUrl ? (
                                      <img src={purchase.productId.imageUrl} alt={purchase.productName} className="w-full h-full object-contain" />
                                    ) : (
                                      <ShoppingBag className="h-8 w-8 text-blue-500" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-lg text-gray-800">{purchase.productName}</p>
                                    <p className="text-sm text-blue-600 font-medium">🏢 From: {purchase.sellerId?.name}</p>
                                    <p className="text-xs text-muted-foreground">🕰️ {new Date(purchase.createdAt).toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">🚚 Delivery: {purchase.deliveryAddress}</p>
                                    {purchase.notes && (
                                      <p className="text-xs text-muted-foreground">📝 Notes: {purchase.notes}</p>
                                    )}
                                    {purchase.verificationCode ? (
                                      <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                                        <p className="text-sm font-semibold text-blue-800 mb-2">🔐 Verification Code:</p>
                                        <div className="bg-white p-3 rounded-lg border-2 border-dashed border-blue-300 mb-2">
                                          <p className="text-2xl font-mono font-bold text-blue-900 text-center tracking-wider">{purchase.verificationCode}</p>
                                        </div>
                                        <p className="text-xs text-blue-700 mb-2">✨ Share this code with seller for order verification</p>
                                        <Button
                                          size="sm"
                                          className="bg-blue-500 hover:bg-blue-600 text-white"
                                          onClick={() => {
                                            navigator.clipboard.writeText(purchase.verificationCode);
                                            toast({ title: "Code Copied!", description: "Verification code copied to clipboard" });
                                          }}
                                        >
                                          📋 Copy Code
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="mt-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                                        <p className="text-sm font-semibold text-yellow-800 mb-1">🔑 Generate Verification Code</p>
                                        <p className="text-xs text-yellow-700 mb-3">Create a secure 6-digit code for order verification</p>
                                        <Button
                                          size="sm"
                                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
                                          onClick={async () => {
                                            try {
                                              console.log('Generating code for purchase:', purchase._id);
                                              const response = await api.patch(`/products/purchases/${purchase._id}/generate-code`, {});
                                              console.log('Code generation response:', response);
                                              
                                              toast({
                                                title: "🔐 Code Generated!",
                                                description: `Verification code: ${response.verificationCode}`
                                              });
                                              
                                              setTimeout(() => {
                                                fetchDashboardData();
                                              }, 500);
                                            } catch (error) {
                                              console.error('Generate code error:', error);
                                              toast({
                                                title: "Generation Failed",
                                                description: error.response?.data?.message || error.message || "Could not generate verification code",
                                                variant: "destructive"
                                              });
                                            }
                                          }}
                                        >
                                          ✨ Generate Code
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right space-y-3">
                                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg">
                                    <p className="font-bold text-xl">₹{purchase.totalAmount}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground font-medium">📦 Qty: {purchase.quantity}</p>
                                  <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${
                                    purchase.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' :
                                    purchase.status === 'confirmed' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' :
                                    purchase.status === 'cancelled' ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white' :
                                    'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                                  }`}>
                                    {purchase.status === 'completed' ? '✅ Completed' :
                                     purchase.status === 'confirmed' ? '🔄 Confirmed' :
                                     purchase.status === 'cancelled' ? '❌ Cancelled' :
                                     '⏳ Pending'}
                                  </div>
                                  {purchase.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white font-medium"
                                      onClick={() => handleCancelPurchase(purchase._id)}
                                    >
                                      ❌ Cancel
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
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
                  <Card className="card-shadow border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2">
                        <Trash2 className="h-5 w-5" />
                        <span>📋 Waste Collection History</span>
                      </CardTitle>
                      <div className="flex space-x-3 mt-4">
                        <select 
                          className="px-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-white/50" 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="all">📋 All Status</option>
                          <option value="pending">⏳ Pending</option>
                          <option value="collected">✅ Collected</option>
                        </select>
                        <select 
                          className="px-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-white/50"
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                        >
                          <option value="all">📦 All Types</option>
                          <option value="organic">🌱 Organic</option>
                          <option value="plastic">♻️ Plastic</option>
                          <option value="paper">📄 Paper</option>
                          <option value="metal">🔩 Metal</option>
                          <option value="glass">🧺 Glass</option>
                          <option value="mixed">📦 Mixed</option>
                        </select>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      {loading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">🔄 Loading waste history...</p>
                        </div>
                      ) : wasteHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground text-lg">📋 No waste collection history found.</p>
                          <p className="text-sm text-muted-foreground mt-2">Start uploading waste to see your history!</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {wasteHistory
                            .filter((entry: any) => statusFilter === 'all' || entry.status === statusFilter)
                            .filter((entry: any) => typeFilter === 'all' || entry.type === typeFilter)
                            .map((entry: any) => (
                            <div key={entry._id} className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-4 h-4 rounded-full animate-pulse shadow-lg ${entry.status === 'collected' ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-yellow-400 to-orange-500"}`} />
                                  <div className="flex-1">
                                    <p className="font-semibold text-lg text-gray-800">📦 {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Waste</p>
                                    <p className="text-sm text-blue-600 font-medium">📅 Uploaded: {new Date(entry.createdAt).toLocaleDateString()} at {new Date(entry.createdAt).toLocaleTimeString()}</p>
                                    {entry.status === 'collected' && entry.collectedAt && (
                                      <p className="text-sm text-green-600 font-medium">✅ Collected: {new Date(entry.collectedAt).toLocaleDateString()} at {new Date(entry.collectedAt).toLocaleTimeString()}</p>
                                    )}
                                    
                                    {/* Enhanced waste details */}
                                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <p className="flex items-center"><span className="font-semibold text-blue-800">⚖️ Weight:</span> <span className="ml-2 font-bold text-blue-900">{entry.weight} kg</span></p>
                                        <p className="flex items-center"><span className="font-semibold text-blue-800">📍 Location:</span> <span className="ml-2 text-blue-700">{entry.location || 'Not specified'}</span></p>
                                        {entry.description && (
                                          <p className="col-span-2 flex items-start"><span className="font-semibold text-blue-800">📝 Description:</span> <span className="ml-2 text-blue-700">{entry.description}</span></p>
                                        )}
                                        <p className="flex items-center"><span className="font-semibold text-blue-800">🏷️ ID:</span> <span className="ml-2 font-mono text-blue-900 bg-white px-2 py-1 rounded border">{entry._id.slice(-6).toUpperCase()}</span></p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right space-y-3">
                                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg">
                                    <p className="font-bold text-xl">{entry.weight} kg</p>
                                  </div>
                                  <div className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${entry.status === 'collected' ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"}`}>
                                    {entry.status === 'collected' ? '✅ Collected' : '⏳ Pending'}
                                  </div>
                                  {entry.status === 'collected' && entry.collectedBy && (
                                    <p className="text-xs text-muted-foreground font-medium">👷 by Municipal Worker</p>
                                  )}
                                </div>
                              </div>
                              {entry.status === 'pending' && (
                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4 shadow-md">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <p className="text-sm font-semibold text-orange-900">⏳ Awaiting Collection</p>
                                      <p className="text-xs text-orange-700">👷 Municipal worker will collect this waste</p>
                                    </div>
                                  </div>
                                  
                                  {entry.verificationCode ? (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-semibold text-blue-900">🔐 Verification Code</p>
                                          <p className="text-xs text-blue-700">✨ Share this code with municipal worker for collection</p>
                                        </div>
                                        <div className="text-right">
                                          <div className="bg-white p-3 rounded-lg border-2 border-dashed border-blue-300 shadow-lg">
                                            <p className="text-2xl font-bold text-blue-600 font-mono tracking-wider">{entry.verificationCode}</p>
                                          </div>
                                          <Button
                                            size="sm"
                                            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                                            onClick={() => {
                                              navigator.clipboard.writeText(entry.verificationCode);
                                              toast({ title: "Code Copied!", description: "Verification code copied to clipboard" });
                                            }}
                                          >
                                            📋 Copy Code
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="text-sm font-semibold text-orange-900">🔑 Generate Verification Code</p>
                                        <p className="text-xs text-orange-700">Create a secure code for collection verification</p>
                                      </div>
                                      <Button
                                        size="sm"
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
                                        onClick={async () => {
                                          try {
                                            const response = await api.patch(`/waste/${entry._id}/generate-code`);
                                            toast({
                                              title: "🔐 Code Generated!",
                                              description: `Verification code: ${response.verificationCode}. Share with municipal worker.`,
                                            });
                                            fetchDashboardData();
                                          } catch (error: any) {
                                            console.error('Generate code error:', error);
                                            toast({
                                              title: "❌ Generation Failed",
                                              description: error.response?.data?.message || error.message || "Failed to generate verification code",
                                              variant: "destructive",
                                            });
                                          }
                                        }}
                                      >
                                        ✨ Generate Code
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                              {entry.status === 'collected' && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-md">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-green-900">✅ Collection Completed</p>
                                      <p className="text-xs text-green-700 font-medium">
                                        {entry.verificationCode 
                                          ? `🔐 Verified with code: ${entry.verificationCode}` 
                                          : '👷 Collected by municipal worker'
                                        }
                                      </p>
                                      {entry.completionNotes && (
                                        <p className="text-xs text-green-600 mt-1 bg-white/50 p-2 rounded">📝 Notes: {entry.completionNotes}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="bg-green-500 p-2 rounded-full shadow-lg">
                                        <CheckCircle className="h-6 w-6 text-white" />
                                      </div>
                                      <p className="text-xs text-green-600 mt-1 font-semibold">✨ Verified</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tracking" className="mt-0">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6">
                  <VehicleMap />
                </div>
              </TabsContent>

              <TabsContent value="report" className="mt-0">
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6">
                  <Card className="card-shadow border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2">
                        <Camera className="h-5 w-5" />
                        <span>📸 Report Dumped Waste</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex space-x-2">
                  <Input
                    id="location"
                    placeholder="Enter location or use current location"
                    value={reportLocation}
                    onChange={(e) => setReportLocation(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    disabled={locationLoading}
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    {locationLoading ? "Getting..." : "Use Current"}
                  </Button>
                </div>
                {currentLocation && (
                  <p className="text-xs text-green-600">
                    📍 Location captured: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the waste dumping situation..."
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Upload Photo (Optional)</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={(e) => setReportImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="photo" className="cursor-pointer block">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {reportImage ? `📷 ${reportImage.name}` : "Click to upload photo"}
                    </p>
                  </label>
                </div>
                {reportImage && (
                  <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <span className="text-sm text-green-800">✅ Photo selected: {reportImage.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setReportImage(null)}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

                      <Button onClick={handleReportSubmit} className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <Camera className="mr-2 h-5 w-5" />
                        📤 Submit Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6">
                  <Card className="card-shadow border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-t-lg">
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>📊 My Submitted Reports</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {loading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">🔄 Loading reports...</p>
                        </div>
                      ) : myReports.length === 0 ? (
                        <div className="text-center py-12">
                          <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground text-lg">📊 No reports submitted yet.</p>
                          <p className="text-sm text-muted-foreground mt-2">Start reporting waste dumping to help keep your area clean!</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {myReports.map((report: any) => (
                            <div key={report._id} className="p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-500">
                                    {getStatusIcon(report.status)}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-lg text-gray-800">📍 {report.location}</span>
                                    <p className="text-sm text-violet-600 font-medium">🕰️ {new Date(report.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-700">📝 {report.description}</p>
                              </div>
                              {report.image && (
                                <div className="mb-4">
                                  <div className="relative inline-block group">
                                    <img 
                                      src={report.image.startsWith('http') ? report.image : `${window.location.protocol}//${window.location.hostname}:3001/uploads/${report.image}`} 
                                      alt="Report evidence" 
                                      className="w-40 h-40 object-cover rounded-xl cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                                      onClick={() => {
                                        const imageUrl = report.image.startsWith('http') ? report.image : `${window.location.protocol}//${window.location.hostname}:3001/uploads/${report.image}`;
                                        window.open(imageUrl, '_blank');
                                      }}
                                      onError={(e) => {
                                        console.error('Image failed to load:', report.image);
                                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEg4OFY4OEg0MFY0MFoiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+CjxwYXRoIGQ9Ik01MiA1Nkw2NCA3Mkw3NiA1NkwzMiA5Nkg5NkwzMiA5NloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl cursor-pointer"
                                         onClick={() => {
                                           const imageUrl = report.image.startsWith('http') ? report.image : `${window.location.protocol}//${window.location.hostname}:3001/uploads/${report.image}`;
                                           window.open(imageUrl, '_blank');
                                         }}>
                                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2 font-medium">📷 Your submitted photo - Click to view full size</p>
                                </div>
                              )}

                              {report.status === 'resolved' && report.completionNotes && (
                                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                                  <p className="text-sm font-semibold text-green-800 mb-2">✅ Completion Notes:</p>
                                  <p className="text-sm text-green-700">{report.completionNotes}</p>
                                </div>
                              )}
                              {report.status === 'resolved' && report.wasteCollected && (
                                <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                                  <p className="text-sm font-semibold text-blue-800">⚖️ Waste Collected: <span className="font-bold">{report.wasteCollected}kg</span></p>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold shadow-md ${report.status === "resolved" ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white" : "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"}`}>
                                  {report.status === "resolved" ? "✅ Resolved" : "⏳ Pending"}
                                </div>
                                <Button
                                  size="sm"
                                  className="bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 text-white font-medium"
                                  onClick={() => {
                                    const imageUrl = report.image ? (report.image.startsWith('http') ? report.image : `${window.location.protocol}//${window.location.hostname}:3001/uploads/${report.image}`) : null;
                                    if (imageUrl) {
                                      window.open(imageUrl, '_blank');
                                    } else {
                                      toast({
                                        title: "No Image",
                                        description: "No image attached to this report",
                                        variant: "default"
                                      });
                                    }
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  🔍 View Image
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};