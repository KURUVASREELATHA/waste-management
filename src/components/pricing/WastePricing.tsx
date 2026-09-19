import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Recycle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Scale
} from "lucide-react";

interface WastePrice {
  type: string;
  pricePerKg: number;
  minQuantity: number;
  maxQuantity: number;
  trend: "up" | "down" | "stable";
  trendPercent: number;
  description: string;
  icon: string;
}

export const WastePricing = () => {
  const wastePrices: WastePrice[] = [
    {
      type: "PET Bottles",
      pricePerKg: 25,
      minQuantity: 1,
      maxQuantity: 50,
      trend: "up",
      trendPercent: 8,
      description: "Clear plastic bottles, clean and sorted",
      icon: "🍶"
    },
    {
      type: "HDPE Containers",
      pricePerKg: 22,
      minQuantity: 2,
      maxQuantity: 100,
      trend: "up",
      trendPercent: 5,
      description: "Milk jugs, detergent bottles",
      icon: "🥛"
    },
    {
      type: "Paper & Cardboard",
      pricePerKg: 8,
      minQuantity: 5,
      maxQuantity: 200,
      trend: "stable",
      trendPercent: 0,
      description: "Newspapers, magazines, cardboard boxes",
      icon: "📰"
    },
    {
      type: "Aluminum Cans",
      pricePerKg: 120,
      minQuantity: 1,
      maxQuantity: 20,
      trend: "up",
      trendPercent: 12,
      description: "Beverage cans, clean and crushed",
      icon: "🥤"
    },
    {
      type: "Glass Bottles",
      pricePerKg: 5,
      minQuantity: 10,
      maxQuantity: 500,
      trend: "down",
      trendPercent: 3,
      description: "Clear and colored glass bottles",
      icon: "🍾"
    },
    {
      type: "Mixed Plastic",
      pricePerKg: 12,
      minQuantity: 5,
      maxQuantity: 100,
      trend: "stable",
      trendPercent: 0,
      description: "Various plastic types, unsorted",
      icon: "♻️"
    },
    {
      type: "Electronic Waste",
      pricePerKg: 45,
      minQuantity: 1,
      maxQuantity: 10,
      trend: "up",
      trendPercent: 15,
      description: "Old phones, cables, small electronics",
      icon: "📱"
    },
    {
      type: "Copper Wire",
      pricePerKg: 650,
      minQuantity: 1,
      maxQuantity: 5,
      trend: "up",
      trendPercent: 20,
      description: "Pure copper wires, stripped",
      icon: "🔌"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Current Waste Prices</h2>
        <p className="text-muted-foreground">
          Live pricing based on market demand and quantity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wastePrices.map((waste, index) => (
          <Card key={index} className="card-shadow hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{waste.icon}</span>
                  <CardTitle className="text-lg">{waste.type}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(waste.trend)}
                  {waste.trendPercent > 0 && (
                    <span className={`text-xs font-medium ${getTrendColor(waste.trend)}`}>
                      {waste.trendPercent}%
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">₹{waste.pricePerKg}</div>
                <p className="text-sm text-muted-foreground">per kg</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Min Quantity:</span>
                  <span className="font-medium flex items-center">
                    <Scale className="h-3 w-3 mr-1" />
                    {waste.minQuantity} kg
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Max Quantity:</span>
                  <span className="font-medium flex items-center">
                    <Scale className="h-3 w-3 mr-1" />
                    {waste.maxQuantity} kg
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">{waste.description}</p>

              <div className="pt-2">
                <Badge 
                  variant="secondary" 
                  className={`w-full justify-center ${
                    waste.trend === "up" ? "bg-green-100 text-green-800" :
                    waste.trend === "down" ? "bg-red-100 text-red-800" :
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {waste.trend === "up" ? "High Demand" :
                   waste.trend === "down" ? "Low Demand" :
                   "Stable Demand"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Recycle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Price Updates</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Prices are updated daily based on market conditions. Higher quantities may qualify for better rates.
          Contact your local waste collection center for bulk pricing.
        </p>
      </div>
    </div>
  );
};