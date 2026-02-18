import express from "express";
import {
  getPatientProfile,
  updatePatientProfile,
  checkSymptoms,
  getAvailableDoctors,
  bookAppointment,
  getPatientAppointments,
  getAppointmentDetails,
  cancelAppointment,
  getPrescriptions,
  getPrescriptionDetails,
  getOrders,
  getOrderDetails,
  createOrder,
  trackOrder,
  getHealthDashboard,
  emergencyAlert,
  rateDoctor,
} from "../controllers/patientController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate, appointmentValidation } from "../middleware/validation.js";

const router = express.Router();

// All routes require authentication and patient role
router.use(authenticate);
router.use(authorize("patient"));

// Profile routes
router.route("/profile").get(getPatientProfile).put(updatePatientProfile);

// Symptom checker
router.post("/check-symptoms", checkSymptoms);

// Doctor search
router.get("/doctors", getAvailableDoctors);

// Appointment routes
router.post(
  "/appointments",
  validate(appointmentValidation.book),
  bookAppointment,
);
router.get("/appointments", getPatientAppointments);
router.get("/appointments/:id", getAppointmentDetails);
router.put("/appointments/:id/cancel", cancelAppointment);

// Prescription routes
router.get("/prescriptions", getPrescriptions);
router.get("/prescriptions/:id", getPrescriptionDetails);

// Order routes
router.get("/orders", getOrders);
router.post("/orders", createOrder);
router.get("/orders/:id", getOrderDetails);
router.get("/orders/:id/track", trackOrder);

// Dashboard and emergency
router.get("/dashboard", getHealthDashboard);
router.post("/emergency", emergencyAlert);

// Ratings
router.post("/rate-doctor", rateDoctor);

export default router;
