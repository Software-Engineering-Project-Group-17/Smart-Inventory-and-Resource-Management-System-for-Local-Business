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
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Sample data - In production, this would come from your API
const generateSampleData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  return {
    revenue: months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 50000) + 20000,
      orders: Math.floor(Math.random() * 200) + 100,
      customers: Math.floor(Math.random() * 150) + 80
    })),
    inventory: [
      { category: 'Electronics', stock: 85, lowStock: 12, value: 45000 },
      { category: 'Clothing', stock: 120, lowStock: 8, value: 32000 },
      { category: 'Food & Beverages', stock: 200, lowStock: 25, value: 18000 },
      { category: 'Home & Garden', stock: 95, lowStock: 15, value: 28000 },
      { category: 'Sports & Outdoors', stock: 75, lowStock: 10, value: 22000 }
    ],
    orderStatus: [
      { name: 'Completed', value: 65, color: '#10B981' },
      { name: 'Processing', value: 20, color: '#F59E0B' },
      { name: 'Pending', value: 12, color: '#EF4444' },
      { name: 'Cancelled', value: 3, color: '#6B7280' }
    ],
    topProducts: [
      { name: 'Wireless Headphones', sales: 145, revenue: 14500 },
      { name: 'Smart Watch', sales: 120, revenue: 24000 },
      { name: 'Laptop Stand', sales: 98, revenue: 4900 },
      { name: 'USB Cable', sales: 200, revenue: 3000 },
      { name: 'Phone Case', sales: 175, revenue: 5250 }
    ]
  };
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState(generateSampleData());
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [loading, setLoading] = useState(false);

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setData(generateSampleData());
      setLoading(false);
    }, 1000);
  };

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = data.revenue.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.revenue.reduce((sum, item) => sum + item.orders, 0);
    const totalCustomers = data.revenue.reduce((sum, item) => sum + item.customers, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const currentMonth = data.revenue[data.revenue.length - 1];
    const previousMonth = data.revenue[data.revenue.length - 2];
    const revenueGrowth = previousMonth ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0;
    
    const totalStock = data.inventory.reduce((sum, item) => sum + item.stock, 0);
    const totalLowStock = data.inventory.reduce((sum, item) => sum + item.lowStock, 0);
    const stockHealthPercent = totalStock > 0 ? ((totalStock - totalLowStock) / totalStock) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      revenueGrowth,
      stockHealthPercent,
      lowStockCount: totalLowStock
    };
  }, [data]);

  const MetricCard = ({ title, value, change, icon: Icon, color, format = 'number' }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' ? `$${value.toLocaleString()}` : 
                          format === 'percentage' ? `${value.toFixed(1)}%` : value.toLocaleString();
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-sm font-medium">
                  {Math.abs(change).toFixed(1)}% from last month
                </span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: color + '20' }}>
            <Icon size={24} style={{ color }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#3674B5" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
                <p className="text-gray-600">Real-time insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1m">Last Month</option>
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
            title="Total Revenue"
            value={metrics.totalRevenue}
            change={metrics.revenueGrowth}
            icon={DollarSign}
            color="#10B981"
            format="currency"
          />
          <MetricCard
            title="Total Orders"
            value={metrics.totalOrders}
            change={5.2}
            icon={ShoppingCart}
            color="#3674B5"
          />
          <MetricCard
            title="Active Customers"
            value={metrics.totalCustomers}
            change={8.1}
            icon={Users}
            color="#F59E0B"
          />
          <MetricCard
            title="Stock Health"
            value={metrics.stockHealthPercent}
            change={-2.3}
            icon={Package}
            color={metrics.stockHealthPercent >= 80 ? "#10B981" : "#EF4444"}
            format="percentage"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                Revenue
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#374151' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3674B5"
                  fill="#3674B5"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Status Distribution</h3>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.orderStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.orderStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {data.orderStatus.map((status, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {status.name}: {status.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Inventory Status */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Status by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.inventory} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="category" type="category" stroke="#6b7280" width={100} />
                <Tooltip />
                <Bar dataKey="stock" fill="#10B981" name="In Stock" />
                <Bar dataKey="lowStock" fill="#EF4444" name="Low Stock" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Products</h3>
            <div className="space-y-4">
              {data.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600">{product.sales} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders and Customer Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Orders & Customer Growth</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#3674B5" 
                strokeWidth={2}
                dot={{ fill: '#3674B5', strokeWidth: 2, r: 4 }}
                name="Orders"
              />
              <Line 
                type="monotone" 
                dataKey="customers" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Customers"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="text-red-600 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-red-800">Low Stock Alert</p>
                  <p className="text-sm text-red-600">{metrics.lowStockCount} items below restock threshold</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-green-800">Revenue Goal Achieved</p>
                  <p className="text-sm text-green-600">Monthly target exceeded by 12%</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <TrendingUp className="text-yellow-600 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-yellow-800">Customer Growth</p>
                  <p className="text-sm text-yellow-600">8% increase in new customers this month</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Order Value</span>
                <span className="font-semibold">${metrics.avgOrderValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Order Completion Rate</span>
                <span className="font-semibold text-green-600">97.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Retention</span>
                <span className="font-semibold text-blue-600">84.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inventory Turnover</span>
                <span className="font-semibold">6.2x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-semibold text-green-600">23.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}