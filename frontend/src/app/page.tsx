"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Package,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Building,
  TrendingUp,
  UserCheck,
  ShoppingCart,
  Truck,
  Bell,
  QrCode,
  CreditCard,
  FileText,
  Settings,
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Package className="h-8 w-8" />,
      title: "Smart Inventory Management",
      description:
        "Real-time inventory tracking with automated low-stock alerts and barcode scanning capabilities.",
      details: [
        "Barcode generation & scanning",
        "Low stock threshold alerts",
        "Multi-branch inventory sync",
        "Automated restock requests",
      ],
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-Role User Management",
      description:
        "Comprehensive role-based access control for owners, managers, staff, customers, and suppliers.",
      details: [
        "Owner dashboard",
        "Branch manager controls",
        "Staff access levels",
        "Customer & supplier portals",
      ],
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description:
        "Detailed business insights with sales analytics, customer behavior, and performance metrics.",
      details: [
        "Sales performance tracking",
        "Customer analytics",
        "Inventory turnover reports",
        "Revenue forecasting",
      ],
    },
    {
      icon: <Building className="h-8 w-8" />,
      title: "Multi-Branch Operations",
      description:
        "Seamlessly manage multiple store locations with centralized control and branch-specific data.",
      details: [
        "Centralized branch management",
        "Location-specific inventory",
        "Branch performance metrics",
        "Staff assignment per branch",
      ],
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "E-commerce Integration",
      description:
        "Built-in customer ordering system with payment processing and order management.",
      details: [
        "Online customer orders",
        "Stripe payment integration",
        "Order status tracking",
        "Customer loyalty points",
      ],
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Supplier Management",
      description:
        "Complete supplier ecosystem with order management and communication tools.",
      details: [
        "Supplier registration",
        "Purchase order management",
        "Supplier performance tracking",
        "Communication portal",
      ],
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Real-time Notifications",
      description:
        "Stay updated with instant notifications for important business events and alerts.",
      details: [
        "Low stock alerts",
        "Order notifications",
        "System updates",
        "Performance alerts",
      ],
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Enterprise Security",
      description:
        "Firebase-powered authentication with role-based access control and data protection.",
      details: [
        "Firebase authentication",
        "Role-based permissions",
        "Secure API endpoints",
        "Data encryption",
      ],
    },
    {
      icon: <QrCode className="h-8 w-8" />,
      title: "Barcode System",
      description:
        "Generate and scan barcodes for efficient inventory management and sales processing.",
      details: [
        "QR code generation",
        "Barcode scanning",
        "Product identification",
        "Quick checkout process",
      ],
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Payment Processing",
      description:
        "Integrated Stripe payment system for secure online transactions and payment tracking.",
      details: [
        "Stripe integration",
        "Secure payments",
        "Payment history",
        "Refund management",
      ],
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Report Generation",
      description:
        "Comprehensive reporting system with PDF generation and business intelligence.",
      details: [
        "Sales reports",
        "Inventory reports",
        "PDF generation",
        "Custom analytics",
      ],
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Mobile Responsive",
      description:
        "Fully responsive design that works perfectly on all devices and screen sizes.",
      details: [
        "Mobile-first design",
        "Touch-friendly interface",
        "Offline capabilities",
        "Progressive web app",
      ],
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Store Owner",
      content:
        "This system transformed our inventory management. We reduced stock-outs by 80% and increased efficiency dramatically.",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Branch Manager",
      content:
        "The multi-branch functionality is amazing. I can manage three locations from a single dashboard effortlessly.",
      rating: 5,
    },
    {
      name: "Lisa Rodriguez",
      role: "Operations Director",
      content:
        "The analytics and reporting features provide insights we never had before. Game-changing for our business decisions.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3674B5]/10 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Image
                    src="/logo.png"
                    alt="Build Mate"
                    className="h-15 w-auto"
                    width={120}
                    height={120}
                  />
                </div>
              </div>
              {/* <span className="text-xl font-bold text-gray-900">Buld Mate</span> */}
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-[#3674B5] transition-colors"
              >
                Features
              </a>
              <a
                href="#benefits"
                className="text-gray-600 hover:text-[#3674B5] transition-colors"
              >
                Benefits
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-[#3674B5] transition-colors"
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-[#3674B5] transition-colors"
              >
                Contact
              </a>
              <Link
                href="/login"
                className="bg-[#3674B5] text-white px-4 py-2 rounded-lg hover:bg-[#2d5a91] transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Smart Inventory &
              <span className="bg-gradient-to-r from-[#3674B5] to-purple-600 bg-clip-text text-transparent">
                {" "}
                Resource Management
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your local business with our comprehensive inventory
              management system. Track inventory, manage multiple branches,
              analyze sales, and grow your business with powerful automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-[#3674B5] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#2d5a91] transition-colors flex items-center justify-center"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="bg-[#3674B5] rounded-full p-3">
            <Package className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="absolute top-32 right-16 animate-bounce delay-1000">
          <div className="bg-purple-500 rounded-full p-3">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-bounce delay-500">
          <div className="bg-green-500 rounded-full p-3">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your inventory, staff, customers,
              and business operations in one comprehensive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow group"
              >
                <div className="text-[#3674B5] mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, idx) => (
                    <li
                      key={idx}
                      className="flex items-center text-sm text-gray-500"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section
        id="benefits"
        className="py-24 bg-gradient-to-r from-[#3674B5] to-purple-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our System?</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Join hundreds of successful businesses that have transformed their
              operations with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-lg opacity-90">Uptime Reliability</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">50%</div>
              <div className="text-lg opacity-90">Cost Reduction</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">3x</div>
              <div className="text-lg opacity-90">Faster Operations</div>
            </div>
            <div className="text-center text-white">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-lg opacity-90">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-gray-600">
              Trusted by business owners and managers worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center">
                  <div className="bg-gray-300 rounded-full h-12 w-12 flex items-center justify-center mr-4">
                    <UserCheck className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600">
              Contact us to schedule a demo and receive your owner credentials
            </p>
          </div>

          <div className="bg-gradient-to-r from-[#3674B5] to-purple-700 rounded-3xl p-12 text-white text-center">
            <div className="mb-8">
              <Settings className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4">
                Schedule Your Business Meeting
              </h3>
              <p className="text-xl opacity-90 mb-8">
                During our business meeting, we&apos;ll provide you with
                complete owner credentials and guide you through the system
                setup process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/10 rounded-2xl p-6">
                <h4 className="text-xl font-semibold mb-4">
                  What You&apos;ll Get:
                </h4>
                <ul className="text-left space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-300" />
                    Complete system demo
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-300" />
                    Owner account credentials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-300" />
                    Staff training session
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-3 text-green-300" />
                    Implementation support
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-2xl p-6">
                <h4 className="text-xl font-semibold mb-4">
                  Contact Information:
                </h4>
                <div className="text-left space-y-3">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 mr-3" />
                    <span>www.buildmate.com</span>
                  </div>
                  <div className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-3" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <UserCheck className="h-5 w-5 mr-3" />
                    <span>contact@buildmate.com</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button className="w-full sm:w-auto bg-white text-[#3674B5] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
                Schedule Demo
              </button>
              <button className="w-full sm:w-auto border border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors">
                Request Quote
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-8 w-8 text-[#3674B5]" />
                <span className="text-xl font-bold">Smart Inventory</span>
              </div>
              <p className="text-gray-400 mb-4">
                The complete inventory and resource management solution for
                local businesses. Streamline operations, boost efficiency, and
                grow your business.
              </p>
              <div className="flex space-x-4">
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="bg-gray-800 p-2 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Inventory Management</li>
                <li>Multi-Branch Support</li>
                <li>User Management</li>
                <li>Analytics & Reports</li>
                <li>Payment Integration</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Training</li>
                <li>24/7 Support</li>
                <li>System Updates</li>
                <li>Business Meetings</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Smart Inventory Management System. All rights
              reserved.
            </p>
            <p className="mt-2">
              Built for local businesses, designed for growth.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
