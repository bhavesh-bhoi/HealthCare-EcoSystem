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
  FaBed,
  FaRunning,
  FaSmile,
  FaClipboardList,
} from "react-icons/fa";
import {
  MdHealthAndSafety,
  MdBloodtype,
  MdOutlineMonitorHeart,
} from "react-icons/md";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import BarChart from "../../Components/Charts/BarChart.jsx";
import toast from "react-hot-toast";

const HealthDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: [],
    bloodPressure: [],
    bloodSugar: [],
    weight: [],
  });

  useEffect(() => {
    fetchHealthData();
  }, [selectedPeriod]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.getDashboard();
      console.log("Health data:", response.data);
      setHealthData(response.data.data);

      // Mock vital signs data - In production, this would come from API
      generateMockVitalData();
    } catch (error) {
      console.error("Failed to load health data:", error);
      toast.error("Failed to load health data");
    } finally {
      setLoading(false);
    }
  };

  const generateMockVitalData = () => {
    // This is mock data - replace with actual API data
    const days =
      selectedPeriod === "week" ? 7 : selectedPeriod === "month" ? 30 : 12;
    const labels =
      selectedPeriod === "week"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : selectedPeriod === "month"
          ? Array.from({ length: 30 }, (_, i) => `${i + 1}`)
          : [
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

    setVitalSigns({
      heartRate: {
        labels,
        values: Array.from({ length: days }, () =>
          Math.floor(Math.random() * (80 - 60) + 60),
        ),
      },
      bloodPressure: {
        labels,
        systolic: Array.from({ length: days }, () =>
          Math.floor(Math.random() * (130 - 110) + 110),
        ),
        diastolic: Array.from({ length: days }, () =>
          Math.floor(Math.random() * (85 - 70) + 70),
        ),
      },
      bloodSugar: {
        labels,
        values: Array.from({ length: days }, () =>
          Math.floor(Math.random() * (110 - 85) + 85),
        ),
      },
      weight: {
        labels,
        values: Array.from({ length: days }, () =>
          Math.floor(Math.random() * (75 - 65) + 65),
        ),
      },
    });
  };

  // Current vitals (mock data - replace with actual)
  const currentVitals = {
    heartRate: {
      value: 72,
      unit: "bpm",
      status: "normal",
      change: -2,
      icon: FaHeartbeat,
      color: "red",
    },
    bloodPressure: {
      value: "120/80",
      unit: "mmHg",
      status: "normal",
      change: 0,
      icon: MdBloodtype,
      color: "blue",
    },
    bloodSugar: {
      value: 95,
      unit: "mg/dL",
      status: "normal",
      change: 5,
      icon: FaTint,
      color: "purple",
    },
    oxygenLevel: {
      value: 98,
      unit: "%",
      status: "normal",
      change: 1,
      icon: MdOutlineMonitorHeart,
      color: "teal",
    },
    weight: {
      value: 70,
      unit: "kg",
      status: "normal",
      change: -0.5,
      icon: FaWeight,
      color: "green",
    },
    bmi: {
      value: 22.5,
      unit: "",
      status: "normal",
      change: -0.2,
      icon: FaRuler,
      color: "orange",
    },
  };

  const activities = [
    {
      name: "Steps",
      value: 8432,
      target: 10000,
      unit: "steps",
      icon: FaWalking,
      color: "blue",
    },
    {
      name: "Water",
      value: 6,
      target: 8,
      unit: "glasses",
      icon: FaWater,
      color: "teal",
    },
    {
      name: "Sleep",
      value: 7.5,
      target: 8,
      unit: "hours",
      icon: FaMoon,
      color: "purple",
    },
    {
      name: "Calories",
      value: 1850,
      target: 2200,
      unit: "kcal",
      icon: FaFire,
      color: "orange",
    },
    {
      name: "Exercise",
      value: 45,
      target: 60,
      unit: "min",
      icon: FaRunning,
      color: "green",
    },
    {
      name: "Mood",
      value: 8,
      target: 10,
      unit: "/10",
      icon: FaSmile,
      color: "yellow",
    },
  ];

  const medications = [
    {
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "Twice daily",
      nextDose: "8:00 PM",
      adherence: 95,
    },
    {
      name: "Cetirizine",
      dosage: "10mg",
      frequency: "Once daily",
      nextDose: "9:00 AM",
      adherence: 100,
    },
    {
      name: "Vitamin D3",
      dosage: "1000 IU",
      frequency: "Once daily",
      nextDose: "10:00 AM",
      adherence: 85,
    },
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      nextDose: "8:00 PM",
      adherence: 90,
    },
  ];

  const appointments = [
    {
      date: "2024-03-15",
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      status: "upcoming",
    },
    {
      date: "2024-03-20",
      doctor: "Dr. Michael Chen",
      specialty: "Neurologist",
      status: "upcoming",
    },
    {
      date: "2024-02-28",
      doctor: "Dr. Emily Brown",
      specialty: "General Physician",
      status: "completed",
    },
  ];

  const chartData = {
    heartRate: {
      labels: vitalSigns.heartRate.labels || [],
      datasets: [
        {
          label: "Heart Rate (bpm)",
          data: vitalSigns.heartRate.values || [],
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    bloodPressure: {
      labels: vitalSigns.bloodPressure.labels || [],
      datasets: [
        {
          label: "Systolic",
          data: vitalSigns.bloodPressure.systolic || [],
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          yAxisID: "y",
        },
        {
          label: "Diastolic",
          data: vitalSigns.bloodPressure.diastolic || [],
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
          yAxisID: "y",
        },
      ],
    },
    bloodSugar: {
      labels: vitalSigns.bloodSugar.labels || [],
      datasets: [
        {
          label: "Blood Sugar (mg/dL)",
          data: vitalSigns.bloodSugar.values || [],
          borderColor: "#a855f7",
          backgroundColor: "rgba(168, 85, 247, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    weight: {
      labels: vitalSigns.weight.labels || [],
      datasets: [
        {
          label: "Weight (kg)",
          data: vitalSigns.weight.values || [],
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-secondary-600";
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "normal":
        return "bg-green-50";
      case "warning":
        return "bg-yellow-50";
      case "danger":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const getProgressColor = (value, target) => {
    const percentage = (value / target) * 100;
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
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
        <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-soft">
          {["week", "month", "year"].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                selectedPeriod === period
                  ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                  : "text-secondary-600 hover:bg-gray-100"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Health Score Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-teal-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">Overall Health Score</p>
            <p className="text-4xl font-display font-bold">85</p>
            <p className="text-white/80 text-sm mt-2">Good - Keep it up!</p>
          </div>
          <div className="relative">
            <svg className="w-24 h-24">
              <circle
                className="text-white/20"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="36"
                cx="48"
                cy="48"
              />
              <circle
                className="text-white"
                strokeWidth="8"
                strokeDasharray={226.2}
                strokeDashoffset={226.2 * (1 - 0.85)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="36"
                cx="48"
                cy="48"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <MdHealthAndSafety className="w-8 h-8" />
            </div>
          </div>
        </div>
      </Card>

      {/* Vitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(currentVitals).map(([key, vital], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`${getStatusBg(vital.status)} border-l-4 border-${vital.color}-500`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-${vital.color}-100 rounded-lg`}>
                    <vital.icon className={`w-5 h-5 text-${vital.color}-600`} />
                  </div>
                  <span className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </div>
                <span className={`text-sm ${getStatusColor(vital.status)}`}>
                  {vital.status}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-display font-bold text-secondary-800">
                    {vital.value}
                  </span>
                  <span className="text-secondary-500 ml-1">{vital.unit}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm">
                  {vital.change < 0 ? (
                    <FaArrowDown className="text-green-600" />
                  ) : vital.change > 0 ? (
                    <FaArrowUp className="text-red-600" />
                  ) : null}
                  <span
                    className={
                      vital.change < 0
                        ? "text-green-600"
                        : vital.change > 0
                          ? "text-red-600"
                          : "text-secondary-400"
                    }
                  >
                    {vital.change !== 0
                      ? Math.abs(vital.change) + "%"
                      : "Stable"}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4 flex items-center space-x-2">
            <FaHeartbeat className="text-red-500" />
            <span>Heart Rate Trend</span>
          </h2>
          <LineChart data={chartData.heartRate} height={250} />
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4 flex items-center space-x-2">
            <MdBloodtype className="text-blue-500" />
            <span>Blood Pressure</span>
          </h2>
          <LineChart data={chartData.bloodPressure} height={250} />
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4 flex items-center space-x-2">
            <FaTint className="text-purple-500" />
            <span>Blood Sugar</span>
          </h2>
          <LineChart data={chartData.bloodSugar} height={250} />
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4 flex items-center space-x-2">
            <FaWeight className="text-green-500" />
            <span>Weight Trend</span>
          </h2>
          <LineChart data={chartData.weight} height={250} />
        </Card>
      </div>

      {/* Activities & Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activities */}
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4 flex items-center space-x-2">
            <FaWalking className="text-blue-500" />
            <span>Daily Activities</span>
          </h2>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <activity.icon
                      className={`w-4 h-4 text-${activity.color}-500`}
                    />
                    <span className="text-sm font-medium">{activity.name}</span>
                  </div>
                  <span className="text-sm text-secondary-600">
                    {activity.value} / {activity.target} {activity.unit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${getProgressColor(activity.value, activity.target)} h-2 rounded-full transition-all duration-500`}
                    style={{
                      width: `${(activity.value / activity.target) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Medications */}
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4 flex items-center space-x-2">
            <FaClipboardList className="text-purple-500" />
            <span>Current Medications</span>
          </h2>
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium">{med.name}</p>
                    <span className="text-xs text-green-600">
                      {med.adherence}% adherence
                    </span>
                  </div>
                  <p className="text-sm text-secondary-600">
                    {med.dosage} • {med.frequency}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-secondary-500">
                      Next dose: {med.nextDose}
                    </p>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{ width: `${med.adherence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Medications
          </Button>
        </Card>
      </div>

      {/* Appointments & Health Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4 flex items-center space-x-2">
            <FaCalendarAlt className="text-primary-500" />
            <span>Upcoming Appointments</span>
          </h2>
          <div className="space-y-3">
            {appointments
              .filter((apt) => apt.status === "upcoming")
              .map((apt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{apt.doctor}</p>
                    <p className="text-sm text-secondary-600">
                      {apt.specialty}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(apt.date).toLocaleDateString()}
                    </p>
                    <Button size="sm" className="mt-2">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Appointments
          </Button>
        </Card>

        {/* Health Insights */}
        <Card className="bg-gradient-to-r from-primary-50 to-teal-50">
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Health Insights
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Heart Rate Normal</p>
                <p className="text-xs text-secondary-600">
                  Your heart rate is in healthy range (60-100 bpm)
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaExclamationTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Blood Sugar Rising</p>
                <p className="text-xs text-secondary-600">
                  5% increase from last week. Monitor your diet.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaWalking className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Stay Active</p>
                <p className="text-xs text-secondary-600">
                  1,568 steps to reach daily goal of 10,000
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-white/50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaBed className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Sleep Quality</p>
                <p className="text-xs text-secondary-600">
                  You're getting 7.5 hours average. Aim for 8 hours.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Health Recommendations */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
          Personalized Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Nutrition</h3>
            <p className="text-sm text-blue-600">
              Increase water intake to 8 glasses per day
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Exercise</h3>
            <p className="text-sm text-green-600">
              30-minute walk daily to improve cardiovascular health
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-2">Sleep</h3>
            <p className="text-sm text-purple-600">
              Maintain consistent sleep schedule for better rest
            </p>
          </div>
        </div>
      </Card>

      {/* Health Goals */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
          Health Goals
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Weight Goal</span>
              <span className="text-sm text-secondary-600">70 kg / 75 kg</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "85%" }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Steps</span>
              <span className="text-sm text-secondary-600">8,432 / 10,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: "84%" }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Water Intake</span>
              <span className="text-sm text-secondary-600">6 / 8 glasses</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-teal-500 h-2 rounded-full"
                style={{ width: "75%" }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HealthDashboard;
