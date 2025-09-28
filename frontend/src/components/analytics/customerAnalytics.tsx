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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Funnel,
  FunnelChart
} from 'recharts';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Heart,
  UserCheck,
  RefreshCw,
  Calendar,
  Target,
  Award
} from 'lucide-react';

// Sample customer data
const generateCustomerData = () => {
  return {
    customerSegments: [
      { segment: 'VIP Customers', count: 156, revenue: 125000, avgOrderValue: 280, color: '#8B5CF6' },
      { segment: 'Regular Customers', count: 842, revenue: 220000, avgOrderValue: 95, color: '#3674B5' },
      { segment: 'Occasional Buyers', count: 1205, revenue: 85000, avgOrderValue: 45, color: '#10B981' },
      { segment: 'One-time Buyers', count: 324, revenue: 15000, avgOrderValue: 35, color: '#F59E0B' }
    ],
    customerLifecycle: [
      { stage: 'Awareness', customers: 10000, conversion: 15 },
      { stage: 'Interest', customers: 1500, conversion: 35 },
      { stage: 'Consideration', customers: 525, conversion: 60 },
      { stage: 'Purchase', customers: 315, conversion: 80 },
      { stage: 'Retention', customers: 252, conversion: 70 },
      { stage: 'Advocacy', customers: 176, conversion: 85 }
    ],
    monthlyAcquisition: Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i).toLocaleDateString('en', { month: 'short' });
      return {
        month,
        newCustomers: Math.floor(Math.random() * 150) + 50,
        returningCustomers: Math.floor(Math.random() * 300) + 200,
        churnedCustomers: Math.floor(Math.random() * 50) + 20
      };
    }),
    ageDistribution: [
      { ageGroup: '18-25', customers: 285, percentage: 18, spending: 45000 },
      { ageGroup: '26-35', customers: 456, percentage: 28, spending: 125000 },
      { ageGroup: '36-45', customers: 378, percentage: 24, spending: 165000 },
      { ageGroup: '46-55', customers: 295, percentage: 19, spending: 98000 },
      { ageGroup: '56+', customers: 213, percentage: 11, spending: 67000 }
    ],
    customerBehavior: [
      { behavior: 'Purchase Frequency', score: 75 },
      { behavior: 'Brand Loyalty', score: 68 },
      { behavior: 'Price Sensitivity', score: 45 },
      { behavior: 'Product Diversity', score: 82 },
      { behavior: 'Seasonal Shopping', score: 58 },
      { behavior: 'Online Engagement', score: 91 }
    ],
    topCustomers: [
      { name: 'Alice Johnson', totalSpent: 8500, orders: 24, avgOrder: 354, lastPurchase: '2 days ago', segment: 'VIP' },
      { name: 'Bob Smith', totalSpent: 7200, orders: 18, avgOrder: 400, lastPurchase: '1 week ago', segment: 'VIP' },
      { name: 'Carol Davis', totalSpent: 6800, orders: 31, avgOrder: 219, lastPurchase: '3 days ago', segment: 'VIP' },
      { name: 'David Wilson', totalSpent: 5900, orders: 15, avgOrder: 393, lastPurchase: '5 days ago', segment: 'VIP' },
      { name: 'Eva Martinez', totalSpent: 5400, orders: 22, avgOrder: 245, lastPurchase: '1 day ago', segment: 'VIP' }
    ],
    retentionCohort: Array.from({ length: 6 }, (_, i) => ({
      cohort: `Month ${i + 1}`,
      retention: Math.max(100 - i * 15 - Math.random() * 10, 20)
    }))
  };
};

