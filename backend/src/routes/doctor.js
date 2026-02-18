import express from "express";
import {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getAppointmentDetails,
  updateAppointmentStatus,
  getPatientHistory,
  createPrescription,
  updatePrescription,
  getAnalytics,
  setAvailability,
  getAvailableSlots,
  startConsultation,
  endConsultation,
} from "../controllers/doctorController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("doctor"));

// Profile
router.route("/profile").get(getDoctorProfile).put(updateDoctorProfile);

// Availability
router.get("/availability", getAvailableSlots);
router.put("/availability", setAvailability);

// Appointments
router.get("/appointments", getDoctorAppointments);
router.get("/appointments/:id", getAppointmentDetails);
router.put("/appointments/:id/status", updateAppointmentStatus);

// Consultation
router.post("/appointments/:id/start", startConsultation);
router.post("/appointments/:id/end", endConsultation);

// Patients
router.get("/patients/:patientId/history", getPatientHistory);

// Prescriptions
router.post("/prescriptions", createPrescription);
router.put("/prescriptions/:id", updatePrescription);

// Analytics
router.get("/analytics", getAnalytics);

export default router;
