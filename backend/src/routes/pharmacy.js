import express from "express";
import {
  getPharmacyProfile,
  updatePharmacyProfile,
  getOrders,
  getOrderDetails,
  updateOrderStatus,
  getInventory,
  updateInventory,
  checkMedicine,
  getAnalytics,
  addDeliveryPartner,
  updateDeliveryPartner,
  getNearbyOrders,
} from "../controllers/pharmacyController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("pharmacy"));

// Profile
router.route("/profile").get(getPharmacyProfile).put(updatePharmacyProfile);

// Orders
router.get("/orders", getOrders);
router.get("/orders/nearby", getNearbyOrders);
router.get("/orders/:id", getOrderDetails);
router.put("/orders/:id/status", updateOrderStatus);

// Inventory
router.get("/inventory", getInventory);
router.put("/inventory", updateInventory);
router.get("/medicine/:medicineId/check", checkMedicine);

// Delivery partners
router.post("/delivery-partners", addDeliveryPartner);
router.put("/delivery-partners/:id", updateDeliveryPartner);

// Analytics
router.get("/analytics", getAnalytics);

export default router;