export default function CustomerAnalytics() {
  const [data, setData] = useState(generateCustomerData());
  const [selectedPeriod, setSelectedPeriod] = useState('12m');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    setTimeout(() => {
      setData(generateCustomerData());
      setLoading(false);
    }, 1000);
  };

  const customerMetrics = useMemo(() => {
    const totalCustomers = data.customerSegments.reduce((sum, seg) => sum + seg.count, 0);
    const totalRevenue = data.customerSegments.reduce((sum, seg) => sum + seg.revenue, 0);
    const avgCustomerValue = totalRevenue / totalCustomers;
    
    const newCustomers = data.monthlyAcquisition.reduce((sum, month) => sum + month.newCustomers, 0);
    const churnedCustomers = data.monthlyAcquisition.reduce((sum, month) => sum + month.churnedCustomers, 0);
    const retentionRate = ((totalCustomers - churnedCustomers) / totalCustomers) * 100;
    
    const vipCustomers = data.customerSegments.find(seg => seg.segment === 'VIP Customers');
    const vipRevenue = vipCustomers ? (vipCustomers.revenue / totalRevenue) * 100 : 0;
    
    return {
      totalCustomers,
      totalRevenue,
      avgCustomerValue,
      newCustomers,
      retentionRate,
      vipRevenue,
      customerGrowth: 8.5
    };
  }, [data]);

  const MetricCard = ({ title, value, change, icon: Icon, color, format = 'number', subtitle }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' ? `$${value.toLocaleString()}` : 
                          format === 'percentage' ? `${value.toFixed(1)}%` : value.toLocaleString();
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-lg" style={{ backgroundColor: color + '20' }}>
            <Icon size={24} style={{ color }} />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
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
              <div className="p-3 rounded-xl text-white" style={{ backgroundColor: "#F59E0B" }}>
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Analytics</h1>
                <p className="text-gray-600">Understand customer behavior, segments, and lifetime value</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Segments</option>
                <option value="vip">VIP Customers</option>
                <option value="regular">Regular Customers</option>
                <option value="occasional">Occasional Buyers</option>
              </select>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="3m">Last 3 Months</option>
                <option value="6m">Last 6 Months</option>
                <option value="12m">Last 12 Months</option>
              </select>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
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
            title="Total Customers"
            value={customerMetrics.totalCustomers}
            change={customerMetrics.customerGrowth}
            icon={Users}
            color="#F59E0B"
            subtitle="Active customer base"
          />
          <MetricCard
            title="Customer Revenue"
            value={customerMetrics.totalRevenue}
            change={12.3}
            icon={DollarSign}
            color="#10B981"
            format="currency"
            subtitle="Total customer value"
          />
          <MetricCard
            title="Avg Customer Value"
            value={customerMetrics.avgCustomerValue}
            change={5.7}
            icon={Target}
            color="#3674B5"
            format="currency"
            subtitle="Revenue per customer"
          />
          <MetricCard
            title="Retention Rate"
            value={customerMetrics.retentionRate}
            change={2.1}
            icon={Heart}
            color="#8B5CF6"
            format="percentage"
            subtitle="Customer loyalty score"
          />
        </div>

        {/* Customer Segments and Acquisition Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Segments</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.customerSegments}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {data.customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Customers']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {data.customerSegments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{segment.segment}</span>
                  </div>
                  <span className="text-sm font-medium">{segment.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Acquisition Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.monthlyAcquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="newCustomers"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.8}
                  name="New Customers"
                />
                <Area
                  type="monotone"
                  dataKey="returningCustomers"
                  stackId="1"
                  stroke="#3674B5"
                  fill="#3674B5"
                  fillOpacity={0.8}
                  name="Returning Customers"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution and Customer Behavior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Demographics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.ageDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="ageGroup" type="category" stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="customers" fill="#F59E0B" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Behavior Profile</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data.customerBehavior}>
                <PolarGrid />
                <PolarAngleAxis dataKey="behavior" className="text-xs" />
                <PolarRadiusAxis angle={60} domain={[0, 100]} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers and Retention Cohort */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Customers</h3>
            <div className="space-y-4">
              {data.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{customer.orders} orders</span>
                        <span>Avg: ${customer.avgOrder}</span>
                        <span>Last: {customer.lastPurchase}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${customer.totalSpent.toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      <Award size={12} className="text-purple-600" />
                      <span className="text-xs text-purple-600">{customer.segment}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Retention Cohort</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.retentionCohort}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="cohort" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Retention Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="retention" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">1-Month Retention</span>
                <span className="font-medium">85.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">6-Month Retention</span>
                <span className="font-medium">42.8%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">12-Month Retention</span>
                <span className="font-medium">28.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}