import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaCalendarAlt,
  FaDownload,
  FaMoneyBillWave,
  FaUsers,
  FaCalendarCheck,
  FaBox,
  FaPills,
  FaFileMedical,
} from "react-icons/fa";
import { adminAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import BarChart from "../../Components/Charts/BarChart.jsx";
import PieChart from "../../Components/Charts/PieChart.jsx";
import toast from "react-hot-toast";
import { formatCurrency } from "../../Utils/helpers.js";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [period, setPeriod] = useState("month");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [period, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAnalytics(period);
      setAnalyticsData(response.data.data);
    } catch (error) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implement export functionality
    const data = {
      period,
      dateRange,
      ...analyticsData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${period}-${new Date().toISOString()}.json`;
    a.click();
  };

  const chartData = {
    userGrowth: {
      labels:
        analyticsData?.userGrowth?.map(
          (item) => `${item._id.month}/${item._id.year}`,
        ) || [],
      datasets: [
        {
          label: "New Users",
          data: analyticsData?.userGrowth?.map((item) => item.count) || [],
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14, 165, 233, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    revenue: {
      labels:
        analyticsData?.revenueStats?.map(
          (item) => `${item._id.month}/${item._id.year}`,
        ) || [],
      datasets: [
        {
          label: "Revenue (₹)",
          data: analyticsData?.revenueStats?.map((item) => item.total) || [],
          backgroundColor: "#14b8a6",
        },
      ],
    },
    appointmentStatus: {
      labels: analyticsData?.appointmentStats?.map((item) => item._id) || [],
      datasets: [
        {
          data:
            analyticsData?.appointmentStats?.map((item) => item.count) || [],
          backgroundColor: ["#0ea5e9", "#14b8a6", "#a855f7", "#f97316"],
          borderWidth: 0,
        },
      ],
    },
    orderStatus: {
      labels: analyticsData?.orderStats?.map((item) => item._id) || [],
      datasets: [
        {
          data: analyticsData?.orderStats?.map((item) => item.count) || [],
          backgroundColor: ["#22c55e", "#eab308", "#ef4444", "#3b82f6"],
          borderWidth: 0,
        },
      ],
    },
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
            Analytics Dashboard
          </h1>
          <p className="text-secondary-600">
            Comprehensive platform analytics and insights
          </p>
        </div>
        <Button variant="outline" icon={FaDownload} onClick={handleExport}>
          Export Data
        </Button>
      </div>

      {/* Period Selector */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
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
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="input-field text-sm"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="input-field text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Total Users</p>
              <p className="text-2xl font-display font-bold text-secondary-800">
                {analyticsData?.platformStats?.totalUsers || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-success-600">
            +{analyticsData?.userGrowth?.slice(-1)[0]?.count || 0} this period
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FaCalendarCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Appointments</p>
              <p className="text-2xl font-display font-bold text-secondary-800">
                {analyticsData?.appointmentStats?.reduce(
                  (sum, item) => sum + item.count,
                  0,
                ) || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-primary-600">
            {analyticsData?.platformStats?.completionRate?.toFixed(1)}%
            completion rate
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FaBox className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Orders</p>
              <p className="text-2xl font-display font-bold text-secondary-800">
                {analyticsData?.orderStats?.reduce(
                  (sum, item) => sum + item.count,
                  0,
                ) || 0}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-warning-600">
            {analyticsData?.orderStats?.find((s) => s._id === "pending")
              ?.count || 0}{" "}
            pending
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <FaMoneyBillWave className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-secondary-600">Revenue</p>
              <p className="text-2xl font-display font-bold text-secondary-800">
                {formatCurrency(
                  analyticsData?.revenueStats?.reduce(
                    (sum, item) => sum + item.total,
                    0,
                  ) || 0,
                )}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-success-600">
            Avg order:{" "}
            {formatCurrency(
              analyticsData?.platformStats?.averageOrderValue || 0,
            )}
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            User Growth
          </h2>
          <LineChart data={chartData.userGrowth} height={300} />
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Revenue Trend
          </h2>
          <BarChart data={chartData.revenue} height={300} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Appointment Status Distribution
          </h2>
          <div className="h-64">
            <PieChart data={chartData.appointmentStatus} />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Order Status Distribution
          </h2>
          <div className="h-64">
            <PieChart data={chartData.orderStatus} />
          </div>
        </Card>
      </div>

      {/* Popular Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Popular Specialties
          </h2>
          <div className="space-y-3">
            {analyticsData?.popularSpecialties?.map((specialty, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">{specialty._id}</span>
                </div>
                <span className="text-sm text-secondary-600">
                  {specialty.count} doctors
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Popular Medicines
          </h2>
          <div className="space-y-3">
            {analyticsData?.popularMedicines?.map((medicine, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-success-100 text-success-600 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">{medicine._id}</span>
                </div>
                <span className="text-sm text-secondary-600">
                  {medicine.count} orders
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Disease Statistics */}
      {analyticsData?.diseaseStats && (
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Common Diseases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.diseaseStats.slice(0, 6).map((disease, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <p className="font-medium mb-2">{disease._id}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-600">
                    {disease.count} cases
                  </span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${(disease.count / analyticsData.diseaseStats[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
