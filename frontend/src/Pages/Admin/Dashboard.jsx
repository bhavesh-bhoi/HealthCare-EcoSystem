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
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaDownload,
  FaFilter,
  FaSync,
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
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState({
    doctors: [],
    pharmacies: [],
    patients: [],
  });
  const [greeting, setGreeting] = useState("");
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    setGreeting(getGreeting());
  }, [period]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      console.log("Admin dashboard data:", response.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const fetchUsers = async () => {
    try {
      const [doctorsRes, pharmaciesRes, patientsRes] = await Promise.all([
        adminAPI.getDoctors(),
        adminAPI.getPharmacies(),
        adminAPI.getPatients(),
      ]);

      setUsers({
        doctors: doctorsRes.data.data || [],
        pharmacies: pharmaciesRes.data.data || [],
        patients: patientsRes.data.data || [],
      });
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real stats
  const totalUsers =
    users.doctors.length + users.pharmacies.length + users.patients.length;
  const pendingDoctors = users.doctors.filter((d) => !d.isVerified).length;
  const pendingPharmacies = users.pharmacies.filter(
    (p) => !p.isVerified,
  ).length;
  const activeUsers =
    users.doctors.filter((d) => d.userId?.isActive).length +
    users.pharmacies.filter((p) => p.userId?.isActive).length +
    users.patients.filter((p) => p.userId?.isActive).length;

  // Mock revenue data - replace with actual API data
  const totalRevenue = 1250000;
  const revenueChange = 15.5;
  const appointmentsToday = 45;
  const ordersToday = 32;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: FaUsers,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: "+12% this month",
    },
    {
      label: "Active Users",
      value: activeUsers,
      icon: FaUserCheck,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: "95% active rate",
    },
    {
      label: "Pending Approvals",
      value: pendingDoctors + pendingPharmacies,
      icon: FaUserTimes,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: `${pendingDoctors} doctors, ${pendingPharmacies} pharmacies`,
    },
    {
      label: "Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: FaMoneyBillWave,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: `+${revenueChange}% vs last month`,
    },
  ];

  const userStats = [
    {
      label: "Doctors",
      value: users.doctors.length,
      icon: FaUserMd,
      color: "from-green-600 to-emerald-600",
    },
    {
      label: "Patients",
      value: users.patients.length,
      icon: FaUsers,
      color: "from-blue-600 to-cyan-600",
    },
    {
      label: "Pharmacies",
      value: users.pharmacies.length,
      icon: FaHospital,
      color: "from-purple-600 to-pink-600",
    },
  ];

  const chartData = {
    users: {
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
          label: "New Users",
          data: [45, 52, 68, 74, 85, 92, 105, 118, 132, 145, 158, 172],
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
            450000, 520000, 580000, 610000, 680000, 720000, 810000, 890000,
            950000, 1020000, 1150000, 1250000,
          ],
          backgroundColor: "#14b8a6",
        },
      ],
    },
    distribution: {
      labels: ["Doctors", "Patients", "Pharmacies"],
      datasets: [
        {
          data: [
            users.doctors.length,
            users.patients.length,
            users.pharmacies.length,
          ],
          backgroundColor: ["#0ea5e9", "#14b8a6", "#a855f7"],
          borderWidth: 0,
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

      {/* Quick Stats */}
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

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {userStats.map((stat, index) => (
          <FadeIn key={stat.label} delay={0.2 + index * 0.1}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-600 text-sm mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-display font-bold text-secondary-800">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-r ${stat.color} text-white`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FadeIn delay={0.3}>
          <Card>
            <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
              Today's Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FaCalendarCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm">Appointments Today</span>
                </div>
                <span className="text-xl font-display font-bold text-blue-600">
                  {appointmentsToday}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FaBox className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm">Orders Today</span>
                </div>
                <span className="text-xl font-display font-bold text-green-600">
                  {ordersToday}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FaUserCheck className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm">New Users Today</span>
                </div>
                <span className="text-xl font-display font-bold text-purple-600">
                  12
                </span>
              </div>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card>
            <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
              Pending Approvals
            </h2>
            <div className="space-y-4">
              <Link to="/admin/users?filter=pending&role=doctors">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FaUserMd className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Doctors</p>
                      <p className="text-sm text-orange-600">
                        Awaiting verification
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-display font-bold text-orange-600">
                    {pendingDoctors}
                  </span>
                </div>
              </Link>

              <Link to="/admin/users?filter=pending&role=pharmacies">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <FaHospital className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Pharmacies</p>
                      <p className="text-sm text-orange-600">
                        Awaiting verification
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-display font-bold text-orange-600">
                    {pendingPharmacies}
                  </span>
                </div>
              </Link>
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.5}>
          <Card>
            <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
              User Growth
            </h2>
            <LineChart data={chartData.users} height={300} />
          </Card>
        </FadeIn>

        <FadeIn delay={0.6}>
          <Card>
            <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
              Revenue Trend
            </h2>
            <BarChart data={chartData.revenue} height={300} />
          </Card>
        </FadeIn>
      </div>

      {/* Distribution and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeIn delay={0.7}>
          <Card>
            <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
              User Distribution
            </h2>
            <div className="h-64">
              <PieChart data={chartData.distribution} />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1" />
                <p className="text-xs text-secondary-600">Doctors</p>
                <p className="font-medium">{users.doctors.length}</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-teal-500 rounded-full mx-auto mb-1" />
                <p className="text-xs text-secondary-600">Patients</p>
                <p className="font-medium">{users.patients.length}</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1" />
                <p className="text-xs text-secondary-600">Pharmacies</p>
                <p className="font-medium">{users.pharmacies.length}</p>
              </div>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.8}>
          <Card className="lg:col-span-2">
            <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
              Recent Activities
            </h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {/* Recent Appointments */}
              {dashboardData?.recentActivities?.appointments?.map(
                (apt, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                    <div className="flex-1">
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
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                  <div className="flex-1">
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

              {/* New Users */}
              {users.doctors.slice(0, 2).map((doctor, index) => (
                <div
                  key={`doctor-${index}`}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm">
                      New doctor registered:{" "}
                      <span className="font-medium">
                        Dr. {doctor.userId?.name}
                      </span>
                    </p>
                    <p className="text-xs text-secondary-500">
                      {new Date(doctor.userId?.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Platform Health */}
      <FadeIn delay={0.9}>
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Platform Health
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 mb-1">System Status</p>
              <p className="text-lg font-display font-semibold text-green-700">
                Operational
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Response Time</p>
              <p className="text-lg font-display font-semibold text-blue-700">
                245ms
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 mb-1">Uptime</p>
              <p className="text-lg font-display font-semibold text-purple-700">
                99.9%
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 mb-1">Active Sessions</p>
              <p className="text-lg font-display font-semibold text-orange-700">
                1,245
              </p>
            </div>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default AdminDashboard;
