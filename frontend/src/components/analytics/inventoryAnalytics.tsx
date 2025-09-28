import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Truck,
  DollarSign,
  BarChart3,
  RefreshCw,
  Calendar,
  Activity
} from 'lucide-react';

// Sample inventory data
const generateInventoryData = () => {
  return {
    categoryOverview: [
      { 
        category: 'Electronics', 
        stock: 450, 
        lowStock: 35, 
        outOfStock: 5, 
        value: 125000, 
        turnover: 8.2,
        trend: 12.5 
      },
      { 
        category: 'Clothing', 
        stock: 680, 
        lowStock: 45, 
        outOfStock: 8, 
        value: 89000, 
        turnover: 6.5,
        trend: -3.2 
      },
      { 
        category: 'Food & Beverages', 
        stock: 890, 
        lowStock: 78, 
        outOfStock: 12, 
        value: 45000, 
        turnover: 12.1,
        trend: 8.7 
      },
      { 
        category: 'Home & Garden', 
        stock: 320, 
        lowStock: 28, 
        outOfStock: 3, 
        value: 67000, 
        turnover: 4.8,
        trend: 15.3 
      },
      { 
        category: 'Sports & Outdoors', 
        stock: 280, 
        lowStock: 22, 
        outOfStock: 4, 
        value: 52000, 
        turnover: 7.3,
        trend: -1.8 
      }
    ],
    stockLevels: [
      { name: 'In Stock', value: 75, count: 2620, color: '#10B981' },
      { name: 'Low Stock', value: 15, count: 208, color: '#F59E0B' },
      { name: 'Out of Stock', value: 10, count: 32, color: '#EF4444' }
    ],
    monthlyMovement: Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i).toLocaleDateString('en', { month: 'short' });
      return {
        month,
        inbound: Math.floor(Math.random() * 500) + 200,
        outbound: Math.floor(Math.random() * 600) + 300,
        net: Math.floor(Math.random() * 200) - 100
      };
    }),
    topMovingItems: [
      { name: 'Wireless Headphones', movement: 285, category: 'Electronics', status: 'High', velocity: 95 },
      { name: 'Coffee Beans', movement: 420, category: 'Food & Beverages', status: 'High', velocity: 88 },
      { name: 'Running Shoes', movement: 156, category: 'Sports & Outdoors', status: 'Medium', velocity: 72 },
      { name: 'Garden Tools', movement: 89, category: 'Home & Garden', status: 'Low', velocity: 45 },
      { name: 'Winter Jackets', movement: 203, category: 'Clothing', status: 'Medium', velocity: 68 }
    ],
    warehouseUtilization: [
      { warehouse: 'Main Warehouse', capacity: 10000, used: 8500, utilization: 85 },
      { warehouse: 'Branch A', capacity: 5000, used: 3200, utilization: 64 },
      { warehouse: 'Branch B', capacity: 5000, used: 4100, utilization: 82 },
      { warehouse: 'Branch C', capacity: 3000, used: 2700, utilization: 90 }
    ],
    reorderAlerts: [
      { item: 'iPhone Cases', currentStock: 15, reorderPoint: 20, supplier: 'TechSupply Co.', urgency: 'high' },
      { item: 'Coffee Filters', currentStock: 45, reorderPoint: 50, supplier: 'Kitchen Essentials', urgency: 'medium' },
      { item: 'Tennis Balls', currentStock: 8, reorderPoint: 15, supplier: 'Sports Direct', urgency: 'high' },
      { item: 'Plant Fertilizer', currentStock: 25, reorderPoint: 30, supplier: 'Garden Pro', urgency: 'low' }
    ]
  };
};

