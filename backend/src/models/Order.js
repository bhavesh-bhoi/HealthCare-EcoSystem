import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () =>
        "ORD" +
        Date.now() +
        Math.random().toString(36).substr(2, 5).toUpperCase(),
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    items: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: Number,
        discount: {
          type: Number,
          default: 0,
        },
        totalPrice: Number,
        isAvailable: {
          type: Boolean,
          default: true,
        },
        batchNumber: String,
        expiryDate: Date,
      },
    ],
    subtotal: Number,
    discountAmount: {
      type: Number,
      default: 0,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: Number,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "netbanking", "wallet"],
      required: true,
    },
    paymentDetails: {
      transactionId: String,
      paidAt: Date,
      refundId: String,
      refundedAt: Date,
    },
    deliveryAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: [Number],
      },
    },
    deliveryInstructions: String,
    estimatedDeliveryTime: Date,
    actualDeliveryTime: Date,
    deliveryPartner: {
      name: String,
      phone: String,
      vehicleNumber: String,
    },
    trackingHistory: [
      {
        status: String,
        location: {
          coordinates: [Number],
          address: String,
        },
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: String,
      },
    ],
    cancellationReason: String,
    cancelledBy: {
      type: String,
      enum: ["patient", "pharmacy", "admin"],
    },
    cancelledAt: Date,
    rating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      ratedAt: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
orderSchema.index({ patientId: 1, createdAt: -1 });
orderSchema.index({ pharmacyId: 1, status: 1 });
orderSchema.index({ status: 1 });
// orderSchema.index({ orderId: 1 });
orderSchema.index({ "deliveryAddress.coordinates": "2dsphere" });

// Pre-save middleware
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Calculate total amounts
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => {
      const itemTotal = (item.price || 0) * item.quantity;
      item.totalPrice = itemTotal;
      return sum + itemTotal;
    }, 0);

    this.totalAmount =
      this.subtotal -
      this.discountAmount +
      this.deliveryCharges +
      this.taxAmount;
  }

  next();
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function () {
  return ["pending", "confirmed"].includes(this.status);
};

// Static method to get orders by status
orderSchema.statics.getByStatus = function (pharmacyId, status) {
  return this.find({ pharmacyId, status })
    .populate("patientId", "userId")
    .populate("items.medicineId")
    .sort({ createdAt: -1 });
};

export const Order = mongoose.model("Order", orderSchema);
