import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "success" | "warning" | "error";
  children?: ReactNode;
}

export const DashboardCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = "default",
  children,
}: DashboardCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "border-success/20 bg-success/5";
      case "warning":
        return "border-warning/20 bg-warning/5";
      case "error":
        return "border-error/20 bg-error/5";
      default:
        return "";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "success":
        return "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-green-200";
      case "warning":
        return "bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-yellow-200";
      case "error":
        return "bg-gradient-to-br from-red-400 to-pink-500 text-white shadow-red-200";
      default:
        return "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-200";
    }
  };

  return (
    <Card className={`relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group ${getVariantStyles()}`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">
          {title}
        </CardTitle>
        <div className={`p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${getIconStyles()}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">{value}</div>
        {description && (
          <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors font-medium">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-3 p-2 bg-white/50 rounded-lg">
            <span
              className={`text-sm font-bold ${
                trend.value > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-sm text-gray-600 ml-2 font-medium">
              {trend.label}
            </span>
          </div>
        )}
        {children}
      </CardContent>
      
      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{padding: '2px'}}>
        <div className="w-full h-full bg-white rounded-lg" />
      </div>
    </Card>
  );
};