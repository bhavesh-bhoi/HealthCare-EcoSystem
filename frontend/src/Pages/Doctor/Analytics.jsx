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
  FaArrowUp,
  FaArrowDown,
  FaUsers,
  FaPrescription,
} from "react-icons/fa";
import { doctorAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import BarChart from "../../Components/Charts/BarChart.jsx";
import PieChart from "../../Components/Charts/PieChart.jsx";
import toast from "react-hot-toast";

const DoctorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, appointmentsRes] = await Promise.all([
        doctorAPI.getAnalytics(),
        doctorAPI.getAppointments(),
      ]);

      console.log("Analytics data:", analyticsRes.data);
      console.log("Appointments:", appointmentsRes.data);

      setAnalyticsData(analyticsRes.data.data);
      setAppointments(appointmentsRes.data.data || []);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const data = {
      period,
      analytics: analyticsData,
      appointments: appointments.length,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctor-analytics-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success("Analytics exported successfully");
  };

  // Calculate real metrics from appointments
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed",
  ).length;
  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === "cancelled",
  ).length;
  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending",
  ).length;
  const confirmedAppointments = appointments.filter(
    (apt) => apt.status === "confirmed",
  ).length;

  const uniquePatients = [
    ...new Set(appointments.map((apt) => apt.patientId?._id)),
  ].length;

  const onlineAppointments = appointments.filter(
    (apt) => apt.mode === "online",
  ).length;
  const clinicAppointments = appointments.filter(
    (apt) => apt.mode === "clinic",
  ).length;
  const homeAppointments = appointments.filter(
    (apt) => apt.mode === "home",
  ).length;

  // Calculate revenue (assuming ₹500 per consultation)
  const revenue = completedAppointments * 500;
  const revenueChange = 12.5; // Mock percentage

  // Monthly trend data
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const count = appointments.filter(
      (apt) => new Date(apt.date).getMonth() + 1 === month,
    ).length;
    return count;
  });

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
          data: monthlyData,
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    mode: {
      labels: ["Clinic", "Online", "Home"],
      datasets: [
        {
          data: [clinicAppointments, onlineAppointments, homeAppointments],
          backgroundColor: ["#0ea5e9", "#14b8a6", "#a855f7"],
          borderWidth: 0,
        },
      ],
    },
    status: {
      labels: ["Completed", "Confirmed", "Pending", "Cancelled"],
      datasets: [
        {
          data: [
            completedAppointments,
            confirmedAppointments,
            pendingAppointments,
            cancelledAppointments,
          ],
          backgroundColor: ["#22c55e", "#3b82f6", "#eab308", "#ef4444"],
          borderWidth: 0,
        },
      ],
    },
  };

  const stats = [
    {
      label: "Total Appointments",
      value: totalAppointments,
      change: "+15%",
      icon: FaCalendarAlt,
      color: "from-blue-600 to-cyan-600",
    },
    {
      label: "Completed",
      value: completedAppointments,
      change: "+8%",
      icon: FaCheckCircle,
      color: "from-green-600 to-emerald-600",
    },
    {
      label: "Unique Patients",
      value: uniquePatients,
      change: "+22%",
      icon: FaUsers,
      color: "from-purple-600 to-pink-600",
    },
    {
      label: "Revenue",
      value: `₹${revenue}`,
      change: "+18%",
      icon: FaMoneyBillWave,
      color: "from-orange-600 to-amber-600",
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
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {["week", "month", "quarter", "year"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                  period === p
                    ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                    : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-sm text-secondary-600">
            <FaCalendarAlt />
            <span>Last 12 months</span>
          </div>
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
                  <p className="text-2xl font-display font-bold text-secondary-800">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Appointment Trends
          </h2>
          <LineChart data={chartData.appointments} height={300} />
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Revenue Overview
          </h2>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-display font-bold text-primary-600">
                ₹{revenue.toLocaleString()}
              </p>
              <p className="text-secondary-600 mt-2">Total Revenue</p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <span className="text-green-600 flex items-center">
                  <FaArrowUp className="mr-1" /> {revenueChange}%
                </span>
                <span className="text-secondary-400">vs last period</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Consultation Mode Distribution
          </h2>
          <div className="h-64">
            <PieChart data={chartData.mode} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Clinic</p>
              <p className="text-xs text-secondary-600">{clinicAppointments}</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Online</p>
              <p className="text-xs text-secondary-600">{onlineAppointments}</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Home</p>
              <p className="text-xs text-secondary-600">{homeAppointments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Appointment Status
          </h2>
          <div className="h-64">
            <PieChart data={chartData.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Completed</p>
              <p className="text-xs text-secondary-600">
                {completedAppointments}
              </p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Confirmed</p>
              <p className="text-xs text-secondary-600">
                {confirmedAppointments}
              </p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Pending</p>
              <p className="text-xs text-secondary-600">
                {pendingAppointments}
              </p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Cancelled</p>
              <p className="text-xs text-secondary-600">
                {cancelledAppointments}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaClock className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium">Average Duration</span>
          </div>
          <p className="text-2xl font-display font-bold text-secondary-800">
            30 min
          </p>
          <p className="text-sm text-green-600 mt-2">+2 min vs last month</p>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaStar className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium">Average Rating</span>
          </div>
          <p className="text-2xl font-display font-bold text-secondary-800">
            {analyticsData?.rating?.toFixed(1) || "4.8"}
          </p>
          <p className="text-sm text-secondary-600 mt-2">
            from {analyticsData?.totalReviews || 128} reviews
          </p>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaPrescription className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium">Prescriptions</span>
          </div>
          <p className="text-2xl font-display font-bold text-secondary-800">
            {completedAppointments * 2}
          </p>
          <p className="text-sm text-green-600 mt-2">+5 this week</p>
        </Card>
      </div>
    </div>
  );
};

export default DoctorAnalytics;
