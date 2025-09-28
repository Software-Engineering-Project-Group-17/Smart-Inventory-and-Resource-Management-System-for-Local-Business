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
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Filter,
  RefreshCw,
  Target,
  Users,
  Clock
} from 'lucide-react';

// Sample sales data
const generateSalesData = () => {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  return {
    dailySales: days.map((date, i) => ({
      date: date.split('-').slice(1).join('/'),
      sales: Math.floor(Math.random() * 5000) + 2000,
      orders: Math.floor(Math.random() * 50) + 20,
      avgOrderValue: Math.floor(Math.random() * 100) + 50
    })),
    salesByCategory: [
      { category: 'Electronics', sales: 45000, orders: 180, growth: 12.5 },
      { category: 'Clothing', sales: 32000, orders: 240, growth: 8.2 },
      { category: 'Food & Beverages', sales: 18000, orders: 320, growth: -3.1 },
      { category: 'Home & Garden', sales: 28000, orders: 160, growth: 15.7 },
      { category: 'Sports & Outdoors', sales: 22000, orders: 140, growth: 5.8 }
    ],
    salesByChannel: [
      { name: 'Online', value: 60, amount: 85000, color: '#3674B5' },
      { name: 'In-Store', value: 35, amount: 49000, color: '#10B981' },
      { name: 'Phone Orders', value: 5, amount: 7000, color: '#F59E0B' }
    ],
    topSalespersons: [
      { name: 'John Smith', sales: 25000, orders: 85, target: 30000, performance: 83.3 },
      { name: 'Sarah Johnson', sales: 22000, orders: 78, target: 25000, performance: 88.0 },
      { name: 'Mike Chen', sales: 19000, orders: 65, target: 22000, performance: 86.4 },
      { name: 'Emily Davis', sales: 18000, orders: 72, target: 20000, performance: 90.0 },
      { name: 'David Wilson', sales: 16000, orders: 58, target: 18000, performance: 88.9 }
    ],
    hourlyPattern: Array.from({ length: 24 }, (_, hour) => ({
      hour: hour,
      sales: Math.floor(Math.random() * 1000) + 200,
      orders: Math.floor(Math.random() * 10) + 2
    }))
  };
};

export default function SalesAnalytics() {
  const [data, setData] = useState(generateSalesData());
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateSalesData());
      setLoading(false);
    }, 1000);
  };

  const salesMetrics = useMemo(() => {
    const totalSales = data.dailySales.reduce((sum, day) => sum + day.sales, 0);
    const totalOrders = data.dailySales.reduce((sum, day) => sum + day.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    const last7Days = data.dailySales.slice(-7);
    const previous7Days = data.dailySales.slice(-14, -7);
    
    const last7DaysSales = last7Days.reduce((sum, day) => sum + day.sales, 0);
    const previous7DaysSales = previous7Days.reduce((sum, day) => sum + day.sales, 0);
    const weeklyGrowth = previous7DaysSales > 0 ? ((last7DaysSales - previous7DaysSales) / previous7DaysSales) * 100 : 0;
    
    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      weeklyGrowth,
      conversionRate: 3.2,
      targetAchievement: 85.5
    };
  }, [data]);

  const MetricCard = ({ title, value, change, icon: Icon, color, format = 'number', target }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' ? `$${value.toLocaleString()}` : 
                          format === 'percentage' ? `${value.toFixed(1)}%` : value.toLocaleString();
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: color + '20' }}>
            <Icon size={24} style={{ color }} />
          </div>
          {target && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Target</div>
              <div className="text-sm font-medium">{format === 'currency' ? `$${target.toLocaleString()}` : target}</div>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm font-medium">
                {Math.abs(change).toFixed(1)}% vs last week
              </span>
            </div>
          )}
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
              <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#10B981" }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
                <p className="text-gray-600">Track sales performance and identify growth opportunities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="food">Food & Beverages</option>
              </select>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
            title="Total Sales"
            value={salesMetrics.totalSales}
            change={salesMetrics.weeklyGrowth}
            icon={DollarSign}
            color="#10B981"
            format="currency"
            target={120000}
          />
          <MetricCard
            title="Total Orders"
            value={salesMetrics.totalOrders}
            change={4.8}
            icon={ShoppingCart}
            color="#3674B5"
            target={1200}
          />
          <MetricCard
            title="Avg Order Value"
            value={salesMetrics.avgOrderValue}
            change={2.1}
            icon={Target}
            color="#F59E0B"
            format="currency"
          />
          <MetricCard
            title="Conversion Rate"
            value={salesMetrics.conversionRate}
            change={0.5}
            icon={TrendingUp}
            color="#8B5CF6"
            format="percentage"
          />
        </div>

        {/* Sales Trend and Channel Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Sales Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={data.dailySales.slice(-14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis yAxisId="left" stroke="#6b7280" tickFormatter={(value) => `$${value/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'sales') return [`${value.toLocaleString()}`, 'Sales'];
                    if (name === 'orders') return [value, 'Orders'];
                    return [value, name];
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  fill="#10B981"
                  fillOpacity={0.1}
                  stroke="#10B981"
                  strokeWidth={2}
                  name="sales"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3674B5"
                  strokeWidth={2}
                  dot={{ fill: '#3674B5', strokeWidth: 2, r: 4 }}
                  name="orders"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Channel</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.salesByChannel}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.salesByChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-4">
              {data.salesByChannel.map((channel, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: channel.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{channel.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${channel.amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{channel.value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Performance and Top Salespersons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6b7280" tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip formatter={(value) => [`${value.toLocaleString()}`, 'Sales']} />
                <Bar dataKey="sales" fill="#3674B5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Sales Performers</h3>
            <div className="space-y-4">
              {data.topSalespersons.map((person, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{person.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>${person.sales.toLocaleString()}</span>
                      <span>{person.orders} orders</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      person.performance >= 85 ? 'text-green-600' : 
                      person.performance >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {person.performance}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Target: ${person.target.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly Sales Pattern */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hourly Sales Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="hour" 
                stroke="#6b7280"
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis stroke="#6b7280" tickFormatter={(value) => `${value}`} />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Sales']}
                labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#F59E0B"
                fill="#F59E0B"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sales Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Goals</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly Target</span>
                  <span>{salesMetrics.targetAchievement.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(salesMetrics.targetAchievement, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">Target: $120,000</p>
                <p className="text-sm text-gray-600">Achieved: ${(120000 * salesMetrics.targetAchievement / 100).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Remaining: ${(120000 * (100 - salesMetrics.targetAchievement) / 100).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">Peak sales hours: 2PM - 4PM</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">Electronics category showing 12.5% growth</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">Online channel dominates with 60% share</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p className="text-sm text-gray-700">Average order value increased by 2.1%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Optimize Peak Hours</p>
                <p className="text-xs text-blue-600">Increase staff during 2-4PM for better service</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Focus on Electronics</p>
                <p className="text-xs text-green-600">Expand inventory in high-growth category</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Boost Food Sales</p>
                <p className="text-xs text-yellow-600">Address -3.1% decline with promotions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}