export default function InventoryAnalytics() {
  const [data, setData] = useState(generateInventoryData());
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateInventoryData());
      setLoading(false);
    }, 1000);
  };

  const inventoryMetrics = useMemo(() => {
    const totalStock = data.categoryOverview.reduce((sum, cat) => sum + cat.stock, 0);
    const totalLowStock = data.categoryOverview.reduce((sum, cat) => sum + cat.lowStock, 0);
    const totalOutOfStock = data.categoryOverview.reduce((sum, cat) => sum + cat.outOfStock, 0);
    const totalValue = data.categoryOverview.reduce((sum, cat) => sum + cat.value, 0);
    const avgTurnover = data.categoryOverview.reduce((sum, cat) => sum + cat.turnover, 0) / data.categoryOverview.length;
    const stockHealthScore = ((totalStock - totalLowStock - totalOutOfStock) / totalStock) * 100;
    
    return {
      totalStock,
      totalLowStock,
      totalOutOfStock,
      totalValue,
      avgTurnover,
      stockHealthScore,
      criticalItems: totalOutOfStock + totalLowStock
    };
  }, [data]);

  const MetricCard = ({ title, value, change, icon: Icon, color, format = 'number', status }) => {
    const formattedValue = format === 'currency' ? `$${value.toLocaleString()}` : 
                          format === 'percentage' ? `${value.toFixed(1)}%` : 
                          format === 'decimal' ? value.toFixed(1) : value.toLocaleString();
    
    const statusColor = status === 'good' ? 'text-green-600' : status === 'warning' ? 'text-yellow-600' : 'text-red-600';
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: color + '20' }}>
            <Icon size={24} style={{ color }} />
          </div>
          {status && (
            <div className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${statusColor}`}>
              {status === 'good' ? 'Healthy' : status === 'warning' ? 'Attention' : 'Critical'}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm font-medium">
                {Math.abs(change).toFixed(1)}% vs last month
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'High': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Low': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#8B5CF6" }}>
                <Package size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Analytics</h1>
                <p className="text-gray-600">Monitor stock levels, turnover rates, and inventory health</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Warehouses</option>
                <option value="main">Main Warehouse</option>
                <option value="branch-a">Branch A</option>
                <option value="branch-b">Branch B</option>
              </select>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="12m">Last 12 Months</option>
              </select>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Items"
            value={inventoryMetrics.totalStock}
            change={3.2}
            icon={Package}
            color="#8B5CF6"
            status="good"
          />
          <MetricCard
            title="Inventory Value"
            value={inventoryMetrics.totalValue}
            change={5.8}
            icon={DollarSign}
            color="#10B981"
            format="currency"
            status="good"
          />
          <MetricCard
            title="Stock Health Score"
            value={inventoryMetrics.stockHealthScore}
            change={-1.2}
            icon={Activity}
            color="#F59E0B"
            format="percentage"
            status={inventoryMetrics.stockHealthScore >= 80 ? "good" : inventoryMetrics.stockHealthScore >= 60 ? "warning" : "critical"}
          />
          <MetricCard
            title="Avg Turnover Rate"
            value={inventoryMetrics.avgTurnover}
            change={2.1}
            icon={TrendingUp}
            color="#3674B5"
            format="decimal"
            status="good"
          />
        </div>

        {/* Stock Distribution and Movement Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Level Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.stockLevels}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.stockLevels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {data.stockLevels.map((level, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: level.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{level.name}</span>
                  </div>
                  <span className="text-sm font-medium">{level.count} items</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Inventory Movement</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyMovement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.8}
                  name="Inbound"
                />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.8}
                  name="Outbound"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance and Warehouse Utilization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.categoryOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="stock" fill="#8B5CF6" name="In Stock" radius={[2, 2, 0, 0]} />
                <Bar dataKey="lowStock" fill="#F59E0B" name="Low Stock" radius={[2, 2, 0, 0]} />
                <Bar dataKey="outOfStock" fill="#EF4444" name="Out of Stock" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Warehouse Utilization</h3>
            <div className="space-y-4">
              {data.warehouseUtilization.map((warehouse, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{warehouse.warehouse}</span>
                    <span className="text-sm text-gray-600">{warehouse.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        warehouse.utilization >= 90 ? 'bg-red-500' : 
                        warehouse.utilization >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${warehouse.utilization}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Used: {warehouse.used.toLocaleString()}</span>
                    <span>Capacity: {warehouse.capacity.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Moving Items and Reorder Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Moving Items</h3>
            <div className="space-y-4">
              {data.topMovingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>{item.category}</span>
                      <span>{item.movement} units/month</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-sm font-medium px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    >
                      {item.status}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Velocity: {item.velocity}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Reorder Alerts</h3>
            <div className="space-y-4">
              {data.reorderAlerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{alert.item}</p>
                    <div className="text-sm text-gray-600">
                      <span>Stock: {alert.currentStock} | </span>
                      <span>Reorder: {alert.reorderPoint}</span>
                    </div>
                    <p className="text-xs text-gray-500">{alert.supplier}</p>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-xs font-medium px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: getUrgencyColor(alert.urgency) }}
                    >
                      {alert.urgency.charAt(0).toUpperCase() + alert.urgency.slice(1)}
                    </div>
                    {alert.urgency === 'high' && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle size={12} className="text-red-500" />
                        <span className="text-xs text-red-600">Urgent</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}