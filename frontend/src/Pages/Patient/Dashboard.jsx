import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaCalendarCheck,
  FaPrescription,
  FaHeartbeat,
  FaUserMd,
  FaArrowRight,
  FaClock,
  FaVideo,
  FaHome,
  FaMapMarkerAlt,
  FaPills,
  FaFileMedical,
} from "react-icons/fa";
import { MdEmergency, MdHealthAndSafety } from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi";
import { useAuth } from "../../Contexts/AuthContext.jsx";
import { patientAPI } from "../../services/api.js";
import FadeIn from "../../Components/Animations/FadeIn.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import Card from "../../Components/Common/Card.jsx";
import toast from "react-hot-toast";

const Dashboard = () => {
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
      const response = await patientAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Appointments",
      value: dashboardData?.stats?.totalAppointments || 0,
      icon: FaCalendarCheck,
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Prescriptions",
      value: dashboardData?.stats?.totalPrescriptions || 0,
      icon: FaPrescription,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Orders",
      value: dashboardData?.stats?.totalOrders || 0,
      icon: FaPills,
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      label: "Health Score",
      value: dashboardData?.patient?.age ? "85" : "N/A",
      icon: FaHeartbeat,
      color: "from-orange-600 to-amber-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const quickActions = [
    {
      title: "Check Symptoms",
      description: "AI-powered symptom analysis",
      icon: MdHealthAndSafety,
      to: "/patient/symptom-checker",
      color: "from-purple-600 to-pink-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Book Appointment",
      description: "Schedule with top doctors",
      icon: FaUserMd,
      to: "/patient/book-appointment",
      color: "from-blue-600 to-cyan-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Emergency",
      description: "24/7 emergency assistance",
      icon: MdEmergency,
      to: "/patient/emergency",
      color: "from-red-600 to-orange-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Health Dashboard",
      description: "Track your health metrics",
      icon: FaHeartbeat,
      to: "/patient/health-dashboard",
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
    },
  ];

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
              {greeting}, {user?.name}! 👋
            </h1>
            <p className="text-blue-100 text-lg max-w-2xl">
              Welcome back to your health dashboard. Here's your health summary
              for today.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

          {/* Floating Icons */}
          <motion.div
            className="absolute top-10 right-20 text-white/20"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FaHeartbeat className="w-16 h-16" />
          </motion.div>
          <motion.div
            className="absolute bottom-10 right-40 text-white/20"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FaUserMd className="w-12 h-12" />
          </motion.div>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <FadeIn key={stat.label} delay={index * 0.1}>
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="card hover:shadow-medium cursor-pointer"
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
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(stat.value * 10, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-2 rounded-full bg-gradient-to-r ${stat.color}`}
                  />
                </div>
              </div>
            </motion.div>
          </FadeIn>
        ))}
      </div>

      {/* Emergency Button */}
      <FadeIn delay={0.4}>
        <Link to="/patient/emergency">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 to-red-500 p-6 cursor-pointer group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <MdEmergency className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-display font-bold text-xl">
                    Emergency Assistance
                  </h3>
                  <p className="text-red-100">
                    Click here for immediate medical help
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                  }}
                />
                <span className="text-white font-semibold">ACTIVE 24/7</span>
              </div>
            </div>
          </motion.div>
        </Link>
      </FadeIn>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-display font-bold text-secondary-800 mb-6">
          Quick Actions
          <HiOutlineSparkles className="inline ml-2 text-primary-500" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <FadeIn key={action.title} delay={0.5 + index * 0.1}>
              <Link to={action.to}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="card group cursor-pointer"
                >
                  <div
                    className={`p-4 rounded-2xl ${action.bgColor} w-fit mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <action.icon
                      className={`w-6 h-6 text-${action.color.split("-")[1]}-600`}
                    />
                  </div>
                  <h3 className="font-display font-semibold text-secondary-800 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-secondary-600 text-sm">
                    {action.description}
                  </p>
                  <motion.div
                    className="mt-4 h-1 bg-gradient-to-r from-primary-600 to-teal-600 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments & Recent Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <FadeIn delay={0.6}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold text-secondary-800">
                Upcoming Appointments
              </h3>
              <Link
                to="/patient/appointments"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View all</span>
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {dashboardData?.upcomingAppointments?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingAppointments.map(
                  (appointment, index) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                            <FaUserMd className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-secondary-800">
                            Dr. {appointment.doctorId?.userId?.name}
                          </p>
                          <p className="text-sm text-secondary-600">
                            {new Date(appointment.date).toLocaleDateString()} at{" "}
                            {appointment.startTime}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            {appointment.mode === "online" && (
                              <FaVideo className="w-3 h-3 text-primary-500" />
                            )}
                            {appointment.mode === "home" && (
                              <FaHome className="w-3 h-3 text-success-500" />
                            )}
                            {appointment.mode === "clinic" && (
                              <FaMapMarkerAlt className="w-3 h-3 text-orange-500" />
                            )}
                            <span className="text-xs text-secondary-500 capitalize">
                              {appointment.mode}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === "confirmed"
                              ? "bg-success-100 text-success-700"
                              : appointment.status === "pending"
                                ? "bg-warning-100 text-warning-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                    </motion.div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaCalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-secondary-600">No upcoming appointments</p>
                <Link
                  to="/patient/book-appointment"
                  className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Book an appointment
                </Link>
              </div>
            )}
          </Card>
        </FadeIn>

        {/* Recent Prescriptions */}
        <FadeIn delay={0.7}>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-semibold text-secondary-800">
                Recent Prescriptions
              </h3>
              <Link
                to="/patient/prescriptions"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View all</span>
                <FaArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {dashboardData?.recentPrescriptions?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentPrescriptions.map(
                  (prescription, index) => (
                    <motion.div
                      key={prescription._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-success-100 rounded-lg">
                            <FaFileMedical className="w-4 h-4 text-success-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-secondary-800">
                              Dr. {prescription.doctorId?.userId?.name}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {new Date(prescription.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Link
                          to={`/patient/prescriptions/${prescription._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View
                        </Link>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-secondary-700">
                          {prescription.medicines
                            ?.map((m) => m.name)
                            .join(", ")}
                        </p>
                      </div>
                    </motion.div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaPrescription className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-secondary-600">No prescriptions yet</p>
              </div>
            )}
          </Card>
        </FadeIn>
      </div>

      {/* Health Tips */}
      <FadeIn delay={0.8}>
        <Card className="bg-gradient-to-r from-primary-50 to-teal-50">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-xl shadow-soft">
              <MdHealthAndSafety className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-secondary-800 mb-2">
                Daily Health Tip
              </h3>
              <p className="text-secondary-700">
                Stay hydrated! Drink at least 8 glasses of water today to
                maintain optimal health. Proper hydration helps with digestion,
                skin health, and energy levels.
              </p>
            </div>
            <button className="text-primary-600 hover:text-primary-700">
              <FaArrowRight className="w-5 h-5" />
            </button>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default Dashboard;
