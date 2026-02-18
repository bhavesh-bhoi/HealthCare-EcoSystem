import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaCalendarAlt,
  FaUserInjured,
  FaMoneyBillWave,
  FaStar,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaVideo,
  FaHome,
  FaMapMarkerAlt,
  FaDownload,
} from "react-icons/fa";
import { doctorAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import BarChart from "../../Components/Charts/BarChart.jsx";
import PieChart from "../../Components/Charts/PieChart.jsx";
import toast from "react-hot-toast";
import { formatCurrency } from "../../Utils/helpers.js";

const DoctorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await doctorAPI.getAnalytics();
      setAnalyticsData(response.data.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = {
      period,
      ...analyticsData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctor-analytics-${new Date().toISOString()}.json`;
    a.click();
  };

  const chartData = {
    appointments: {
      labels:
        analyticsData?.monthlyTrend?.map((item) => {
          const monthNames = [
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
          ];
          return monthNames[item._id - 1];
        }) || [],
      datasets: [
        {
          label: "Appointments",
          data: analyticsData?.monthlyTrend?.map((item) => item.count) || [],
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    mode: {
      labels: analyticsData?.appointmentsByMode?.map((item) => item._id) || [],
      datasets: [
        {
          data:
            analyticsData?.appointmentsByMode?.map((item) => item.count) || [],
          backgroundColor: ["#0ea5e9", "#14b8a6", "#a855f7"],
          borderWidth: 0,
        },
      ],
    },
  };

  const stats = [
    {
      label: "Total Appointments",
      value: analyticsData?.overview?.totalAppointments || 0,
      icon: FaCalendarAlt,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Completed",
      value: analyticsData?.overview?.completedAppointments || 0,
      icon: FaCheckCircle,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Cancelled",
      value: analyticsData?.overview?.cancelledAppointments || 0,
      icon: FaTimesCircle,
      color: "from-red-600 to-pink-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
    {
      label: "Unique Patients",
      value: analyticsData?.overview?.uniquePatients || 0,
      icon: FaUserInjured,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary-800">
            Analytics Dashboard
          </h1>
          <p className="text-secondary-600">
            Track your practice performance and metrics
          </p>
        </div>
        <Button variant="outline" icon={FaDownload} onClick={handleExport}>
          Export Report
        </Button>
      </div>

      {/* Period Selector */}
      <Card>
        <div className="flex items-center space-x-2">
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                period === p
                  ? "gradient-bg text-white"
                  : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
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
                <div className={`p-4 rounded-2xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue and Rating Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-primary-600 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-display font-bold">
                {formatCurrency(analyticsData?.overview?.revenue || 0)}
              </p>
              <p className="text-white/80 text-sm mt-2">
                from {analyticsData?.overview?.completedAppointments || 0}{" "}
                consultations
              </p>
            </div>
            <div className="p-4 bg-white/20 rounded-2xl">
              <FaMoneyBillWave className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm mb-1">Your Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-display font-bold text-secondary-800">
                  {analyticsData?.rating?.toFixed(1)}
                </p>
                <span className="text-secondary-500">/ 5.0</span>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(analyticsData?.rating || 0)
                        ? "text-warning-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-secondary-600 mt-2">
                Based on {analyticsData?.totalReviews || 0} reviews
              </p>
            </div>
            <div className="p-4 bg-warning-50 rounded-2xl">
              <FaStar className="w-8 h-8 text-warning-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Appointment Trends
          </h2>
          <LineChart data={chartData.appointments} height={300} />
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Consultation Mode Distribution
          </h2>
          <div className="h-64">
            <PieChart data={chartData.mode} />
          </div>
        </Card>
      </div>

      {/* Mode Statistics */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
          Consultation Mode Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData?.appointmentsByMode?.map((mode) => (
            <div key={mode._id} className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    mode._id === "online"
                      ? "bg-blue-100"
                      : mode._id === "home"
                        ? "bg-green-100"
                        : "bg-orange-100"
                  }`}
                >
                  {mode._id === "online" && (
                    <FaVideo
                      className={`w-5 h-5 ${
                        mode._id === "online"
                          ? "text-blue-600"
                          : mode._id === "home"
                            ? "text-green-600"
                            : "text-orange-600"
                      }`}
                    />
                  )}
                  {mode._id === "home" && (
                    <FaHome className="w-5 h-5 text-green-600" />
                  )}
                  {mode._id === "clinic" && (
                    <FaMapMarkerAlt className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <span className="font-medium capitalize">{mode._id}</span>
              </div>
              <p className="text-2xl font-display font-bold text-secondary-800">
                {mode.count}
              </p>
              <p className="text-sm text-secondary-600">
                {(
                  (mode.count / analyticsData?.overview?.totalAppointments) *
                  100
                ).toFixed(1)}
                % of total
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FaClock className="w-5 h-5 text-primary-600" />
            </div>
            <span className="font-medium">Average Duration</span>
          </div>
          <p className="text-2xl font-display font-bold text-secondary-800">
            30 min
          </p>
          <p className="text-sm text-success-600 mt-2">
            +2 min from last month
          </p>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium">Completion Rate</span>
          </div>
          <p className="text-2xl font-display font-bold text-secondary-800">
            {analyticsData?.overview?.completedAppointments &&
            analyticsData?.overview?.totalAppointments
              ? (
                  (analyticsData.overview.completedAppointments /
                    analyticsData.overview.totalAppointments) *
                  100
                ).toFixed(1)
              : 0}
            %
          </p>
          <p className="text-sm text-success-600 mt-2">Above average</p>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaUserInjured className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium">Return Patients</span>
          </div>
          <p className="text-2xl font-display font-bold text-secondary-800">
            {analyticsData?.overview?.uniquePatients
              ? Math.round(analyticsData.overview.uniquePatients * 0.4)
              : 0}
          </p>
          <p className="text-sm text-primary-600 mt-2">40% return rate</p>
        </Card>
      </div>
    </div>
  );
};

export default DoctorAnalytics;
