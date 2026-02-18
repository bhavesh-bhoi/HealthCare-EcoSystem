import { User, Doctor, Pharmacy, Patient } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";
import { Order } from "../models/Order.js";
import { Prescription } from "../models/Prescription.js";
import { Medicine } from "../models/Medicine.js";

// @desc    Get admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
export const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get counts
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalPharmacies,
      totalAppointments,
      totalOrders,
      todayAppointments,
      pendingApprovals,
      revenue,
    ] = await Promise.all([
      User.countDocuments(),
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Pharmacy.countDocuments(),
      Appointment.countDocuments(),
      Order.countDocuments(),
      Appointment.countDocuments({ date: { $gte: today } }),
      Doctor.countDocuments({ isVerified: false }),
      Order.aggregate([
        { $match: { paymentStatus: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    // Recent activities
    const recentAppointments = await Appointment.find()
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name" },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentOrders = await Order.find()
      .populate("patientId")
      .populate("pharmacyId")
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly trends
    const monthlyAppointments = await Appointment.aggregate([
      { $match: { date: { $gte: startOfYear } } },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear },
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        overview: {
          totalUsers,
          totalPatients,
          totalDoctors,
          totalPharmacies,
          totalAppointments,
          totalOrders,
          todayAppointments,
          pendingApprovals,
          revenue: revenue[0]?.total || 0,
        },
        recentActivities: {
          appointments: recentAppointments,
          orders: recentOrders,
        },
        trends: {
          appointments: monthlyAppointments,
          revenue: monthlyRevenue,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
export const getDoctors = async (req, res, next) => {
  try {
    const { status, specialization, search } = req.query;

    let query = {};

    if (status === "pending") {
      query.isVerified = false;
    } else if (status === "verified") {
      query.isVerified = true;
    }

    if (specialization) {
      query.specialization = specialization;
    }

    const doctors = await Doctor.find(query)
      .populate("userId", "name email phone profileImage isActive createdAt")
      .sort({ createdAt: -1 });

    // Search filter
    let filteredDoctors = doctors;
    if (search) {
      filteredDoctors = doctors.filter(
        (doc) =>
          doc.userId.name.toLowerCase().includes(search.toLowerCase()) ||
          doc.userId.email.toLowerCase().includes(search.toLowerCase()) ||
          doc.specialization.toLowerCase().includes(search.toLowerCase()),
      );
    }

    res.status(200).json({
      status: "success",
      results: filteredDoctors.length,
      data: filteredDoctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private (Admin only)
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("userId");

    if (!doctor) {
      return res.status(404).json({
        status: "error",
        message: "Doctor not found",
      });
    }

    // Update doctor fields
    Object.assign(doctor, req.body);
    await doctor.save();

    // Update user fields if provided
    if (req.body.name || req.body.email || req.body.phone) {
      const userUpdates = {};
      if (req.body.name) userUpdates.name = req.body.name;
      if (req.body.email) userUpdates.email = req.body.email;
      if (req.body.phone) userUpdates.phone = req.body.phone;

      await User.findByIdAndUpdate(doctor.userId._id, userUpdates);
    }

    res.status(200).json({
      status: "success",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private (Admin only)
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: "error",
        message: "Doctor not found",
      });
    }

    // Delete user and doctor profile
    await User.findByIdAndDelete(doctor.userId);
    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify doctor
// @route   PUT /api/admin/doctors/:id/verify
// @access  Private (Admin only)
export const verifyDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        status: "error",
        message: "Doctor not found",
      });
    }

    doctor.isVerified = true;
    await doctor.save();

    // Update user verification
    await User.findByIdAndUpdate(doctor.userId, { isVerified: true });

    res.status(200).json({
      status: "success",
      message: "Doctor verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pharmacies
// @route   GET /api/admin/pharmacies
// @access  Private (Admin only)
export const getPharmacies = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let query = {};

    if (status === "pending") {
      query.isVerified = false;
    } else if (status === "verified") {
      query.isVerified = true;
    }

    const pharmacies = await Pharmacy.find(query)
      .populate("userId", "name email phone profileImage isActive createdAt")
      .sort({ createdAt: -1 });

    // Search filter
    let filteredPharmacies = pharmacies;
    if (search) {
      filteredPharmacies = pharmacies.filter(
        (pharm) =>
          pharm.userId.name.toLowerCase().includes(search.toLowerCase()) ||
          pharm.userId.email.toLowerCase().includes(search.toLowerCase()) ||
          pharm.licenseNumber?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    res.status(200).json({
      status: "success",
      results: filteredPharmacies.length,
      data: filteredPharmacies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pharmacy
// @route   PUT /api/admin/pharmacies/:id
// @access  Private (Admin only)
export const updatePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate("userId");

    if (!pharmacy) {
      return res.status(404).json({
        status: "error",
        message: "Pharmacy not found",
      });
    }

    Object.assign(pharmacy, req.body);
    await pharmacy.save();

    if (req.body.name || req.body.email || req.body.phone) {
      const userUpdates = {};
      if (req.body.name) userUpdates.name = req.body.name;
      if (req.body.email) userUpdates.email = req.body.email;
      if (req.body.phone) userUpdates.phone = req.body.phone;

      await User.findByIdAndUpdate(pharmacy.userId._id, userUpdates);
    }

    res.status(200).json({
      status: "success",
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pharmacy
// @route   DELETE /api/admin/pharmacies/:id
// @access  Private (Admin only)
export const deletePharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        status: "error",
        message: "Pharmacy not found",
      });
    }

    await User.findByIdAndDelete(pharmacy.userId);
    await Pharmacy.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Pharmacy deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify pharmacy
// @route   PUT /api/admin/pharmacies/:id/verify
// @access  Private (Admin only)
export const verifyPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        status: "error",
        message: "Pharmacy not found",
      });
    }

    pharmacy.isVerified = true;
    await pharmacy.save();

    await User.findByIdAndUpdate(pharmacy.userId, { isVerified: true });

    res.status(200).json({
      status: "success",
      message: "Pharmacy verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private (Admin only)
export const getPatients = async (req, res, next) => {
  try {
    const { search } = req.query;

    const patients = await Patient.find()
      .populate("userId", "name email phone profileImage isActive createdAt")
      .sort({ createdAt: -1 });

    let filteredPatients = patients;
    if (search) {
      filteredPatients = patients.filter(
        (pat) =>
          pat.userId.name.toLowerCase().includes(search.toLowerCase()) ||
          pat.userId.email.toLowerCase().includes(search.toLowerCase()),
      );
    }

    res.status(200).json({
      status: "success",
      results: filteredPatients.length,
      data: filteredPatients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manage user (activate/deactivate)
// @route   PUT /api/admin/users/:id/manage
// @access  Private (Admin only)
export const manageUser = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      status: "success",
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin only)
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = "month" } = req.query;

    let startDate;
    const today = new Date();

    switch (period) {
      case "week":
        startDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case "month":
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        break;
      case "year":
        startDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        startDate = new Date(today.setMonth(today.getMonth() - 1));
    }

    const [
      userGrowth,
      appointmentStats,
      orderStats,
      revenueStats,
      popularSpecialties,
      popularMedicines,
    ] = await Promise.all([
      // User growth
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]),

      // Appointment statistics
      Appointment.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Order statistics
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Revenue statistics
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$totalAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Popular specialties
      Doctor.aggregate([
        {
          $group: {
            _id: "$specialization",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // Popular medicines
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            count: { $sum: "$items.quantity" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        period,
        userGrowth,
        appointmentStats,
        orderStats,
        revenueStats,
        popularSpecialties,
        popularMedicines,
        platformStats: {
          totalUsers: await User.countDocuments(),
          activeToday: await User.countDocuments({
            lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          }),
          completionRate: await calculateCompletionRate(),
          averageResponseTime: await calculateAverageResponseTime(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue report
// @route   GET /api/admin/revenue
// @access  Private (Admin only)
export const getRevenue = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { paymentStatus: "completed" };

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const revenue = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const total = revenue.reduce((sum, item) => sum + item.total, 0);

    res.status(200).json({
      status: "success",
      data: {
        total,
        breakdown: revenue,
        averageOrderValue:
          total / revenue.reduce((sum, item) => sum + item.count, 0) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get disease statistics
// @route   GET /api/admin/disease-stats
// @access  Private (Admin only)
export const getDiseaseStats = async (req, res, next) => {
  try {
    const diseaseStats = await Prescription.aggregate([
      {
        $group: {
          _id: "$diagnosis",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const seasonalTrends = await Prescription.aggregate([
      {
        $group: {
          _id: {
            diagnosis: "$diagnosis",
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        commonDiseases: diseaseStats,
        seasonalTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get emergency cases
// @route   GET /api/admin/emergency-cases
// @access  Private (Admin only)
export const getEmergencyCases = async (req, res, next) => {
  try {
    const emergencies = await Appointment.find({
      isEmergency: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name phone" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name" },
      })
      .sort({ createdAt: -1 });

    const stats = {
      total: emergencies.length,
      resolved: emergencies.filter((e) => e.status === "completed").length,
      pending: emergencies.filter((e) => e.status === "confirmed").length,
      averageResponseTime: calculateAverageResponseTime(emergencies),
    };

    res.status(200).json({
      status: "success",
      data: {
        stats,
        emergencies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
export const getSystemLogs = async (req, res, next) => {
  try {
    const { level, limit = 100 } = req.query;

    // This would integrate with your logging system (e.g., Winston, Morgan)
    // For now, return placeholder
    res.status(200).json({
      status: "success",
      data: {
        message: "Logs feature requires integration with logging service",
        logs: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions
const calculateCompletionRate = async () => {
  const total = await Appointment.countDocuments();
  const completed = await Appointment.countDocuments({ status: "completed" });
  return total > 0 ? (completed / total) * 100 : 0;
};

const calculateAverageResponseTime = async (emergencies = null) => {
  if (!emergencies) {
    emergencies = await Appointment.find({
      isEmergency: true,
      status: "completed",
    });
  }

  if (emergencies.length === 0) return 0;

  const totalTime = emergencies.reduce((sum, e) => {
    if (e.emergencyDetails?.responseTime) {
      return sum + e.emergencyDetails.responseTime;
    }
    return sum;
  }, 0);

  return totalTime / emergencies.length;
};
