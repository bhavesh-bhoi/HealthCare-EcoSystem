import express from "express";
import {
  getDashboard,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  verifyDoctor,
  getPharmacies,
  updatePharmacy,
  deletePharmacy,
  verifyPharmacy,
  getPatients,
  getAnalytics,
  getEmergencyCases,
  getRevenue,
  getDiseaseStats,
  manageUser,
  getSystemLogs,
} from "../controllers/adminController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// User management
router.get("/doctors", getDoctors);
router.put("/doctors/:id", updateDoctor);
router.delete("/doctors/:id", deleteDoctor);
router.put("/doctors/:id/verify", verifyDoctor);

router.get("/pharmacies", getPharmacies);
router.put("/pharmacies/:id", updatePharmacy);
router.delete("/pharmacies/:id", deletePharmacy);
router.put("/pharmacies/:id/verify", verifyPharmacy);

router.get("/patients", getPatients);
router.put("/users/:id/manage", manageUser);

// Analytics
router.get("/analytics", getAnalytics);
router.get("/revenue", getRevenue);
router.get("/disease-stats", getDiseaseStats);

// Emergency
router.get("/emergency-cases", getEmergencyCases);

// System
router.get("/logs", getSystemLogs);

export default router;
