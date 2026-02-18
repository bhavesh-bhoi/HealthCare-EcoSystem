import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaUserMd,
  FaHospital,
  FaCalendarCheck,
  FaBox,
  FaMoneyBillWave,
  FaChartLine,
  FaExclamationTriangle,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import { adminAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import FadeIn from "../../Components/Animations/FadeIn.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import BarChart from "../../Components/Charts/BarChart.jsx";
import PieChart from "../../Components/Charts/PieChart.jsx";
import toast from "react-hot-toast";

const AdminDashboard = () => {
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
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Users",
      value: dashboardData?.overview?.totalUsers || 0,
      icon: FaUsers,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Patients",
      value: dashboardData?.overview?.totalPatients || 0,
      icon: FaUserCheck,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Doctors",
      value: dashboardData?.overview?.totalDoctors || 0,
      icon: FaUserMd,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Pharmacies",
      value: dashboardData?.overview?.totalPharmacies || 0,
      icon: FaHospital,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const platformStats = [
    {
      label: "Appointments",
      value: dashboardData?.overview?.totalAppointments || 0,
      icon: FaCalendarCheck,
      color: "from-indigo-600 to-blue-600",
    },
    {
      label: "Orders",
      value: dashboardData?.overview?.totalOrders || 0,
      icon: FaBox,
      color: "from-teal-600 to-green-600",
    },
    {
      label: "Revenue",
      value: `₹${dashboardData?.overview?.revenue?.toLocaleString() || 0}`,
      icon: FaMoneyBillWave,
      color: "from-amber-600 to-orange-600",
    },
    {
      label: "Pending Approvals",
      value: dashboardData?.overview?.pendingApprovals || 0,
      icon: FaUserTimes,
      color: "from-red-600 to-pink-600",
    },
  ];

  const chartData = {
    appointments: {
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
          label: "Appointments",
          data: dashboardData?.trends?.appointments?.map((t) => t.count) || [],
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
          data: dashboardData?.trends?.revenue?.map((t) => t.total) || [],
          backgroundColor: "#14b8a6",
        },
      ],
    },
  };

  const pieData = {
    labels: ["Patients", "Doctors", "Pharmacies"],
    datasets: [
      {
        data: [
          dashboardData?.overview?.totalPatients || 0,
          dashboardData?.overview?.totalDoctors || 0,
          dashboardData?.overview?.totalPharmacies || 0,
        ],
        backgroundColor: ["#0ea5e9", "#14b8a6", "#a855f7"],
        borderWidth: 0,
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
              {greeting}, Admin {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Here's your platform overview and analytics.
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

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat, index) => (
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.6}>
          <Card>
            <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
              Appointment Trends
            </h2>
            <LineChart data={chartData.appointments} height={300} />
          </Card>
        </FadeIn>

        <FadeIn delay={0.7}>
          <Card>
            <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
              Revenue Trends
            </h2>
            <BarChart data={chartData.revenue} height={300} />
          </Card>
        </FadeIn>
      </div>

      {/* User Distribution & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn delay={0.8}>
          <Card>
            <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
              User Distribution
            </h2>
            <div className="h-64">
              <PieChart data={pieData} />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.9}>
          <Card className="lg:col-span-2">
            <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
              Recent Activities
            </h2>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {/* Recent Appointments */}
              {dashboardData?.recentActivities?.appointments?.map(
                (apt, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary-500" />
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">
                          {apt.patientId?.userId?.name}
                        </span>{" "}
                        booked an appointment with{" "}
                        <span className="font-medium">
                          Dr. {apt.doctorId?.userId?.name}
                        </span>
                      </p>
                      <p className="text-xs text-secondary-500">
                        {new Date(apt.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ),
              )}

              {/* Recent Orders */}
              {dashboardData?.recentActivities?.orders?.map((order, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-success-500" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">
                        {order.patientId?.userId?.name}
                      </span>{" "}
                      placed an order from{" "}
                      <span className="font-medium">
                        {order.pharmacyId?.userId?.name}
                      </span>
                    </p>
                    <p className="text-xs text-secondary-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Pending Approvals Alert */}
      {dashboardData?.overview?.pendingApprovals > 0 && (
        <FadeIn delay={1}>
          <Card className="bg-warning-50 border-warning-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <FaExclamationTriangle className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <p className="font-medium text-warning-800">
                    {dashboardData.overview.pendingApprovals} pending approvals
                  </p>
                  <p className="text-sm text-warning-600">
                    {dashboardData.overview.pendingApprovals} doctors and
                    pharmacies are waiting for verification
                  </p>
                </div>
              </div>
              <Button to="/admin/users">Review Now</Button>
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
};

export default AdminDashboard;
