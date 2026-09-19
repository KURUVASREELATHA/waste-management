import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Recycle, Building, Package, CheckCircle } from "lucide-react";

export const RecyclingStatistics = () => {
  const stats = {
    totalWasteSent: 0,
    totalWasteConfirmed: 0,
    activeCenters: 0,
    totalEarnings: 0,
    monthlyGrowth: 0,
    confirmationRate: 0
  };

  const centerStats: any[] = [];

  const wasteTypeBreakdown: any[] = [];

  const getEfficiencyColor = (rate: number) => {
    if (rate >= 95) return "text-success";
    if (rate >= 85) return "text-warning";
    return "text-error";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Waste Sent</p>
                <p className="text-xl font-bold">{stats.totalWasteSent} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-xl font-bold">{stats.totalWasteConfirmed} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active Centers</p>
                <p className="text-xl font-bold">{stats.activeCenters}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Monthly Growth</p>
                <p className="text-xl font-bold">+{stats.monthlyGrowth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Recycle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmation Rate</p>
                <p className="text-xl font-bold">{stats.confirmationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Performance */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-primary" />
            <span>Recycling Center Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No recycling centers registered yet.</p>
        </CardContent>
      </Card>

      {/* Waste Type Breakdown */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Recycle className="h-5 w-5 text-primary" />
            <span>Waste Type Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No waste type data available yet.</p>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Monthly Recycling Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Volume Trends</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-medium">{stats.totalWasteSent} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Month:</span>
                  <span className="font-medium">0 kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-medium text-muted-foreground">{stats.monthlyGrowth}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Revenue Trends</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-medium">₹{stats.totalEarnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Month:</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-medium text-muted-foreground">0%</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Efficiency Metrics</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Avg Confirmation Rate:</span>
                  <span className="font-medium">{stats.confirmationRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="font-medium">0 days</span>
                </div>
                <div className="flex justify-between">
                  <span>Quality Score:</span>
                  <span className="font-medium text-muted-foreground">0/5</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};