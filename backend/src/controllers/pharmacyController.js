import { Pharmacy } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Medicine } from "../models/Medicine.js";
import { emitToPatient } from "../services/socketService.js";
import notificationService from "../services/notificationService.js";

// @desc    Get pharmacy profile
// @route   GET /api/pharmacy/profile
// @access  Private (Pharmacy only)
export const getPharmacyProfile = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id })
      .populate("userId", "name email phone profileImage location")
      .populate("inventory.medicineId");

    if (!pharmacy) {
      return res.status(404).json({
        status: "error",
        message: "Pharmacy profile not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pharmacy profile
// @route   PUT /api/pharmacy/profile
// @access  Private (Pharmacy only)
export const updatePharmacyProfile = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    res.status(200).json({
      status: "success",
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy orders
// @route   GET /api/pharmacy/orders
// @access  Private (Pharmacy only)
export const getOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    let query = { pharmacyId: pharmacy._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
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
// @route   GET /api/pharmacy/orders/:id
// @access  Private (Pharmacy only)
export const getOrderDetails = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    const order = await Order.findOne({
      _id: req.params.id,
      pharmacyId: pharmacy._id,
    })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone" },
      })
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

// @desc    Update order status
// @route   PUT /api/pharmacy/orders/:id/status
// @access  Private (Pharmacy only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, deliveryPartner, estimatedDeliveryTime } = req.body;
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    const order = await Order.findOne({
      _id: req.params.id,
      pharmacyId: pharmacy._id,
    }).populate("patientId");

    if (!order) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    // Update order status
    order.status = status;
    if (deliveryPartner) order.deliveryPartner = deliveryPartner;
    if (estimatedDeliveryTime)
      order.estimatedDeliveryTime = estimatedDeliveryTime;

    // Add tracking history
    order.trackingHistory.push({
      status,
      timestamp: new Date(),
      note: `Order ${status}`,
    });

    // Update inventory if order is confirmed
    if (status === "confirmed") {
      for (const item of order.items) {
        const inventoryItem = pharmacy.inventory.find(
          (inv) => inv.medicineId.toString() === item.medicineId.toString(),
        );
        if (inventoryItem) {
          inventoryItem.stock -= item.quantity;
        }
      }
      await pharmacy.save();
    }

    // Set actual delivery time
    if (status === "delivered") {
      order.actualDeliveryTime = new Date();
    }

    await order.save();

    // Notify patient
    emitToPatient(order.patientId.userId, "order_status_updated", {
      orderId: order._id,
      status,
      estimatedDeliveryTime,
    });

    // Send notification
    await notificationService.sendNotification({
      userId: order.patientId.userId,
      type: `order_${status}`,
      data: {
        orderId: order.orderId,
        status,
        estimatedDelivery: estimatedDeliveryTime,
      },
      channels: ["push", "sms"],
    });

    res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory
// @route   GET /api/pharmacy/inventory
// @access  Private (Pharmacy only)
export const getInventory = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id }).populate(
      "inventory.medicineId",
    );

    // Get low stock items (less than 10 units)
    const lowStock = pharmacy.inventory.filter((item) => item.stock < 10);

    // Get out of stock items
    const outOfStock = pharmacy.inventory.filter((item) => item.stock === 0);

    // Get expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = pharmacy.inventory.filter(
      (item) =>
        item.expiryDate && new Date(item.expiryDate) <= thirtyDaysFromNow,
    );

    res.status(200).json({
      status: "success",
      data: {
        inventory: pharmacy.inventory,
        stats: {
          totalItems: pharmacy.inventory.length,
          lowStock: lowStock.length,
          outOfStock: outOfStock.length,
          expiringSoon: expiringSoon.length,
        },
        alerts: {
          lowStock,
          outOfStock,
          expiringSoon,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory
// @route   PUT /api/pharmacy/inventory
// @access  Private (Pharmacy only)
export const updateInventory = async (req, res, next) => {
  try {
    const { inventory } = req.body;
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    // Update inventory items
    for (const item of inventory) {
      const existingItem = pharmacy.inventory.find(
        (inv) => inv.medicineId.toString() === item.medicineId,
      );

      if (existingItem) {
        // Update existing item
        Object.assign(existingItem, item);
      } else {
        // Add new item
        pharmacy.inventory.push(item);
      }
    }

    await pharmacy.save();

    res.status(200).json({
      status: "success",
      data: pharmacy.inventory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check medicine availability
// @route   GET /api/pharmacy/medicine/:medicineId/check
// @access  Private (Pharmacy only)
export const checkMedicine = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    const inventoryItem = pharmacy.inventory.find(
      (item) => item.medicineId.toString() === req.params.medicineId,
    );

    if (!inventoryItem) {
      return res.status(404).json({
        status: "error",
        message: "Medicine not found in inventory",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        medicineId: inventoryItem.medicineId,
        stock: inventoryItem.stock,
        price: inventoryItem.price,
        batchNumber: inventoryItem.batchNumber,
        expiryDate: inventoryItem.expiryDate,
        isAvailable: inventoryItem.stock > 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy analytics
// @route   GET /api/pharmacy/analytics
// @access  Private (Pharmacy only)
export const getAnalytics = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Get order statistics
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      monthlyOrders,
      revenue,
      popularMedicines,
    ] = await Promise.all([
      Order.countDocuments({ pharmacyId: pharmacy._id }),
      Order.countDocuments({
        pharmacyId: pharmacy._id,
        status: { $in: ["pending", "confirmed", "preparing"] },
      }),
      Order.countDocuments({
        pharmacyId: pharmacy._id,
        status: "delivered",
      }),
      Order.countDocuments({
        pharmacyId: pharmacy._id,
        status: "cancelled",
      }),
      Order.countDocuments({
        pharmacyId: pharmacy._id,
        createdAt: { $gte: startOfMonth },
      }),
      // Calculate revenue
      Order.aggregate([
        {
          $match: {
            pharmacyId: pharmacy._id,
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
      // Get popular medicines
      Order.aggregate([
        { $match: { pharmacyId: pharmacy._id } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.medicineId",
            count: { $sum: "$items.quantity" },
            name: { $first: "$items.name" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: { pharmacyId: pharmacy._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly trend
    const monthlyTrend = await Order.aggregate([
      {
        $match: {
          pharmacyId: pharmacy._id,
          createdAt: { $gte: startOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        overview: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          monthlyOrders,
          revenue: revenue[0]?.total || 0,
          inventoryValue: pharmacy.inventory.reduce(
            (sum, item) => sum + item.price * item.stock,
            0,
          ),
        },
        ordersByStatus,
        monthlyTrend,
        popularMedicines,
        inventory: {
          totalItems: pharmacy.inventory.length,
          lowStock: pharmacy.inventory.filter((i) => i.stock < 10).length,
          outOfStock: pharmacy.inventory.filter((i) => i.stock === 0).length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add delivery partner
// @route   POST /api/pharmacy/delivery-partners
// @access  Private (Pharmacy only)
export const addDeliveryPartner = async (req, res, next) => {
  try {
    const { name, phone, vehicleNumber } = req.body;
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    pharmacy.deliveryPartners.push({
      name,
      phone,
      vehicleNumber,
      isAvailable: true,
    });

    await pharmacy.save();

    res.status(201).json({
      status: "success",
      data: pharmacy.deliveryPartners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery partner
// @route   PUT /api/pharmacy/delivery-partners/:id
// @access  Private (Pharmacy only)
export const updateDeliveryPartner = async (req, res, next) => {
  try {
    const { isAvailable, ...updates } = req.body;
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    const partner = pharmacy.deliveryPartners.id(req.params.id);

    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Delivery partner not found",
      });
    }

    Object.assign(partner, updates);
    if (isAvailable !== undefined) partner.isAvailable = isAvailable;

    await pharmacy.save();

    res.status(200).json({
      status: "success",
      data: pharmacy.deliveryPartners,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby orders for delivery
// @route   GET /api/pharmacy/orders/nearby
// @access  Private (Pharmacy only)
export const getNearbyOrders = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });

    // Find orders within delivery radius that are ready for pickup
    const orders = await Order.find({
      pharmacyId: pharmacy._id,
      status: "ready",
      "deliveryAddress.coordinates": {
        $near: {
          $geometry: pharmacy.userId.location.coordinates,
          $maxDistance: pharmacy.deliveryRadius * 1000, // Convert km to meters
        },
      },
    })
      .populate("patientId")
      .limit(20);

    res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
