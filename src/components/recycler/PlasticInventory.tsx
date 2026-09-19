import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Scale,
  Recycle,
  ShoppingCart
} from "lucide-react";

interface PlasticType {
  id: string;
  name: string;
  code: string;
  quantity: number;
  unit: string;
  pricePerKg: number;
  totalValue: number;
  demand: "high" | "medium" | "low";
  lastUpdated: string;
  description: string;
}

export const PlasticInventory = () => {
  // Mock plastic inventory data
  const plasticInventory: PlasticType[] = [
    {
      id: "pet",
      name: "PET Bottles",
      code: "PET-01",
      quantity: 2450,
      unit: "kg",
      pricePerKg: 25,
      totalValue: 61250,
      demand: "high",
      lastUpdated: "2024-01-10",
      description: "Clear plastic bottles, food grade"
    },
    {
      id: "hdpe",
      name: "HDPE Containers",
      code: "HDPE-02",
      quantity: 1850,
      unit: "kg",
      pricePerKg: 22,
      totalValue: 40700,
      demand: "high",
      lastUpdated: "2024-01-10",
      description: "Milk jugs, detergent bottles"
    },
    {
      id: "ldpe",
      name: "LDPE Films",
      code: "LDPE-04",
      quantity: 980,
      unit: "kg",
      pricePerKg: 18,
      totalValue: 17640,
      demand: "medium",
      lastUpdated: "2024-01-09",
      description: "Plastic bags, food wraps"
    },
    {
      id: "pp",
      name: "Polypropylene",
      code: "PP-05",
      quantity: 1320,
      unit: "kg",
      pricePerKg: 20,
      totalValue: 26400,
      demand: "medium",
      lastUpdated: "2024-01-10",
      description: "Bottle caps, food containers"
    },
    {
      id: "ps",
      name: "Polystyrene",
      code: "PS-06",
      quantity: 650,
      unit: "kg",
      pricePerKg: 15,
      totalValue: 9750,
      demand: "low",
      lastUpdated: "2024-01-08",
      description: "Foam containers, disposable cups"
    },
    {
      id: "mixed",
      name: "Mixed Plastics",
      code: "MIX-07",
      quantity: 2100,
      unit: "kg",
      pricePerKg: 12,
      totalValue: 25200,
      demand: "medium",
      lastUpdated: "2024-01-10",
      description: "Various plastic types, unsorted"
    }
  ];

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDemandIcon = (demand: string) => {
    switch (demand) {
      case "high":
        return <TrendingUp className="h-3 w-3" />;
      case "medium":
        return <TrendingUp className="h-3 w-3" />;
      case "low":
        return <TrendingUp className="h-3 w-3" />;
      default:
        return <TrendingUp className="h-3 w-3" />;
    }
  };

  const totalInventoryValue = plasticInventory.reduce((sum, item) => sum + item.totalValue, 0);
  const totalQuantity = plasticInventory.reduce((sum, item) => sum + item.quantity, 0);

  const handleSellPlastic = (plasticId: string) => {
    console.log(`Initiating sale for plastic type: ${plasticId}`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalQuantity.toLocaleString()} kg</p>
                <p className="text-sm text-muted-foreground">Total Inventory</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">₹{totalInventoryValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Recycle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{plasticInventory.length}</p>
                <p className="text-sm text-muted-foreground">Plastic Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Plastic Inventory by Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plasticInventory.map((plastic) => (
              <div key={plastic.id} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{plastic.name}</h3>
                      <p className="text-sm text-muted-foreground">{plastic.code}</p>
                      <p className="text-xs text-muted-foreground">{plastic.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getDemandColor(plastic.demand)}>
                      {getDemandIcon(plastic.demand)}
                      <span className="ml-1">{plastic.demand.toUpperCase()}</span>
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold flex items-center">
                      <Scale className="h-4 w-4 mr-1" />
                      {plastic.quantity.toLocaleString()} {plastic.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price per kg</p>
                    <p className="font-semibold text-green-600">₹{plastic.pricePerKg}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="font-semibold text-green-600">₹{plastic.totalValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-semibold">{plastic.lastUpdated}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Market demand: <span className={`font-medium ${
                      plastic.demand === "high" ? "text-green-600" : 
                      plastic.demand === "medium" ? "text-orange-500" : "text-red-500"
                    }`}>
                      {plastic.demand}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleSellPlastic(plastic.id)}
                    className="flex items-center space-x-1"
                  >
                    <ShoppingCart className="h-3 w-3" />
                    <span>Sell</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Market Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">High Demand Plastics</h4>
              <div className="space-y-2">
                {plasticInventory
                  .filter(p => p.demand === "high")
                  .map(plastic => (
                    <div key={plastic.id} className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">{plastic.name}</span>
                      <span className="text-sm text-green-600">₹{plastic.pricePerKg}/kg</span>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Price Recommendations</h4>
              <div className="space-y-2 text-sm">
                <p>• PET bottles showing 15% price increase this month</p>
                <p>• HDPE containers in high demand due to packaging industry growth</p>
                <p>• Consider bundling low-demand plastics for better pricing</p>
                <p>• Mixed plastics can be sorted for higher value</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};