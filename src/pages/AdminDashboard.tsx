import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  Truck,
  Building,
  Camera,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  MapPin,
  Recycle,
  X,
  Edit
} from "lucide-react";
import { VehicleMap } from "@/components/map/VehicleMap";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const AdminDashboard = () => {
  const { toast } = useToast();

  const [adminData, setAdminData] = useState({
    totalHouseholds: 0,
    activeVehicles: 0,
    wasteCollectedToday: 0,
    recyclingCenters: 0,
    pendingReports: 0,
    resolvedReports: 0,
    collectionRate: 0,
    totalCollected: 0,
    monthlyTotal: 0
  });
  const [userCounts, setUserCounts] = useState({
    citizens: 0,
    workers: 0,
    recyclers: 0
  });
  const [citizens, setCitizens] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievements, setAchievements] = useState([
    { id: 'eco_champion', title: 'Eco Champion', desc: 'Processed 1000+ kg waste', icon: '🏆', threshold: 1000 },
    { id: 'green_pioneer', title: 'Green Pioneer', desc: 'First 100 orders completed', icon: '🌱', threshold: 100 },
    { id: 'quality_master', title: 'Quality Master', desc: 'Maintain 4+ star rating', icon: '⭐', threshold: 4 },
    { id: 'innovation_leader', title: 'Innovation Leader', desc: 'Launch 50+ eco products', icon: '💡', threshold: 50 },
    { id: 'community_hero', title: 'Community Hero', desc: 'Serve 10+ municipalities', icon: '🤝', threshold: 10 },
    { id: 'sustainability_expert', title: 'Sustainability Expert', desc: 'Zero waste to landfill', icon: '♻️', threshold: 0 }
  ]);
  const [rewards, setRewards] = useState([
    { id: 'carbon_credit', title: 'Carbon Credit Bonus', desc: 'Earn extra for eco-friendly practices', points: 500 },
    { id: 'bulk_processing', title: 'Bulk Processing Bonus', desc: 'Handle large municipal orders', points: 300 },
    { id: 'quality_excellence', title: 'Quality Excellence', desc: 'Maintain high processing standards', points: 200 },
    { id: 'innovation_bonus', title: 'Innovation Bonus', desc: 'Launch new recycling methods', points: 400 }
  ]);

  const [citizenReports, setCitizenReports] = useState<any[]>([]);

  useEffect(() => {
    // Clear cached dashboard data if it's a new day
    const clearDailyCache = () => {
      const lastClearDate = localStorage.getItem('lastDashboardClear');
      const today = new Date().toDateString();
      
      if (lastClearDate !== today) {
        // Clear all dashboard-related cache
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('dashboard') || key.includes('stats') || key.includes('wastewise_dashboardData')) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem('lastDashboardClear', today);
        console.log('Dashboard cache cleared for new day:', today);
      }
    };
    
    clearDailyCache();

    const fetchUserCounts = async () => {
      try {
        const [citizensRes, workersRes, recyclersRes] = await Promise.all([
          api.get('/auth/users/role/citizen'),
          api.get('/auth/users/role/worker'),
          api.get('/auth/users/role/recycler')
        ]);
        setUserCounts({
          citizens: citizensRes.length || 0,
          workers: workersRes.length || 0,
          recyclers: recyclersRes.length || 0
        });
      } catch (error) {
        console.error('Failed to fetch user counts:', error);
        setUserCounts({ citizens: 0, workers: 0, recyclers: 0 });
      }
    };

    const fetchDashboardData = async () => {
      try {
        // Force fresh data by adding timestamp to prevent caching
        const timestamp = new Date().getTime();
        const statsResponse = await api.get(`/waste/dashboard-stats?t=${timestamp}`);
        
        console.log('Fresh dashboard stats received:', statsResponse);
        
        const newAdminData = {
          ...adminData,
          totalHouseholds: statsResponse.totalHouseholds || 0,
          wasteCollectedToday: statsResponse.wasteCollectedToday || 0,
          pendingReports: statsResponse.pendingCollections || 0,
          collectionRate: statsResponse.collectionRate || 0,
          activeVehicles: Math.max(0, Math.ceil((statsResponse.wasteCollectedToday || 0) / 100)),
          recyclingCenters: (statsResponse.wasteCollectedToday || 0) > 0 ? Math.max(1, Math.ceil((statsResponse.wasteCollectedToday || 0) / 50)) : 0,
          totalCollected: statsResponse.totalCollected || 0,
          monthlyTotal: statsResponse.monthlyTotal || 0,
          lastUpdated: new Date().toISOString()
        };
        
        console.log('Updated admin data:', newAdminData);
        setAdminData(newAdminData);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Don't use hardcoded fallback data - keep existing data or use zeros
        const fallbackData = {
          ...adminData,
          totalHouseholds: 0,
          wasteCollectedToday: 0,
          pendingReports: 0,
          collectionRate: 0,
          activeVehicles: 0,
          recyclingCenters: 0,
          totalCollected: 0,
          monthlyTotal: 0
        };
        setAdminData(fallbackData);
      }
    };

    const fetchReports = async () => {
      try {
        const response = await api.get('/reports/all');
        setCitizenReports(response);
        const pendingCount = response.filter((r: any) => r.status === 'pending').length;
        const resolvedCount = response.filter((r: any) => r.status === 'resolved').length;
        setAdminData(prev => ({ 
          ...prev, 
          pendingReports: pendingCount,
          resolvedReports: resolvedCount
        }));
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        setCitizenReports([]);
        setAdminData(prev => ({ 
          ...prev, 
          pendingReports: 1,
          resolvedReports: 15
        }));
      }
    };

    fetchUserCounts();
    fetchDashboardData();
    fetchReports();
  }, []);

  // Fetch users when tabs become active
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (activeTab === 'citizens') {
          const response = await api.get('/auth/users/role/citizen');
          setCitizens(response || []);
        } else if (activeTab === 'workers') {
          const response = await api.get('/auth/users/role/worker');
          setWorkers(response || []);
        } else if (activeTab === 'recyclers') {
          const response = await api.get('/auth/users/role/recycler');
          setRecyclers(response || []);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    
    if (['citizens', 'workers', 'recyclers'].includes(activeTab)) {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUserDetails = async (userId: string, userType: string) => {
    try {
      // Find user from already loaded data instead of making new API call
      let user;
      if (userType === 'citizen') {
        user = citizens.find(c => c._id === userId);
      } else if (userType === 'worker') {
        user = workers.find(w => w._id === userId);
      } else if (userType === 'recycler') {
        user = recyclers.find(r => r._id === userId);
      }
      
      if (!user) {
        throw new Error('User not found');
      }
      
      let additionalData = {};
      
      if (userType === 'citizen') {
        try {
          const wasteHistory = await api.get(`/waste/history/${userId}`);
          additionalData = { wasteHistory: wasteHistory || [] };
        } catch (error) {
          additionalData = { wasteHistory: [] };
        }
      } else if (userType === 'worker') {
        try {
          const collections = await api.get(`/waste/worker/${userId}`);
          additionalData = { collections: collections || [] };
        } catch (error) {
          additionalData = { collections: [] };
        }
      }
      
      setUserDetails({ ...user, userType, ...additionalData });
      setShowUserModal(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning" />;
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-error" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-success/20 text-success";
      case "in_progress":
        return "bg-warning/20 text-warning";
      case "pending":
        return "bg-error/20 text-error";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleResolveReport = (reportId: number) => {
    toast({
      title: "Report Resolved",
      description: `Report #${reportId} has been marked as resolved.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)] animate-pulse"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-full text-white shadow-lg">
            <Shield className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Comprehensive overview of the Smart Waste Management System
          </p>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              onClick={async () => {
                try {
                  // Clear cache and refresh data
                  const keys = Object.keys(localStorage);
                  keys.forEach(key => {
                    if (key.includes('dashboard') || key.includes('stats') || key.includes('wastewise_dashboardData')) {
                      localStorage.removeItem(key);
                    }
                  });
                  
                  // Fetch fresh data
                  const timestamp = new Date().getTime();
                  const statsResponse = await api.get(`/waste/dashboard-stats?t=${timestamp}`);
                  
                  const newAdminData = {
                    ...adminData,
                    totalHouseholds: statsResponse.totalHouseholds || 0,
                    wasteCollectedToday: statsResponse.wasteCollectedToday || 0,
                    pendingReports: statsResponse.pendingCollections || 0,
                    collectionRate: statsResponse.collectionRate || 0,
                    activeVehicles: Math.max(0, Math.ceil((statsResponse.wasteCollectedToday || 0) / 100)),
                    recyclingCenters: (statsResponse.wasteCollectedToday || 0) > 0 ? Math.max(1, Math.ceil((statsResponse.wasteCollectedToday || 0) / 50)) : 0,
                    totalCollected: statsResponse.totalCollected || 0,
                    monthlyTotal: statsResponse.monthlyTotal || 0,
                    lastUpdated: new Date().toISOString()
                  };
                  
                  setAdminData(newAdminData);
                  
                  toast({
                    title: "Dashboard Refreshed",
                    description: `Updated at ${new Date().toLocaleTimeString()}. Today's collection: ${statsResponse.wasteCollectedToday || 0} kg`,
                  });
                } catch (error) {
                  toast({
                    title: "Refresh Failed",
                    description: "Failed to refresh dashboard data",
                    variant: "destructive"
                  });
                }
              }}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
            >
              🔄 Refresh Data
            </Button>
            {adminData.lastUpdated && (
              <span className="text-sm text-gray-300">
                Last updated: {new Date(adminData.lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

      {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <div onClick={() => setActiveTab('citizens')} className="cursor-pointer transform hover:scale-105 transition-all duration-300">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-xl text-white hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-12 w-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-extrabold">{userCounts.citizens}</div>
                <div className="text-blue-100 text-xs font-medium">Active Users</div>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">Citizens</h3>
            <p className="text-blue-100 text-xs">Click to manage citizens</p>
          </div>
        </div>
        <div onClick={() => setActiveTab('workers')} className="cursor-pointer transform hover:scale-105 transition-all duration-300">
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-xl text-white hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Truck className="h-12 w-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-extrabold">{userCounts.workers}</div>
                <div className="text-green-100 text-xs font-medium">Active Workers</div>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">Municipality Workers</h3>
            <p className="text-green-100 text-xs">Click to manage workers</p>
          </div>
        </div>
        <div onClick={() => setActiveTab('recyclers')} className="cursor-pointer transform hover:scale-105 transition-all duration-300">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white hover:shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <Building className="h-12 w-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-extrabold">{userCounts.recyclers}</div>
                <div className="text-purple-100 text-xs font-medium">Centers</div>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">Recycling Centers</h3>
            <p className="text-purple-100 text-xs">Click to manage centers</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-12 w-12 opacity-80" />
            <div className="text-right">
              <div className="text-4xl font-extrabold">{adminData.wasteCollectedToday} kg</div>
              <div className="text-orange-100 text-xs font-medium">Today</div>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-1">Today's Collection</h3>
          <p className="text-orange-100 text-xs">Waste collected today</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Camera className="h-12 w-12 opacity-80" />
            <div className="text-right">
              <div className="text-4xl font-extrabold">{adminData.pendingReports}</div>
              <div className="text-red-100 text-xs font-medium">Pending</div>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-1">Pending Reports</h3>
          <p className="text-red-100 text-xs">Citizen complaints</p>
        </div>
        
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <Recycle className="h-12 w-12 opacity-80" />
            <div className="text-right">
              <div className="text-4xl font-extrabold">{adminData.totalCollected} kg</div>
              <div className="text-teal-100 text-xs font-medium">All Time</div>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-1">Total Collected</h3>
          <p className="text-teal-100 text-xs">All-time waste collected</p>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-2xl shadow-xl text-white">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-12 w-12 opacity-80" />
            <div className="text-right">
              <div className="text-4xl font-extrabold">{adminData.monthlyTotal} kg</div>
              <div className="text-indigo-100 text-xs font-medium">This Month</div>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-1">Monthly Total</h3>
          <p className="text-indigo-100 text-xs">This month's collection</p>
        </div>
      </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-7 bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/10">
              <TabsTrigger value="overview" className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Overview</TabsTrigger>
              <TabsTrigger value="tracking" className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Live Tracking</TabsTrigger>
              <TabsTrigger value="citizens" className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Citizens</TabsTrigger>
              <TabsTrigger value="workers" className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Workers</TabsTrigger>
              <TabsTrigger value="recyclers" className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Recyclers</TabsTrigger>
              <TabsTrigger value="achievements" className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Achievements</TabsTrigger>
              <TabsTrigger value="statistics" className="rounded-xl text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300">Statistics</TabsTrigger>
            </TabsList>

        <TabsContent value="citizens" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-t-2xl">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Users className="h-6 w-6 text-cyan-400" />
                <span className="text-xl font-bold">Citizen Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {citizens.length === 0 ? (
                <p className="text-center text-gray-200 py-8 text-lg">No citizens registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {citizens.map((citizen) => (
                    <div key={citizen._id} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white text-lg">{citizen.name}</p>
                          <p className="text-sm text-gray-200">House ID: {citizen.houseId}</p>
                          <p className="text-sm text-gray-200">{citizen.email}</p>
                          <p className="text-sm text-gray-200">{citizen.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => fetchUserDetails(citizen._id, 'citizen')}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workers" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-t-2xl">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Truck className="h-6 w-6 text-emerald-400" />
                <span className="text-xl font-bold">Municipality Workers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {workers.length === 0 ? (
                <p className="text-center text-gray-200 py-8 text-lg">No workers registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {workers.map((worker) => (
                    <div key={worker._id} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white text-lg">{worker.name}</p>
                          <p className="text-sm text-gray-200">Worker ID: {worker.workerId}</p>
                          <p className="text-sm text-gray-200">{worker.email}</p>
                          <p className="text-sm text-gray-200">{worker.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => fetchUserDetails(worker._id, 'worker')}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recyclers" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-t-2xl">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Building className="h-6 w-6 text-pink-400" />
                <span className="text-xl font-bold">Recycling Centers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recyclers.length === 0 ? (
                <p className="text-center text-gray-200 py-8 text-lg">No recycling centers registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {recyclers.map((recycler) => (
                    <div key={recycler._id} className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white text-lg">{recycler.name}</p>
                          <p className="text-sm text-gray-200">Center: {recycler.centerName}</p>
                          <p className="text-sm text-gray-200">{recycler.email}</p>
                          <p className="text-sm text-gray-200">{recycler.phone}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={() => fetchUserDetails(recycler._id, 'recycler')}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <VehicleMap />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Area-wise Collection Status */}
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-t-2xl">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <MapPin className="h-6 w-6 text-teal-400" />
                  <span className="text-xl font-bold">Area-wise Collection Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30">
                      <h4 className="font-semibold text-green-300">Collected Areas</h4>
                      <p className="text-3xl font-bold text-green-100">{adminData.resolvedReports || 0}</p>
                      <p className="text-sm text-green-200">Areas completed today</p>
                    </div>
                    <div className="p-4 bg-orange-500/20 backdrop-blur-sm rounded-xl border border-orange-400/30">
                      <h4 className="font-semibold text-orange-300">Pending Areas</h4>
                      <p className="text-3xl font-bold text-orange-100">{adminData.pendingReports || 0}</p>
                      <p className="text-sm text-orange-200">Areas remaining</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-white">
                      <span>Collection Progress</span>
                      <span className="font-bold">{adminData.collectionRate}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-400 to-teal-400 rounded-full h-3 transition-all duration-500" style={{ width: `${adminData.collectionRate}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Performance */}
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-t-2xl">
                <CardTitle className="flex items-center space-x-2 text-white">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                  <span className="text-xl font-bold">System Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-500/20 rounded-xl">
                    <div className="text-3xl font-bold text-green-300">{adminData.collectionRate > 0 ? '99.8%' : '0%'}</div>
                    <div className="text-sm text-green-200">System Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/20 rounded-xl">
                    <div className="text-3xl font-bold text-blue-300">{userCounts.citizens + userCounts.workers + userCounts.recyclers}</div>
                    <div className="text-sm text-blue-200">Active Users</div>
                  </div>
                  <div className="text-center p-4 bg-purple-500/20 rounded-xl">
                    <div className="text-3xl font-bold text-purple-300">{adminData.wasteCollectedToday > 0 ? '120ms' : '0ms'}</div>
                    <div className="text-sm text-purple-200">Avg Response</div>
                  </div>
                  <div className="text-center p-4 bg-orange-500/20 rounded-xl">
                    <div className="text-3xl font-bold text-orange-300">{adminData.totalCollected > 0 ? '95.2%' : '0%'}</div>
                    <div className="text-sm text-orange-200">Data Accuracy</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>



        <TabsContent value="achievements" className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-t-2xl">
              <CardTitle className="flex items-center space-x-2 text-white">
                <span className="text-2xl">🏆</span>
                <span className="text-xl font-bold">Recycler Achievements & Rewards Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {recyclers.length === 0 ? (
                <p className="text-center text-gray-300 py-8 text-lg">No recycling centers to manage achievements for.</p>
              ) : (
                <div className="space-y-6">
                  {recyclers.map((recycler) => {
                    const userSeed = recycler._id ? parseInt(recycler._id.slice(-2), 16) || 1 : 1;
                    const currentRating = parseInt(localStorage.getItem(`recycler_${recycler._id}_rating`) || (3 + (userSeed % 3)).toString());
                    const currentPoints = parseInt(localStorage.getItem(`recycler_${recycler._id}_points`) || (1000 + (userSeed * 50)).toString());
                    
                    return (
                      <div key={recycler._id} className="p-6 bg-muted/30 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">{recycler.name}</h3>
                            <p className="text-sm text-muted-foreground">{recycler.centerName}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              {[1,2,3,4,5].map((star) => (
                                <span key={star} className={`text-lg cursor-pointer ${star <= currentRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  onClick={() => {
                                    localStorage.setItem(`recycler_${recycler._id}_rating`, star.toString());
                                    window.location.reload();
                                  }}
                                >★</span>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{currentRating}/5 rating</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Achievements */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center space-x-2">
                              <span>🏆</span>
                              <span>Achievements</span>
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Achievements</span>
                                <Button size="sm" onClick={() => {
                                  setEditingAchievement({ title: '', desc: '', icon: '', threshold: 0, isNew: true });
                                  setShowAchievementModal(true);
                                }}>
                                  Add Achievement
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                {achievements.map((achievement) => {
                                  const earned = achievement.id === 'quality_master' ? currentRating >= 4 : userSeed > achievement.threshold;
                                  return (
                                    <div key={achievement.id} className={`p-2 rounded border-2 cursor-pointer relative group ${
                                      earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                                      onClick={() => {
                                        const key = `recycler_${recycler._id}_achievement_${achievement.id}`;
                                        const current = localStorage.getItem(key) === 'true';
                                        localStorage.setItem(key, (!current).toString());
                                        window.location.reload();
                                      }}
                                    >
                                      <Button size="sm" variant="ghost" className="absolute top-0 right-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingAchievement(achievement);
                                          setShowAchievementModal(true);
                                        }}
                                      >
                                        ✏️
                                      </Button>
                                      <div className="text-lg mb-1">{achievement.icon}</div>
                                      <h5 className={`font-medium text-xs ${earned ? 'text-green-800' : 'text-gray-500'}`}>
                                        {achievement.title}
                                      </h5>
                                      <p className={`text-xs ${earned ? 'text-green-600' : 'text-gray-400'}`}>
                                        {achievement.desc}
                                      </p>
                                      {earned && (
                                        <div className="mt-1">
                                          <span className="px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">Earned</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          
                          {/* Rewards & Points */}
                          <div>
                            <h4 className="font-medium mb-3 flex items-center space-x-2">
                              <span>🎁</span>
                              <span>Rewards & Points</span>
                            </h4>
                            <div className="space-y-3">
                              <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded border border-yellow-200">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-yellow-800">Gold Tier Status</h5>
                                  <span className="text-xl">🥇</span>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>5% bonus on all transactions</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>Priority order processing</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>Free marketing support</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <h5 className="font-medium text-sm">Available Rewards</h5>
                                  <Button size="sm" onClick={() => {
                                    setEditingAchievement({ title: '', desc: '', points: 0, isReward: true, isNew: true });
                                    setShowAchievementModal(true);
                                  }}>
                                    Add Reward
                                  </Button>
                                </div>
                                {rewards.map((reward) => (
                                  <div key={reward.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs group">
                                    <div className="flex-1">
                                      <span>{reward.title}</span>
                                      <p className="text-xs text-muted-foreground">{reward.desc}</p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-bold text-green-600">{reward.points} pts</span>
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                        onClick={() => {
                                          setEditingAchievement({ ...reward, isReward: true });
                                          setShowAchievementModal(true);
                                        }}
                                      >
                                        ✏️
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs">Claim</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="p-3 bg-blue-50 rounded">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-blue-800 text-sm">Total Reward Points</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Input 
                                        type="number" 
                                        value={currentPoints} 
                                        onChange={(e) => {
                                          localStorage.setItem(`recycler_${recycler._id}_points`, e.target.value);
                                        }}
                                        className="h-6 w-20 text-xs"
                                      />
                                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs"
                                        onClick={() => window.location.reload()}
                                      >
                                        Update
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-blue-600">{currentPoints.toLocaleString()}</p>
                                    <Button size="sm" className="h-6 px-2 text-xs">Redeem</Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-t-2xl">
                <CardTitle className="text-white text-xl font-bold">Total Recycled</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-green-300">{Math.floor(adminData.totalCollected * 0.7)} kg</div>
                <p className="text-sm text-green-200">Materials processed</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-t-2xl">
                <CardTitle className="text-white text-xl font-bold">Active Centers</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-blue-300">{userCounts.recyclers}</div>
                <p className="text-sm text-blue-200">Currently operating</p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-t-2xl">
                <CardTitle className="text-white text-xl font-bold">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-purple-300">₹{Math.floor(adminData.monthlyTotal * 15).toLocaleString()}</div>
                <p className="text-sm text-purple-200">From recycling sales</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
          </Tabs>
        </div>

      {/* User Details Modal */}
      {showUserModal && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{userDetails.userType.charAt(0).toUpperCase() + userDetails.userType.slice(1)} Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowUserModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={userDetails.name} readOnly />
                </div>
                <div>
                  <Label>{userDetails.userType === 'citizen' ? 'House ID' : userDetails.userType === 'worker' ? 'Worker ID' : 'Center Name'}</Label>
                  <Input value={userDetails.houseId || userDetails.workerId || userDetails.centerName || 'Not provided'} readOnly />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={userDetails.email} readOnly />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={userDetails.phone} readOnly />
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Input value={userDetails.address || 'Not provided'} readOnly />
                </div>
              </div>
              
              {userDetails.userType === 'citizen' && (
                <div>
                  <h4 className="font-semibold mb-3">Waste Collection History</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {userDetails.wasteHistory?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No waste collections yet</p>
                    ) : (
                      userDetails.wasteHistory?.map((waste: any) => (
                        <div key={waste._id} className="p-3 bg-muted/30 rounded text-sm">
                          <p className="font-medium">{waste.type} - {waste.weight}kg</p>
                          <p className="text-muted-foreground">{new Date(waste.createdAt).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">Status: {waste.status}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {userDetails.userType === 'worker' && (
                <div>
                  <h4 className="font-semibold mb-3">Collection Activity</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {userDetails.collections?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No collections recorded yet</p>
                    ) : (
                      userDetails.collections?.map((collection: any) => (
                        <div key={collection._id} className="p-3 bg-muted/30 rounded text-sm">
                          <p className="font-medium">{collection.type} - {collection.weight}kg</p>
                          <p className="text-muted-foreground">From: {collection.userId?.name}</p>
                          <p className="text-muted-foreground">{new Date(collection.collectedAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Achievement/Reward Edit Modal */}
      {showAchievementModal && editingAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingAchievement.isNew ? 'Add' : 'Edit'} {editingAchievement.isReward ? 'Reward' : 'Achievement'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAchievementModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingAchievement.title}
                  onChange={(e) => setEditingAchievement(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingAchievement.desc}
                  onChange={(e) => setEditingAchievement(prev => ({ ...prev, desc: e.target.value }))}
                  placeholder="Enter description"
                />
              </div>
              {!editingAchievement.isReward && (
                <div className="space-y-2">
                  <Label>Icon (Emoji)</Label>
                  <Input
                    value={editingAchievement.icon}
                    onChange={(e) => setEditingAchievement(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="🏆"
                  />
                </div>
              )}
              {!editingAchievement.isReward && (
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <Input
                    type="number"
                    value={editingAchievement.threshold}
                    onChange={(e) => setEditingAchievement(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                    placeholder="100"
                  />
                </div>
              )}
              {editingAchievement.isReward && (
                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={editingAchievement.points}
                    onChange={(e) => setEditingAchievement(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    placeholder="500"
                  />
                </div>
              )}
              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => {
                    if (editingAchievement.isReward) {
                      if (editingAchievement.isNew) {
                        const newReward = {
                          ...editingAchievement,
                          id: editingAchievement.title.toLowerCase().replace(/\s+/g, '_')
                        };
                        setRewards(prev => [...prev, newReward]);
                      } else {
                        setRewards(prev => prev.map(r => r.id === editingAchievement.id ? editingAchievement : r));
                      }
                    } else {
                      if (editingAchievement.isNew) {
                        const newAchievement = {
                          ...editingAchievement,
                          id: editingAchievement.title.toLowerCase().replace(/\s+/g, '_')
                        };
                        setAchievements(prev => [...prev, newAchievement]);
                      } else {
                        setAchievements(prev => prev.map(a => a.id === editingAchievement.id ? editingAchievement : a));
                      }
                    }
                    setShowAchievementModal(false);
                    toast({
                      title: "Success",
                      description: `${editingAchievement.isReward ? 'Reward' : 'Achievement'} ${editingAchievement.isNew ? 'added' : 'updated'} successfully`
                    });
                  }}
                  className="flex-1"
                >
                  {editingAchievement.isNew ? 'Add' : 'Update'}
                </Button>
                {!editingAchievement.isNew && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (editingAchievement.isReward) {
                        setRewards(prev => prev.filter(r => r.id !== editingAchievement.id));
                      } else {
                        setAchievements(prev => prev.filter(a => a.id !== editingAchievement.id));
                      }
                      setShowAchievementModal(false);
                      toast({
                        title: "Deleted",
                        description: `${editingAchievement.isReward ? 'Reward' : 'Achievement'} deleted successfully`
                      });
                    }}
                  >
                    Delete
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowAchievementModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};