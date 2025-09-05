import React from "react";
import { Package, DollarSign, AlertTriangle, Grid3X3 } from "lucide-react";

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  categoriesCount: number;
}

interface StatsCardsProps {
  stats: InventoryStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const statItems = [
    {
      name: "Total Items",
      value: stats.totalItems.toLocaleString(),
      icon: Package,
      color: "blue",
    },
    {
      name: "Total Value",
      value: `$${stats.totalValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "green",
    },
    {
      name: "Low Stock Items",
      value: stats.lowStockCount.toString(),
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? "red" : "gray",
    },
    {
      name: "Categories",
      value: stats.categoriesCount.toString(),
      icon: Grid3X3,
      color: "purple",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      red: "bg-red-100 text-red-600",
      purple: "bg-purple-100 text-purple-600",
      gray: "bg-gray-100 text-gray-600",
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${getColorClasses(item.color)}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{item.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
