import { Patient } from "../models/User.js";
import { Appointment } from "../models/Appointment.js";
import { Prescription } from "../models/Prescription.js";
import { Order } from "../models/Order.js";
import { Doctor } from "../models/User.js";
import aiSymptomChecker from "../services/aiSymptomChecker.js";
import healthRiskScoring from "../services/healthRiskScoring.js";
import { sendNotification } from "../services/notificationService.js";

// @desc    Get patient profile
// @route   GET /api/patient/profile
// @access  Private
export const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id })
      .populate("userId", "name email phone location profileImage")
      .populate("preferredPharmacies", "name location");

    if (!patient) {
      return res.status(404).json({
        status: "error",
        message: "Patient profile not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private
export const updatePatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check symptoms using AI
// @route   POST /api/patient/check-symptoms
// @access  Private
export const checkSymptoms = async (req, res, next) => {
  try {
    const { symptoms } = req.body;

    // Get patient data for risk adjustment
    const patient = await Patient.findOne({ userId: req.user._id });

    // Analyze symptoms
    const analysis = aiSymptomChecker.analyzeSymptoms(symptoms, patient);

    // Calculate risk score
    const riskScore = healthRiskScoring.calculateRiskScore(patient, symptoms);

    res.status(200).json({
      status: "success",
      data: {
        analysis,
        riskScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available doctors
// @route   GET /api/patient/doctors
// @access  Private
export const getAvailableDoctors = async (req, res, next) => {
  try {
    const {
      specialization,
      location,
      mode,
      date,
      latitude,
      longitude,
      maxDistance,
    } = req.query;

    let query = { isAvailable: true };

    if (specialization) {
      query.specialization = specialization;
    }

    // Get doctors
    let doctors = await Doctor.find(query)
      .populate("userId", "name email phone profileImage rating")
      .select("-bankDetails -qualification -awards -publications");

    // Filter by availability for specific date
    if (date) {
      const selectedDate = new Date(date);
      doctors = doctors.filter((doctor) => {
        const slots = doctor.availableSlots.find(
          (slot) =>
            new Date(slot.date).toDateString() === selectedDate.toDateString(),
        );
        return slots && slots.slots.some((s) => !s.isBooked);
      });
    }

    // Filter by mode
    if (mode) {
      doctors = doctors.filter((doctor) => {
        // Check if doctor supports this mode (you can add this field to doctor schema)
        return true; // For now, assume all doctors support all modes
      });
    }

    // Location-based filtering
    if (latitude && longitude) {
      doctors = doctors.filter((doctor) => {
        if (doctor.clinicAddress?.coordinates?.coordinates) {
          const [docLng, docLat] = doctor.clinicAddress.coordinates.coordinates;
          const distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            docLat,
            docLng,
          );
          return distance <= (maxDistance || 10); // Default 10km radius
        }
        return false;
      });

      // Sort by distance
      doctors.sort((a, b) => {
        const distA = a.clinicAddress?.coordinates?.coordinates
          ? calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              a.clinicAddress.coordinates.coordinates[1],
              a.clinicAddress.coordinates.coordinates[0],
            )
          : Infinity;
        const distB = b.clinicAddress?.coordinates?.coordinates
          ? calculateDistance(
              parseFloat(latitude),
              parseFloat(longitude),
              b.clinicAddress.coordinates.coordinates[1],
              b.clinicAddress.coordinates.coordinates[0],
            )
          : Infinity;
        return distA - distB;
      });
    }

    res.status(200).json({
      status: "success",
      results: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

// @desc    Book appointment
// @route   POST /api/patient/appointments
// @access  Private
export const bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, startTime, mode, problem, isEmergency } = req.body;

    const patient = await Patient.findOne({ userId: req.user._id });

    // Check if doctor exists and is available
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        status: "error",
        message: "Doctor not found",
      });
    }

    // Check doctor availability for the slot
    const slotDate = new Date(date);
    const slotIndex = doctor.availableSlots.findIndex(
      (slot) => new Date(slot.date).toDateString() === slotDate.toDateString(),
    );

    if (slotIndex === -1) {
      return res.status(400).json({
        status: "error",
        message: "Doctor not available on this date",
      });
    }

    const timeSlot = doctor.availableSlots[slotIndex].slots.find(
      (s) => s.startTime === startTime && !s.isBooked,
    );

    if (!timeSlot) {
      return res.status(400).json({
        status: "error",
        message: "Time slot not available",
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      date: slotDate,
      startTime,
      mode,
      problem,
      isEmergency: isEmergency || false,
      status: isEmergency ? "confirmed" : "pending",
    });

    // Mark slot as booked
    timeSlot.isBooked = true;
    timeSlot.bookedBy = patient._id;
    timeSlot.mode = mode;
    await doctor.save();

    // Send notifications
    const io = req.app.get("io");
    io.to(`doctor_${doctorId}`).emit("new_appointment", {
      appointmentId: appointment._id,
      patientName: req.user.name,
      time: startTime,
      mode,
    });

    // Send email/SMS notifications
    await sendNotification({
      userId: doctor.userId,
      type: "appointment_booked",
      data: {
        patientName: req.user.name,
        date: slotDate.toLocaleDateString(),
        time: startTime,
        mode,
      },
    });

    // If emergency, notify nearby doctors
    if (isEmergency) {
      handleEmergencyAppointment(appointment, doctor, patient);
    }

    res.status(201).json({
      status: "success",
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// Handle emergency appointment
const handleEmergencyAppointment = async (appointment, doctor, patient) => {
  // Find nearby available doctors
  const nearbyDoctors = await Doctor.find({
    _id: { $ne: doctor._id },
    isAvailable: true,
    "clinicAddress.coordinates": {
      $near: {
        $geometry: doctor.clinicAddress.coordinates,
        $maxDistance: 5000, // 5km radius
      },
    },
  }).limit(3);

  // Send emergency alerts
  const io = appointment.get("io");

  nearbyDoctors.forEach((doc) => {
    io.to(`doctor_${doc._id}`).emit("emergency_alert", {
      patientId: patient._id,
      patientName: patient.userId?.name,
      location: patient.userId?.location,
      appointmentId: appointment._id,
    });
  });

  // Notify emergency services (in production)
  console.log("Emergency alert sent to nearby doctors");
};

// @desc    Get patient appointments
// @route   GET /api/patient/appointments
// @access  Private
export const getPatientAppointments = async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;
    const patient = await Patient.findOne({ userId: req.user._id });

    let query = { patientId: patient._id };

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
        path: "doctorId",
        populate: { path: "userId", select: "name email phone profileImage" },
      })
      .sort({ date: -1, startTime: -1 });

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
// @route   GET /api/patient/appointments/:id
// @access  Private
export const getAppointmentDetails = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: patient._id,
    })
      .populate({
        path: "doctorId",
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

// @desc    Cancel appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private
export const cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const patient = await Patient.findOne({ userId: req.user._id });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patientId: patient._id,
    });

    if (!appointment) {
      return res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    }

    if (!appointment.canBeCancelled()) {
      return res.status(400).json({
        status: "error",
        message: "Appointment cannot be cancelled at this time",
      });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = reason;
    await appointment.save();

    // Free up the doctor's slot
    const doctor = await Doctor.findById(appointment.doctorId);
    const slotDate = new Date(appointment.date);
    const slotIndex = doctor.availableSlots.findIndex(
      (slot) => new Date(slot.date).toDateString() === slotDate.toDateString(),
    );

    if (slotIndex !== -1) {
      const timeSlot = doctor.availableSlots[slotIndex].slots.find(
        (s) => s.startTime === appointment.startTime,
      );
      if (timeSlot) {
        timeSlot.isBooked = false;
        timeSlot.bookedBy = undefined;
        await doctor.save();
      }
    }

    // Notify doctor
    const io = req.app.get("io");
    io.to(`doctor_${appointment.doctorId}`).emit("appointment_cancelled", {
      appointmentId: appointment._id,
      reason,
    });

    res.status(200).json({
      status: "success",
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient prescriptions
// @route   GET /api/patient/prescriptions
// @access  Private
export const getPrescriptions = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name" },
      })
      .populate("appointmentId")
      .sort({ date: -1 });

    res.status(200).json({
      status: "success",
      results: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription details
// @route   GET /api/patient/prescriptions/:id
// @access  Private
export const getPrescriptionDetails = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    const prescription = await Prescription.findOne({
      _id: req.params.id,
      patientId: patient._id,
    })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name" },
      })
      .populate("appointmentId");

    if (!prescription) {
      return res.status(404).json({
        status: "error",
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient orders
// @route   GET /api/patient/orders
// @access  Private
export const getOrders = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    const orders = await Order.find({ patientId: patient._id })
      .populate("pharmacyId")
      .populate("items.medicineId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/patient/orders/:id
// @access  Private
export const getOrderDetails = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    const order = await Order.findOne({
      _id: req.params.id,
      patientId: patient._id,
    })
      .populate("pharmacyId")
      .populate("items.medicineId")
      .populate("prescriptionId");

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order from prescription
// @route   POST /api/patient/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { prescriptionId, pharmacyId, items, deliveryAddress } = req.body;
    const patient = await Patient.findOne({ userId: req.user._id });

    // Verify prescription
    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      patientId: patient._id,
    });

    if (!prescription) {
      return res.status(404).json({
        status: "error",
        message: "Prescription not found",
      });
    }

    // Verify pharmacy
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({
        status: "error",
        message: "Pharmacy not found",
      });
    }

    // Create order
    const order = await Order.create({
      prescriptionId,
      pharmacyId,
      patientId: patient._id,
      items,
      deliveryAddress,
      status: "pending",
      paymentStatus: "pending",
    });

    // Notify pharmacy
    const io = req.app.get("io");
    io.to(`pharmacy_${pharmacyId}`).emit("new_order", {
      orderId: order._id,
      patientName: req.user.name,
    });

    res.status(201).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track order
// @route   GET /api/patient/orders/:id/track
// @access  Private
export const trackOrder = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    const order = await Order.findOne({
      _id: req.params.id,
      patientId: patient._id,
    }).select(
      "status trackingHistory estimatedDeliveryTime actualDeliveryTime",
    );

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get health dashboard
// @route   GET /api/patient/dashboard
// @access  Private
export const getHealthDashboard = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      patientId: patient._id,
      date: { $gte: new Date() },
      status: { $in: ["pending", "confirmed"] },
    })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name" },
      })
      .sort({ date: 1 })
      .limit(5);

    // Get recent prescriptions
    const recentPrescriptions = await Prescription.find({
      patientId: patient._id,
    })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name" },
      })
      .sort({ date: -1 })
      .limit(5);

    // Get active orders
    const activeOrders = await Order.find({
      patientId: patient._id,
      status: { $nin: ["delivered", "cancelled"] },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate risk score
    const recentAppointments = await Appointment.find({
      patientId: patient._id,
      status: "completed",
    })
      .sort({ date: -1 })
      .limit(10);

    const riskHistory = recentAppointments.map((app) => ({
      date: app.date,
      severity: app.problem?.severity || "low",
    }));

    // Get active medicines
    const activeMedicines = await Prescription.aggregate([
      {
        $match: {
          patientId: patient._id,
          isActive: true,
          $or: [
            { followUpDate: { $exists: false } },
            { followUpDate: { $gte: new Date() } },
          ],
        },
      },
      { $unwind: "$medicines" },
      {
        $group: {
          _id: "$medicines.name",
          dosage: { $first: "$medicines.dosage" },
          frequency: { $first: "$medicines.frequency" },
          duration: { $first: "$medicines.duration" },
          instructions: { $first: "$medicines.instructions" },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        patient: {
          name: req.user.name,
          age: patient.age,
          bloodGroup: patient.bloodGroup,
          allergies: patient.allergies,
        },
        stats: {
          totalAppointments: await Appointment.countDocuments({
            patientId: patient._id,
          }),
          totalPrescriptions: await Prescription.countDocuments({
            patientId: patient._id,
          }),
          totalOrders: await Order.countDocuments({ patientId: patient._id }),
          completedAppointments: await Appointment.countDocuments({
            patientId: patient._id,
            status: "completed",
          }),
        },
        upcomingAppointments,
        recentPrescriptions,
        activeOrders,
        riskHistory,
        activeMedicines,
        emergencyContact: patient.emergencyContact,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Emergency alert
// @route   POST /api/patient/emergency
// @access  Private
export const emergencyAlert = async (req, res, next) => {
  try {
    const { description, location } = req.body;
    const patient = await Patient.findOne({ userId: req.user._id }).populate(
      "userId",
    );

    // Find nearby available doctors
    const nearbyDoctors = await Doctor.find({
      isAvailable: true,
      "clinicAddress.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: location?.coordinates ||
              patient.userId.location?.coordinates || [0, 0],
          },
          $maxDistance: 10000, // 10km radius
        },
      },
    })
      .populate("userId", "name phone")
      .limit(5);

    // Create emergency appointment
    const emergencyAppointment = await Appointment.create({
      patientId: patient._id,
      doctorId: nearbyDoctors[0]?._id,
      date: new Date(),
      startTime: new Date().toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      }),
      mode: "online",
      problem: {
        description: description || "Emergency consultation required",
        severity: "high",
      },
      isEmergency: true,
      status: "confirmed",
    });

    // Send alerts via WebSocket
    const io = req.app.get("io");

    const notifiedDoctors = [];
    for (const doctor of nearbyDoctors) {
      io.to(`doctor_${doctor._id}`).emit("emergency_alert", {
        patientId: patient._id,
        patientName: req.user.name,
        patientPhone: req.user.phone,
        location: patient.userId.location,
        description,
        appointmentId: emergencyAppointment._id,
        timestamp: new Date(),
      });

      notifiedDoctors.push({
        id: doctor._id,
        name: doctor.userId.name,
        phone: doctor.userId.phone,
      });
    }

    // Send SMS to emergency contact (in production)
    if (patient.emergencyContact?.phone) {
      // await sendSMS({
      //   to: patient.emergencyContact.phone,
      //   message: `Emergency alert: ${req.user.name} has initiated an emergency medical request. Please contact them immediately.`
      // });
    }

    res.status(200).json({
      status: "success",
      message: "Emergency alert sent successfully",
      data: {
        appointment: emergencyAppointment,
        notifiedDoctors,
        instructions:
          "Medical assistance is being arranged. Please stay calm and wait for help.",
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate doctor
// @route   POST /api/patient/rate-doctor
// @access  Private
export const rateDoctor = async (req, res, next) => {
  try {
    const { doctorId, rating, comment } = req.body;
    const patient = await Patient.findOne({ userId: req.user._id });

    // Check if patient had an appointment with this doctor
    const appointment = await Appointment.findOne({
      patientId: patient._id,
      doctorId,
      status: "completed",
    });

    if (!appointment) {
      return res.status(400).json({
        status: "error",
        message: "You can only rate doctors you have visited",
      });
    }

    const doctor = await Doctor.findById(doctorId);

    // Add review
    doctor.reviews.push({
      patientId: patient._id,
      rating,
      comment,
      date: new Date(),
    });

    // Update average rating
    const totalRating = doctor.reviews.reduce((sum, r) => sum + r.rating, 0);
    doctor.rating = totalRating / doctor.reviews.length;
    doctor.totalReviews = doctor.reviews.length;

    await doctor.save();

    res.status(200).json({
      status: "success",
      message: "Rating submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};
