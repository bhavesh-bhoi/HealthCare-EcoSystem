import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarCheck,
  FaUserInjured,
  FaClock,
  FaVideo,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
  FaStar,
  FaUsers,
} from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import { doctorAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import FadeIn from "../../Components/Animations/FadeIn.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import toast from "react-hot-toast";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [availability, setAvailability] = useState(true);

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
      const response = await doctorAPI.getAnalytics();
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      await doctorAPI.setAvailability({ isAvailable: !availability });
      setAvailability(!availability);
      toast.success(
        `You are now ${!availability ? "available" : "unavailable"}`,
      );
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const stats = [
    {
      label: "Today's Appointments",
      value: dashboardData?.overview?.todayAppointments || 0,
      icon: FaCalendarCheck,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Total Patients",
      value: dashboardData?.overview?.uniquePatients || 0,
      icon: FaUsers,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Pending Appointments",
      value: dashboardData?.overview?.pendingAppointments || 0,
      icon: MdPendingActions,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Completed",
      value: dashboardData?.overview?.completedAppointments || 0,
      icon: FaCheckCircle,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
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
        label: "Appointments",
        data: dashboardData?.monthlyTrend?.map((t) => t.count) || [],
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        fill: true,
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
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">
                {greeting}, Dr. {user?.name}! 👨‍⚕️
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Here's your practice summary for today.
              </p>
            </div>

            {/* Availability Toggle */}
            <button
              onClick={toggleAvailability}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                availability
                  ? "bg-success-500 text-white hover:bg-success-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full ${availability ? "bg-white animate-pulse" : "bg-gray-500"}`}
              />
              <span>{availability ? "Available" : "Unavailable"}</span>
            </button>
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

      {/* Rating Card */}
      <FadeIn delay={0.4}>
        <Card className="bg-gradient-to-r from-primary-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-xl">
                <FaStar className="w-6 h-6 text-warning-500" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Your Rating</p>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-display font-bold text-secondary-800">
                    {dashboardData?.rating?.toFixed(1)}
                  </span>
                  <span className="text-secondary-500">/ 5.0</span>
                </div>
              </div>
            </div>
            <p className="text-secondary-600">
              Based on {dashboardData?.totalReviews} reviews
            </p>
          </div>
        </Card>
      </FadeIn>

      {/* Chart */}
      <FadeIn delay={0.5}>
        <Card>
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
            Appointment Trends
          </h2>
          <LineChart data={chartData} height={300} />
        </Card>
      </FadeIn>

      {/* Appointments by Mode */}
      <FadeIn delay={0.6}>
        <Card>
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
            Appointments by Mode
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {dashboardData?.appointmentsByMode?.map((mode) => (
              <div
                key={mode._id}
                className="text-center p-4 bg-gray-50 rounded-xl"
              >
                <p className="text-2xl font-display font-bold text-primary-600">
                  {mode.count}
                </p>
                <p className="text-sm text-secondary-600 capitalize">
                  {mode._id}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default DoctorDashboard;
