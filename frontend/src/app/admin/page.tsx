import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Products",
      value: "1,234",
      icon: Package,
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Active Orders",
      value: "89",
      icon: ShoppingCart,
      change: "+5.2%",
      changeType: "positive",
    },
    {
      title: "Total Users",
      value: "456",
      icon: Users,
      change: "+8.1%",
      changeType: "positive",
    },
    {
      title: "Revenue",
      value: "$12,345",
      icon: TrendingUp,
      change: "+15.3%",
      changeType: "positive",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="text-primaryColor" size={28} />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-textDark">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-textLight">
            Welcome to your inventory management system
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-4 md:p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-textLight truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl md:text-2xl font-bold text-textDark">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className="p-2 md:p-3 bg-primaryColor/10 rounded-full flex-shrink-0">
                  <Icon className="text-primaryColor" size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-textDark mb-4">
            Recent Activity
          </h3>
          <p className="text-textLight">
            Recent activity feed will be displayed here...
          </p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-textDark mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base">
              Add New Product
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base">
              Process Orders
            </button>
            <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
