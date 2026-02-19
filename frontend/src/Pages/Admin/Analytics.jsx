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
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaSync,
  FaPrint,
  FaEye,
  FaChartPie,
  FaChartBar,
} from "react-icons/fa";
import { adminAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import LineChart from "../../Components/Charts/LineChart.jsx";
import BarChart from "../../Components/Charts/BarChart.jsx";
import PieChart from "../../Components/Charts/PieChart.jsx";
import toast from "react-hot-toast";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [period, setPeriod] = useState("month");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [chartType, setChartType] = useState("line");
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [comparisonData, setComparisonData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAnalytics(period);
      console.log("Analytics data:", response.data);
      setAnalyticsData(response.data.data);

      // Fetch comparison data for previous period
      const prevResponse = await adminAPI.getAnalytics(
        period === "month" ? "month" : period,
      );
      setComparisonData(prevResponse.data.data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format = "json") => {
    const data = {
      period,
      dateRange,
      analytics: analyticsData,
      comparison: comparisonData,
      exportDate: new Date().toISOString(),
    };

    if (format === "json") {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${period}-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
    } else {
      // CSV export
      const csv = convertToCSV(analyticsData);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${period}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
    }
    toast.success(`Analytics exported as ${format.toUpperCase()}`);
  };

  const convertToCSV = (data) => {
    // Convert analytics data to CSV format
    const rows = [];

    if (data?.userGrowth) {
      rows.push(["Period", "New Users"]);
      data.userGrowth.forEach((item) => {
        rows.push([`${item._id.month}/${item._id.year}`, item.count]);
      });
    }

    return rows.map((row) => row.join(",")).join("\n");
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getMetricValue = (metric) => {
    switch (metric) {
      case "revenue":
        return (
          analyticsData?.revenueStats?.reduce(
            (sum, item) => sum + item.total,
            0,
          ) || 0
        );
      case "users":
        return analyticsData?.platformStats?.totalUsers || 0;
      case "appointments":
        return (
          analyticsData?.appointmentStats?.reduce(
            (sum, item) => sum + item.count,
            0,
          ) || 0
        );
      case "orders":
        return (
          analyticsData?.orderStats?.reduce(
            (sum, item) => sum + item.count,
            0,
          ) || 0
        );
      default:
        return 0;
    }
  };

  const getPreviousMetricValue = (metric) => {
    if (!comparisonData) return 0;
    switch (metric) {
      case "revenue":
        return (
          comparisonData?.revenueStats?.reduce(
            (sum, item) => sum + item.total,
            0,
          ) || 0
        );
      case "users":
        return comparisonData?.platformStats?.totalUsers || 0;
      case "appointments":
        return (
          comparisonData?.appointmentStats?.reduce(
            (sum, item) => sum + item.count,
            0,
          ) || 0
        );
      case "orders":
        return (
          comparisonData?.orderStats?.reduce(
            (sum, item) => sum + item.count,
            0,
          ) || 0
        );
      default:
        return 0;
    }
  };

  const chartData = {
    revenue: {
      labels: analyticsData?.revenueStats?.map(
        (item) => `${item._id.month}/${item._id.year}`,
      ) || [
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
          data: analyticsData?.revenueStats?.map((item) => item.total) || [
            45000, 52000, 58000, 61000, 68000, 72000, 81000, 89000, 95000,
            102000, 115000, 125000,
          ],
          backgroundColor: "#14b8a6",
          borderColor: "#0d9488",
          tension: 0.4,
          fill: chartType === "line",
        },
      ],
    },
    users: {
      labels: analyticsData?.userGrowth?.map(
        (item) => `${item._id.month}/${item._id.year}`,
      ) || [
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
          data: analyticsData?.userGrowth?.map((item) => item.count) || [
            45, 52, 68, 74, 85, 92, 105, 118, 132, 145, 158, 172,
          ],
          backgroundColor: "#0ea5e9",
          borderColor: "#0284c7",
          tension: 0.4,
          fill: chartType === "line",
        },
      ],
    },
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
          data: [120, 135, 148, 162, 175, 188, 202, 215, 228, 242, 255, 268],
          backgroundColor: "#a855f7",
          borderColor: "#9333ea",
          tension: 0.4,
          fill: chartType === "line",
        },
      ],
    },
    orders: {
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
          label: "Orders",
          data: [65, 72, 80, 88, 95, 102, 110, 118, 125, 132, 140, 148],
          backgroundColor: "#f97316",
          borderColor: "#ea580c",
          tension: 0.4,
          fill: chartType === "line",
        },
      ],
    },
    distribution: {
      labels: ["Doctors", "Patients", "Pharmacies"],
      datasets: [
        {
          data: [
            analyticsData?.platformStats?.totalDoctors || 45,
            analyticsData?.platformStats?.totalPatients || 1250,
            analyticsData?.platformStats?.totalPharmacies || 28,
          ],
          backgroundColor: ["#0ea5e9", "#14b8a6", "#a855f7"],
          borderWidth: 0,
        },
      ],
    },
    status: {
      labels: ["Completed", "Pending", "Cancelled"],
      datasets: [
        {
          data: [850, 120, 45],
          backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
          borderWidth: 0,
        },
      ],
    },
  };

  const metrics = [
    {
      id: "revenue",
      label: "Revenue",
      icon: FaMoneyBillWave,
      color: "from-teal-600 to-green-600",
    },
    {
      id: "users",
      label: "Users",
      icon: FaUsers,
      color: "from-blue-600 to-cyan-600",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: FaCalendarCheck,
      color: "from-purple-600 to-pink-600",
    },
    {
      id: "orders",
      label: "Orders",
      icon: FaBox,
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
            Comprehensive platform analytics and insights
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={FaSync} onClick={fetchAnalytics}>
            Refresh
          </Button>
          <Button variant="outline" icon={FaPrint} onClick={handlePrint}>
            Print
          </Button>
          <select
            onChange={(e) => handleExport(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="">Export</option>
            <option value="json">Export as JSON</option>
            <option value="csv">Export as CSV</option>
          </select>
        </div>
      </div>

      {/* Period Selector */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex space-x-2">
            {["week", "month", "quarter", "year", "all"].map((p) => (
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

          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <span className="text-secondary-400">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const currentValue = getMetricValue(metric.id);
          const previousValue = getPreviousMetricValue(metric.id);
          const growth = calculateGrowth(currentValue, previousValue);

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="card cursor-pointer"
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-secondary-600 text-sm mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-display font-bold text-secondary-800">
                    {metric.id === "revenue"
                      ? `₹${currentValue.toLocaleString()}`
                      : currentValue}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`text-xs flex items-center ${
                        growth > 0
                          ? "text-green-600"
                          : growth < 0
                            ? "text-red-600"
                            : "text-gray-500"
                      }`}
                    >
                      {growth > 0 ? (
                        <FaArrowUp className="mr-1" />
                      ) : (
                        <FaArrowDown className="mr-1" />
                      )}
                      {Math.abs(growth).toFixed(1)}%
                    </span>
                    <span className="text-xs text-secondary-500">
                      vs previous period
                    </span>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-r ${metric.color} text-white`}
                >
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Chart Controls */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType("line")}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                chartType === "line"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
              }`}
            >
              <FaChartLine />
              <span>Line</span>
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                chartType === "bar"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
              }`}
            >
              <FaChartBar />
              <span>Bar</span>
            </button>
          </div>

          <div className="flex space-x-2">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedMetric === metric.id
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Main Chart */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
          {metrics.find((m) => m.id === selectedMetric)?.label} Trend
        </h2>
        {chartType === "line" ? (
          <LineChart data={chartData[selectedMetric]} height={400} />
        ) : (
          <BarChart data={chartData[selectedMetric]} height={400} />
        )}
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="text-sm font-medium">Doctors</p>
              <p className="text-xs text-secondary-600">
                {chartData.distribution.datasets[0].data[0]}
              </p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-teal-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Patients</p>
              <p className="text-xs text-secondary-600">
                {chartData.distribution.datasets[0].data[1]}
              </p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Pharmacies</p>
              <p className="text-xs text-secondary-600">
                {chartData.distribution.datasets[0].data[2]}
              </p>
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
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Completed</p>
              <p className="text-xs text-secondary-600">
                {chartData.status.datasets[0].data[0]}
              </p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Pending</p>
              <p className="text-xs text-secondary-600">
                {chartData.status.datasets[0].data[1]}
              </p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1" />
              <p className="text-sm font-medium">Cancelled</p>
              <p className="text-xs text-secondary-600">
                {chartData.status.datasets[0].data[2]}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Stats Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Doctors */}
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Top Performing Doctors
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                    {i}
                  </span>
                  <div>
                    <p className="font-medium">Dr. Sarah Johnson</p>
                    <p className="text-xs text-secondary-500">
                      Cardiology • {45 + i * 5} appointments
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    ₹{85 + i * 5}k
                  </p>
                  <p className="text-xs text-secondary-500">4.{9 - i} ★</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Medicines */}
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Most Prescribed Medicines
          </h2>
          <div className="space-y-3">
            {[
              { name: "Paracetamol", count: 1250, revenue: 62500 },
              { name: "Amoxicillin", count: 980, revenue: 78400 },
              { name: "Cetirizine", count: 850, revenue: 42500 },
              { name: "Metformin", count: 720, revenue: 57600 },
              { name: "Omeprazole", count: 650, revenue: 48750 },
            ].map((med, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-xs text-secondary-500">
                      {med.count} prescriptions
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium">
                  ₹{med.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
          Revenue Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Consultation Fees</p>
            <p className="text-xl font-display font-bold text-blue-700">
              ₹425,000
            </p>
            <p className="text-xs text-blue-600 mt-1">45% of total</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Medicine Sales</p>
            <p className="text-xl font-display font-bold text-green-700">
              ₹380,000
            </p>
            <p className="text-xs text-green-600 mt-1">40% of total</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 mb-1">Other Services</p>
            <p className="text-xl font-display font-bold text-purple-700">
              ₹145,000
            </p>
            <p className="text-xs text-purple-600 mt-1">15% of total</p>
          </div>
        </div>
      </Card>

      {/* Platform Health */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
          Platform Health Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-secondary-600 mb-1">
              Avg. Response Time
            </p>
            <p className="text-xl font-display font-bold text-secondary-800">
              245ms
            </p>
            <p className="text-xs text-green-600 mt-1">-12% vs last month</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-secondary-600 mb-1">Uptime</p>
            <p className="text-xl font-display font-bold text-secondary-800">
              99.9%
            </p>
            <p className="text-xs text-green-600 mt-1">+0.1% improvement</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-secondary-600 mb-1">Active Users</p>
            <p className="text-xl font-display font-bold text-secondary-800">
              1,245
            </p>
            <p className="text-xs text-green-600 mt-1">+8% this week</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-secondary-600 mb-1">Conversion Rate</p>
            <p className="text-xl font-display font-bold text-secondary-800">
              68%
            </p>
            <p className="text-xs text-green-600 mt-1">+5% vs target</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
