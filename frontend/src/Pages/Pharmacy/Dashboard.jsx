import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaChartLine,
  FaMoneyBillWave,
  FaPills,
  FaUsers,
  FaShoppingCart,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaSearch,
  FaFilter,
} from "react-icons/fa";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import { pharmacyAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import FadeIn from "../../Components/Animations/FadeIn.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import BarChart from "../../Components/Charts/BarChart.jsx";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchOrders();
    fetchInventory();
    setGreeting(getGreeting());
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchDashboardData = async () => {
    try {
      const response = await pharmacyAPI.getAnalytics();
      console.log("Pharmacy dashboard data:", response.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await pharmacyAPI.getOrders();
      console.log("Pharmacy orders:", response.data);
      setOrders(response.data.data || []);
      setRecentOrders(response.data.data?.slice(0, 5) || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await pharmacyAPI.getInventory();
      console.log("Pharmacy inventory:", response.data);
      setInventory(response.data.data?.inventory || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter(
    (o) => o.status === "preparing",
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const outForDelivery = orders.filter(
    (o) => o.status === "out_for_delivery",
  ).length;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "completed")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((i) => i.stock < 10).length;
  const outOfStockItems = inventory.filter((i) => i.stock === 0).length;

  const expiringItems = inventory.filter((i) => {
    if (!i.expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: FaShoppingCart,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: "+12% this month",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: FaClock,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: "Awaiting action",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      icon: FaCheckCircle,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: "+8% this week",
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: "+15% vs last month",
    },
  ];

  const inventoryStats = [
    {
      label: "Total Items",
      value: totalItems,
      icon: FaPills,
      color: "from-indigo-600 to-blue-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      label: "Low Stock",
      value: lowStockItems,
      icon: FaExclamationTriangle,
      color: "from-orange-600 to-red-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Out of Stock",
      value: outOfStockItems,
      icon: FaExclamationTriangle,
      color: "from-red-600 to-pink-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "Expiring Soon",
      value: expiringItems,
      icon: FaClock,
      color: "from-yellow-600 to-amber-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
  ];

  const chartData = {
    orders: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Orders",
          data: [65, 59, 80, 81, 56, 55, 72, 85, 94, 102, 115, 128],
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    revenue: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Revenue (₹)",
          data: [
            45000, 52000, 48000, 61000, 58000, 63000, 72000, 81000, 89000,
            95000, 102000, 115000,
          ],
          backgroundColor: "#14b8a6",
        },
      ],
    },
  };

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-teal-600 p-8 text-white">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="relative z-10">
            <h1 className="text-3xl font-display font-bold mb-2">
              {greeting}, {user?.name}! 🏪
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Here's your pharmacy overview for today.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <FadeIn key={stat.label} delay={index * 0.1}>
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="card hover:shadow-medium"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-600 text-sm mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-display font-bold text-secondary-800">
                    {stat.value}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          </FadeIn>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/pharmacy/orders">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-blue-50 rounded-xl flex items-center justify-between cursor-pointer"
          >
            <div>
              <p className="text-blue-600 font-medium">View Orders</p>
              <p className="text-sm text-blue-500">{pendingOrders} pending</p>
            </div>
            <FaEye className="w-5 h-5 text-blue-500" />
          </motion.div>
        </Link>

        <Link to="/pharmacy/inventory">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-green-50 rounded-xl flex items-center justify-between cursor-pointer"
          >
            <div>
              <p className="text-green-600 font-medium">Manage Inventory</p>
              <p className="text-sm text-green-500">
                {lowStockItems} low stock
              </p>
            </div>
            <FaPills className="w-5 h-5 text-green-500" />
          </motion.div>
        </Link>

        <Link to="/pharmacy/delivery">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-purple-50 rounded-xl flex items-center justify-between cursor-pointer"
          >
            <div>
              <p className="text-purple-600 font-medium">Track Delivery</p>
              <p className="text-sm text-purple-500">
                {outForDelivery} out for delivery
              </p>
            </div>
            <FaTruck className="w-5 h-5 text-purple-500" />
          </motion.div>
        </Link>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventoryStats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.3 + index * 0.1}>
            <Card>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-secondary-600">{stat.label}</p>
                  <p className="text-xl font-display font-bold text-secondary-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.5}>
          <Card>
            <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
              Order Trends
            </h2>
            <LineChart data={chartData.orders} height={300} />
          </Card>
        </FadeIn>

        <FadeIn delay={0.6}>
          <Card>
            <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
              Revenue Trends
            </h2>
            <BarChart data={chartData.revenue} height={300} />
          </Card>
        </FadeIn>
      </div>

      {/* Recent Orders */}
      <FadeIn delay={0.7}>
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-semibold text-secondary-800">
              Recent Orders
            </h2>
            <Link
              to="/pharmacy/orders"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaBox className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        Order #{order.orderId?.slice(-8)}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.totalAmount}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "out_for_delivery"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-secondary-500 py-4">
                No recent orders
              </p>
            )}
          </div>
        </Card>
      </FadeIn>

      {/* Low Stock Alert */}
      {lowStockItems > 0 && (
        <FadeIn delay={0.8}>
          <Card className="bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">
                    {lowStockItems} items are running low on stock
                  </p>
                  <p className="text-sm text-orange-600">
                    {outOfStockItems} items are out of stock
                  </p>
                </div>
              </div>
              <Link to="/pharmacy/inventory">
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  Restock Now
                </button>
              </Link>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
};

export default PharmacyDashboard;
