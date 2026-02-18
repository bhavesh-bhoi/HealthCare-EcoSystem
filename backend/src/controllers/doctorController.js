import { Doctor } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";
import { Prescription } from "../models/Prescription.js";
import { Patient } from "../models/User.js";
import { emitToPatient } from "../services/socketService.js";
import notificationService from "../services/notificationService.js";

// @desc    Get doctor profile
// @route   GET /api/doctor/profile
// @access  Private (Doctor only)
export const getDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email phone profileImage location",
    );

    if (!doctor) {
      return res.status(404).json({
        status: "error",
        message: "Doctor profile not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private (Doctor only)
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor appointments
// @route   GET /api/doctor/appointments
// @access  Private (Doctor only)
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const doctor = await Doctor.findOne({ userId: req.user._id });

    let query = { doctorId: doctor._id };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone profileImage" },
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      status: "success",
      results: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment details
// @route   GET /api/doctor/appointments/:id
// @access  Private (Doctor only)
export const getAppointmentDetails = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id,
    })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone profileImage" },
      })
      .populate("prescriptionId");

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private (Doctor only)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id,
    }).populate("patientId");

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    appointment.status = status;
    if (notes) appointment.consultationNotes = notes;
    await appointment.save();

    // Notify patient
    emitToPatient(appointment.patientId.userId, "appointment_status_updated", {
      appointmentId: appointment._id,
      status,
      notes,
    });

    // Send notification
    await notificationService.sendNotification({
      userId: appointment.patientId.userId,
      type: "appointment_status_updated",
      data: {
        doctorName: req.user.name,
        status,
        date: appointment.date,
        time: appointment.startTime,
      },
      channels: ["push", "sms"],
    });

    res.status(200).json({
      status: "success",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient history
// @route   GET /api/doctor/patients/:patientId/history
// @access  Private (Doctor only)
export const getPatientHistory = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    // Check if doctor has any appointments with this patient
    const hasAppointments = await Appointment.exists({
      doctorId: doctor._id,
      patientId: req.params.patientId,
    });

    if (!hasAppointments) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to view this patient's history",
      });
    }

    const patient = await Patient.findById(req.params.patientId).populate(
      "userId",
      "name email phone profileImage",
    );

    const appointments = await Appointment.find({
      patientId: req.params.patientId,
      doctorId: doctor._id,
    }).sort({ date: -1 });

    const prescriptions = await Prescription.find({
      patientId: req.params.patientId,
      doctorId: doctor._id,
    }).sort({ date: -1 });

    res.status(200).json({
      status: "success",
      data: {
        patient,
        appointments,
        prescriptions,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create prescription
// @route   POST /api/doctor/prescriptions
// @access  Private (Doctor only)
export const createPrescription = async (req, res, next) => {
  try {
    const { appointmentId, diagnosis, medicines, tests, notes, followUpDate } =
      req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id });

    // Verify appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    }).populate("patientId");

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      appointmentId,
      doctorId: doctor._id,
      patientId: appointment.patientId._id,
      diagnosis,
      medicines,
      tests,
      notes,
      followUpDate,
      digitalSignature: req.user.name,
    });

    // Update appointment with prescription
    appointment.prescriptionId = prescription._id;
    appointment.status = "completed";
    await appointment.save();

    // Notify patient
    emitToPatient(appointment.patientId.userId, "prescription_added", {
      prescriptionId: prescription._id,
      doctorName: req.user.name,
    });

    // Send notification
    await notificationService.sendNotification({
      userId: appointment.patientId.userId,
      type: "prescription_added",
      data: {
        doctorName: req.user.name,
        medicines: medicines.map((m) => m.name).join(", "),
      },
      channels: ["push", "email"],
    });

    res.status(201).json({
      status: "success",
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update prescription
// @route   PUT /api/doctor/prescriptions/:id
// @access  Private (Doctor only)
export const updatePrescription = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      doctorId: doctor._id,
    });

    if (!prescription) {
      return res.status(404).json({
        status: "error",
        message: "Prescription not found",
      });
    }

    Object.assign(prescription, req.body);
    await prescription.save();

    res.status(200).json({
      status: "success",
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor analytics
// @route   GET /api/doctor/analytics
// @access  Private (Doctor only)
export const getAnalytics = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get statistics
    const [
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      pendingAppointments,
      monthlyAppointments,
      yearlyAppointments,
      recentPatients,
      revenue,
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId: doctor._id }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        date: { $gte: today },
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: "completed",
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: "cancelled",
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: "pending",
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        date: { $gte: startOfMonth },
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        date: { $gte: startOfYear },
      }),
      // Get unique patients in last 30 days
      Appointment.distinct("patientId", {
        doctorId: doctor._id,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      // Calculate revenue
      Appointment.aggregate([
        {
          $match: {
            doctorId: doctor._id,
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$paymentAmount" },
          },
        },
      ]),
    ]);

    // Get appointments by mode
    const appointmentsByMode = await Appointment.aggregate([
      { $match: { doctorId: doctor._id } },
      {
        $group: {
          _id: "$mode",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly trend
    const monthlyTrend = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctor._id,
          date: { $gte: startOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        overview: {
          totalAppointments,
          todayAppointments,
          completedAppointments,
          cancelledAppointments,
          pendingAppointments,
          monthlyAppointments,
          yearlyAppointments,
          uniquePatients: recentPatients.length,
          revenue: revenue[0]?.total || 0,
        },
        appointmentsByMode,
        monthlyTrend,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set availability
// @route   PUT /api/doctor/availability
// @access  Private (Doctor only)
export const setAvailability = async (req, res, next) => {
  try {
    const { availableSlots, isAvailable } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (availableSlots) {
      doctor.availableSlots = availableSlots;
    }

    if (isAvailable !== undefined) {
      doctor.isAvailable = isAvailable;
    }

    await doctor.save();

    res.status(200).json({
      status: "success",
      data: {
        availableSlots: doctor.availableSlots,
        isAvailable: doctor.isAvailable,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available slots
// @route   GET /api/doctor/availability
// @access  Private (Doctor only)
export const getAvailableSlots = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    res.status(200).json({
      status: "success",
      data: {
        availableSlots: doctor.availableSlots,
        isAvailable: doctor.isAvailable,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start consultation
// @route   POST /api/doctor/appointments/:id/start
// @access  Private (Doctor only)
export const startConsultation = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id,
      status: "confirmed",
    }).populate("patientId");

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found or not confirmed",
      });
    }

    // Generate video call room (implement with your video service)
    const roomId = `room_${appointment._id}_${Date.now()}`;

    appointment.videoCallDetails = {
      roomId,
      roomUrl: `${process.env.VIDEO_SERVER_URL}/${roomId}`,
      startedAt: new Date(),
    };
    appointment.status = "in-progress";
    await appointment.save();

    // Notify patient
    emitToPatient(appointment.patientId.userId, "consultation_started", {
      appointmentId: appointment._id,
      roomId,
      roomUrl: appointment.videoCallDetails.roomUrl,
    });

    res.status(200).json({
      status: "success",
      data: {
        roomId,
        roomUrl: appointment.videoCallDetails.roomUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    End consultation
// @route   POST /api/doctor/appointments/:id/end
// @access  Private (Doctor only)
export const endConsultation = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctorId: doctor._id,
      status: "in-progress",
    });

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Consultation not found or not in progress",
      });
    }

    appointment.videoCallDetails.endedAt = new Date();
    appointment.status = "completed";
    await appointment.save();

    res.status(200).json({
      status: "success",
      message: "Consultation ended successfully",
    });
  } catch (error) {
    next(error);
  }
};
