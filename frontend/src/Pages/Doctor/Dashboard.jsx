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
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
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
  const [appointments, setAppointments] = useState([]);
  const [greeting, setGreeting] = useState("");
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAppointments();
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
      console.log("Doctor dashboard data:", response.data);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await doctorAPI.getAppointments();
      console.log("Doctor appointments:", response.data);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
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

  // Calculate real stats from appointments
  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.date).toDateString();
    return aptDate === today;
  }).length;

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending",
  ).length;
  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed",
  ).length;
  const confirmedAppointments = appointments.filter(
    (apt) => apt.status === "confirmed",
  ).length;
  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === "cancelled",
  ).length;

  // Get unique patients count
  const uniquePatients = [
    ...new Set(appointments.map((apt) => apt.patientId?._id)),
  ].length;

  // Calculate revenue (mock - replace with actual payment data)
  const revenue =
    completedAppointments * (dashboardData?.overview?.consultationFee || 500);

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments,
      icon: FaCalendarCheck,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      change: "+2 from yesterday",
    },
    {
      label: "Total Patients",
      value: uniquePatients,
      icon: FaUsers,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      change: "+5 this month",
    },
    {
      label: "Pending Appointments",
      value: pendingAppointments,
      icon: MdPendingActions,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      change: "Awaiting response",
    },
    {
      label: "Completed",
      value: completedAppointments,
      icon: FaCheckCircle,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      change: "This month",
    },
  ];

  // Chart data for appointment trends
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
        data: [12, 19, 15, 17, 14, 13, 15, 20, 18, 22, 25, 23], // Replace with actual data
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Appointments by mode
  const appointmentsByMode = [
    {
      mode: "clinic",
      count: appointments.filter((apt) => apt.mode === "clinic").length,
      icon: FaVideo,
    },
    {
      mode: "online",
      count: appointments.filter((apt) => apt.mode === "online").length,
      icon: FaVideo,
    },
    {
      mode: "home",
      count: appointments.filter((apt) => apt.mode === "home").length,
      icon: FaVideo,
    },
  ];

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 to-teal-600 p-8 text-white">
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
                  ? "bg-green-500 text-white hover:bg-green-600"
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

      {/* Revenue and Rating Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FadeIn delay={0.3}>
          <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-display font-bold">
                  ₹{revenue.toLocaleString()}
                </p>
                <p className="text-white/80 text-sm mt-2">
                  from {completedAppointments} consultations
                </p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <FaMoneyBillWave className="w-8 h-8" />
              </div>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-600 text-sm mb-1">Your Rating</p>
                <div className="flex items-center space-x-2">
                  <p className="text-3xl font-display font-bold text-secondary-800">
                    {dashboardData?.rating?.toFixed(1) || "4.5"}
                  </p>
                  <span className="text-secondary-500">/ 5.0</span>
                </div>
                <div className="flex items-center space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(dashboardData?.rating || 4.5)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-secondary-600 mt-2">
                  Based on {dashboardData?.totalReviews || 128} reviews
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-2xl">
                <FaStar className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeIn delay={0.5}>
          <Card>
            <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
              Appointment Trends
            </h2>
            <LineChart data={chartData} height={300} />
          </Card>
        </FadeIn>

        <FadeIn delay={0.6}>
          <Card>
            <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
              Appointments by Mode
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {appointmentsByMode.map((mode) => (
                <div
                  key={mode.mode}
                  className="text-center p-4 bg-gray-50 rounded-xl"
                >
                  <p className="text-2xl font-display font-bold text-primary-600">
                    {mode.count}
                  </p>
                  <p className="text-sm text-secondary-600 capitalize">
                    {mode.mode}
                  </p>
                </div>
              ))}
            </div>

            {/* Appointment Status Distribution */}
            <div className="mt-6">
              <h3 className="font-medium mb-3">Status Distribution</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">Confirmed</span>
                  <span className="font-medium">{confirmedAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(confirmedAppointments / appointments.length) * 100 || 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-yellow-600">Pending</span>
                  <span className="font-medium">{pendingAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{
                      width: `${(pendingAppointments / appointments.length) * 100 || 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-red-600">Cancelled</span>
                  <span className="font-medium">{cancelledAppointments}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${(cancelledAppointments / appointments.length) * 100 || 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Recent Appointments */}
      <FadeIn delay={0.7}>
        <Card>
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
            Recent Appointments
          </h2>
          <div className="space-y-3">
            {appointments.slice(0, 5).map((apt) => (
              <div
                key={apt._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <FaUserInjured className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {apt.patientId?.userId?.name || "Patient"}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {new Date(apt.date).toLocaleDateString()} at{" "}
                      {apt.startTime}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    apt.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : apt.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : apt.status === "confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default DoctorDashboard;
