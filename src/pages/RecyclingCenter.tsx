import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlasticInventory } from "@/components/recycler/PlasticInventory";
import { WasteConfirmation } from "@/components/recycler/WasteConfirmation";
import { RecyclerProfile } from "@/components/profile/RecyclerProfile";
import { PendingOrders } from "@/components/recycler/PendingOrders";
import {
  Recycle,
  Truck,
  Building,
  TrendingUp,
  Package,
  MapPin,
  Clock,
  CheckCircle
} from "lucide-react";

export const RecyclingCenter = () => {
  // Mock recycling center data
  const centerData = {
    name: "EcoRecycle Center Madanapalli",
    id: "RC_001",
    wasteReceived: 0,
    wasteProcessed: 0,
    activeConnections: 0,
    efficiency: 0
  };

  // Mock incoming waste data
  const incomingWaste = [];

  // Mock municipality connections
  const connections = [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "processing":
        return <Clock className="h-4 w-4 text-warning" />;
      case "pending":
        return <Package className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success";
      case "processing":
        return "bg-warning/20 text-warning";
      case "pending":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getConnectionStatus = (status: string) => {
    return status === "active" ?
      <div className="flex items-center space-x-1 text-success">
        <div className="w-2 h-2 bg-success rounded-full"></div>
        <span className="text-sm">Active</span>
      </div> :
      <div className="flex items-center space-x-1 text-muted-foreground">
        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
        <span className="text-sm">Inactive</span>
      </div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Recycling Center Dashboard</h1>
        <p className="text-muted-foreground">
          {centerData.name} (ID: {centerData.id})
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <DashboardCard
          title="Waste Received"
          value={`${centerData.wasteReceived} kg`}
          icon={Package}
          description="This month"
          trend={{ value: 8, label: "from last month" }}
        />
        <DashboardCard
          title="Waste Processed"
          value={`${centerData.wasteProcessed} kg`}
          icon={Recycle}
          description="Successfully recycled"
          variant="success"
        />
        <DashboardCard
          title="Active Connections"
          value={centerData.activeConnections}
          icon={Building}
          description="Municipality partnerships"
          variant="success"
        />
        <DashboardCard
          title="Processing Efficiency"
          value={`${centerData.efficiency}%`}
          icon={TrendingUp}
          description="Overall performance"
          trend={{ value: 3, label: "improvement" }}
          variant="success"
        />
      </div>

      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-12">
          <TabsTrigger value="profile" className="flex-1 px-1 text-sm">Profile</TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 px-1 text-sm">Pending Orders</TabsTrigger>
          <TabsTrigger value="processed" className="flex-1 px-1 text-sm">Processed Orders</TabsTrigger>
          <TabsTrigger value="connections" className="flex-1 px-1 text-sm">Municipal Connections</TabsTrigger>
          <TabsTrigger value="products" className="flex-1 px-1 text-sm">Eco Products</TabsTrigger>
          <TabsTrigger value="sales" className="flex-1 px-1 text-sm">Sales History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <RecyclerProfile />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>Pending Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PendingOrders />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processed" className="space-y-4">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span>Processed Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                No processed orders
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-primary" />
                <span>Municipality Connections</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                No municipality connections
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Eco Products</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                No eco products available
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Sales History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                No sales history
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Processing Statistics */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Recycle className="h-5 w-5 text-primary" />
            <span>Processing Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Waste Type Distribution</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Organic</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-muted rounded-full h-2"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Plastic</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-muted rounded-full h-2"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Paper</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-muted rounded-full h-2"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Others</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-muted rounded-full h-2"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Monthly Processing</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-medium">0 kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Processed:</span>
                  <span className="font-medium">0 kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-muted rounded-full h-2"></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Quality Metrics</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Contamination Rate:</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Recovery Rate:</span>
                  <span className="font-medium">0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Energy Generated:</span>
                  <span className="font-medium">0 KWh</span>
                </div>
                <div className="flex justify-between">
                  <span>CO₂ Saved:</span>
                  <span className="font-medium">0 tons</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};