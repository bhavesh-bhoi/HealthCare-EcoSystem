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
} from "react-icons/fa";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import { pharmacyAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import FadeIn from "../../Components/Animations/FadeIn.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import BarChart from "../../Components/Charts/BarChart.jsx";
import toast from "react-hot-toast";

const PharmacyDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    fetchDashboardData();
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
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Orders",
      value: dashboardData?.overview?.totalOrders || 0,
      icon: FaBox,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Pending Orders",
      value: dashboardData?.overview?.pendingOrders || 0,
      icon: FaClock,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Delivered",
      value: dashboardData?.overview?.completedOrders || 0,
      icon: FaCheckCircle,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Revenue",
      value: `₹${dashboardData?.overview?.revenue || 0}`,
      icon: FaMoneyBillWave,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  const inventoryStats = [
    {
      label: "Total Items",
      value: dashboardData?.inventory?.totalItems || 0,
      icon: FaPills,
      color: "from-indigo-600 to-blue-600",
    },
    {
      label: "Low Stock",
      value: dashboardData?.inventory?.lowStock || 0,
      icon: FaExclamationTriangle,
      color: "from-orange-600 to-red-600",
    },
    {
      label: "Out of Stock",
      value: dashboardData?.inventory?.outOfStock || 0,
      icon: FaExclamationTriangle,
      color: "from-red-600 to-pink-600",
    },
  ];

  const chartData = {
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
        data: dashboardData?.monthlyTrend?.map((t) => t.count) || [],
        backgroundColor: "#0ea5e9",
      },
      {
        label: "Revenue",
        data: dashboardData?.monthlyTrend?.map((t) => t.revenue / 1000) || [],
        backgroundColor: "#14b8a6",
      },
    ],
  };

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl gradient-bg p-8 text-white">
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
                  <p className="text-3xl font-display font-bold text-secondary-800">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          </FadeIn>
        ))}
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {inventoryStats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.4 + index * 0.1}>
            <Card className="text-center">
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${stat.color} mb-3`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-display font-bold text-secondary-800">
                {stat.value}
              </p>
              <p className="text-sm text-secondary-600">{stat.label}</p>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Chart */}
      <FadeIn delay={0.5}>
        <Card>
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
            Monthly Performance
          </h2>
          <BarChart data={chartData} height={300} />
        </Card>
      </FadeIn>

      {/* Orders by Status */}
      <FadeIn delay={0.6}>
        <Card>
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
            Orders by Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {dashboardData?.ordersByStatus?.map((status) => (
              <div
                key={status._id}
                className="text-center p-4 bg-gray-50 rounded-xl"
              >
                <p className="text-2xl font-display font-bold text-primary-600">
                  {status.count}
                </p>
                <p className="text-sm text-secondary-600 capitalize">
                  {status._id.replace("_", " ")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      {/* Popular Medicines */}
      <FadeIn delay={0.7}>
        <Card>
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
            Popular Medicines
          </h2>
          <div className="space-y-3">
            {dashboardData?.popularMedicines?.map((medicine, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">{medicine.name}</span>
                </div>
                <span className="text-sm text-secondary-600">
                  {medicine.count} orders
                </span>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default PharmacyDashboard;
