import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaHeartbeat,
  FaWeight,
  FaRuler,
  FaTint,
  FaFire,
  FaMoon,
  FaWalking,
  FaAppleAlt,
  FaWater,
  FaCalendarAlt,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { MdHealthAndSafety, MdBloodtype } from "react-icons/md";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import toast from "react-hot-toast";

const HealthDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await patientAPI.getDashboard();
        setHealthData(response.data.data);
      } catch (error) {
        toast.error("Failed to load health data");
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, []);

  // Mock data for demonstration - In production, this would come from API
  const vitals = {
    heartRate: { value: 72, unit: "bpm", status: "normal", change: -2 },
    bloodPressure: {
      value: "120/80",
      unit: "mmHg",
      status: "normal",
      change: 0,
    },
    bloodSugar: { value: 95, unit: "mg/dL", status: "normal", change: 5 },
    oxygenLevel: { value: 98, unit: "%", status: "normal", change: 1 },
    weight: { value: 70, unit: "kg", status: "normal", change: -0.5 },
    bmi: { value: 22.5, unit: "", status: "normal", change: -0.2 },
  };

  const activities = [
    {
      name: "Steps",
      value: 8432,
      target: 10000,
      unit: "steps",
      icon: FaWalking,
    },
    { name: "Water", value: 6, target: 8, unit: "glasses", icon: FaWater },
    { name: "Sleep", value: 7.5, target: 8, unit: "hours", icon: FaMoon },
    { name: "Calories", value: 1850, target: 2200, unit: "kcal", icon: FaFire },
  ];

  const medications = [
    {
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "Twice daily",
      nextDose: "8:00 PM",
    },
    {
      name: "Cetirizine",
      dosage: "10mg",
      frequency: "Once daily",
      nextDose: "9:00 AM",
    },
    {
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Once daily",
      nextDose: "10:00 AM",
    },
  ];

  const appointments = [
    {
      date: "2024-03-15",
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
    },
    {
      date: "2024-03-20",
      doctor: "Dr. Michael Chen",
      specialty: "Neurologist",
    },
  ];

  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Heart Rate",
        data: [68, 72, 70, 75, 71, 73, 69],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Blood Sugar",
        data: [92, 95, 94, 97, 93, 96, 94],
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "text-success-600";
      case "warning":
        return "text-warning-600";
      case "danger":
        return "text-error-600";
      default:
        return "text-secondary-600";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "normal":
        return "bg-success-50";
      case "warning":
        return "bg-warning-50";
      case "danger":
        return "bg-error-50";
      default:
        return "bg-gray-50";
    }
  };

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary-800">
            Health Dashboard
          </h1>
          <p className="text-secondary-600">
            Track your vital signs and health metrics
          </p>
        </div>
        <div className="flex space-x-2">
          {["week", "month", "year"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                selectedPeriod === period
                  ? "gradient-bg text-white"
                  : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Heart Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className={`${getStatusBg(vitals.heartRate.status)} border-l-4 border-error-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-error-100 rounded-lg">
                  <FaHeartbeat className="w-5 h-5 text-error-600" />
                </div>
                <span className="font-medium">Heart Rate</span>
              </div>
              <span
                className={`text-sm ${getStatusColor(vitals.heartRate.status)}`}
              >
                {vitals.heartRate.status}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-display font-bold text-secondary-800">
                  {vitals.heartRate.value}
                </span>
                <span className="text-secondary-500 ml-1">
                  {vitals.heartRate.unit}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                {vitals.heartRate.change < 0 ? (
                  <FaArrowDown className="text-success-600" />
                ) : (
                  <FaArrowUp className="text-error-600" />
                )}
                <span
                  className={
                    vitals.heartRate.change < 0
                      ? "text-success-600"
                      : "text-error-600"
                  }
                >
                  {Math.abs(vitals.heartRate.change)}%
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Blood Pressure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className={`${getStatusBg(vitals.bloodPressure.status)} border-l-4 border-primary-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <MdBloodtype className="w-5 h-5 text-primary-600" />
                </div>
                <span className="font-medium">Blood Pressure</span>
              </div>
              <span
                className={`text-sm ${getStatusColor(vitals.bloodPressure.status)}`}
              >
                {vitals.bloodPressure.status}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-display font-bold text-secondary-800">
                  {vitals.bloodPressure.value}
                </span>
                <span className="text-secondary-500 ml-1">
                  {vitals.bloodPressure.unit}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Blood Sugar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            className={`${getStatusBg(vitals.bloodSugar.status)} border-l-4 border-purple-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaTint className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium">Blood Sugar</span>
              </div>
              <span
                className={`text-sm ${getStatusColor(vitals.bloodSugar.status)}`}
              >
                {vitals.bloodSugar.status}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-display font-bold text-secondary-800">
                  {vitals.bloodSugar.value}
                </span>
                <span className="text-secondary-500 ml-1">
                  {vitals.bloodSugar.unit}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <FaArrowUp className="text-warning-600" />
                <span className="text-warning-600">
                  {vitals.bloodSugar.change}%
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Oxygen Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            className={`${getStatusBg(vitals.oxygenLevel.status)} border-l-4 border-teal-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <MdHealthAndSafety className="w-5 h-5 text-teal-600" />
                </div>
                <span className="font-medium">Oxygen Level</span>
              </div>
              <span
                className={`text-sm ${getStatusColor(vitals.oxygenLevel.status)}`}
              >
                {vitals.oxygenLevel.status}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-display font-bold text-secondary-800">
                  {vitals.oxygenLevel.value}
                </span>
                <span className="text-secondary-500 ml-1">
                  {vitals.oxygenLevel.unit}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <FaArrowUp className="text-success-600" />
                <span className="text-success-600">
                  {vitals.oxygenLevel.change}%
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Weight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card
            className={`${getStatusBg(vitals.weight.status)} border-l-4 border-green-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaWeight className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium">Weight</span>
              </div>
              <span
                className={`text-sm ${getStatusColor(vitals.weight.status)}`}
              >
                {vitals.weight.status}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-display font-bold text-secondary-800">
                  {vitals.weight.value}
                </span>
                <span className="text-secondary-500 ml-1">
                  {vitals.weight.unit}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <FaArrowDown className="text-success-600" />
                <span className="text-success-600">
                  {Math.abs(vitals.weight.change)} kg
                </span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* BMI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card
            className={`${getStatusBg(vitals.bmi.status)} border-l-4 border-indigo-500`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FaRuler className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="font-medium">BMI</span>
              </div>
              <span className={`text-sm ${getStatusColor(vitals.bmi.status)}`}>
                {vitals.bmi.status}
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-display font-bold text-secondary-800">
                  {vitals.bmi.value}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <FaArrowDown className="text-success-600" />
                <span className="text-success-600">
                  {Math.abs(vitals.bmi.change)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Vital Signs Trend
          </h2>
          <LineChart data={chartData} height={300} />
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Daily Activities
          </h2>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <activity.icon className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-medium">{activity.name}</span>
                  </div>
                  <span className="text-sm text-secondary-600">
                    {activity.value} / {activity.target} {activity.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${(activity.value / activity.target) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Medications and Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medications */}
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Current Medications
          </h2>
          <div className="space-y-3">
            {medications.map((med, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium">{med.name}</p>
                  <p className="text-sm text-secondary-600">
                    {med.dosage} • {med.frequency}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondary-500">Next dose</p>
                  <p className="text-sm font-medium text-primary-600">
                    {med.nextDose}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Medications
          </Button>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Upcoming Appointments
          </h2>
          <div className="space-y-3">
            {appointments.map((apt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium">{apt.doctor}</p>
                  <p className="text-sm text-secondary-600">{apt.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {new Date(apt.date).toLocaleDateString()}
                  </p>
                  <Button size="sm" className="mt-2">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Appointments
          </Button>
        </Card>
      </div>

      {/* Health Insights */}
      <Card className="bg-gradient-to-r from-primary-50 to-teal-50">
        <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
          Health Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-success-100 rounded-lg">
              <FaCheckCircle className="w-4 h-4 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Heart Rate Normal</p>
              <p className="text-xs text-secondary-600">
                Your heart rate is in healthy range
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-warning-100 rounded-lg">
              <FaExclamationTriangle className="w-4 h-4 text-warning-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Blood Sugar Rising</p>
              <p className="text-xs text-secondary-600">
                5% increase from last week
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FaWalking className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-sm">Stay Active</p>
              <p className="text-xs text-secondary-600">
                1,568 steps to reach daily goal
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HealthDashboard;
