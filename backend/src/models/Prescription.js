import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: String,
      unique: true,
      default: () =>
        "PRC" +
        Date.now() +
        Math.random().toString(36).substr(2, 5).toUpperCase(),
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
    },
    symptoms: [String],
    medicines: [
      {
        name: {
          type: String,
          required: [true, "Medicine name is required"],
        },
        dosage: {
          type: String,
          required: [true, "Dosage is required"],
        },
        frequency: {
          type: String,
          required: [true, "Frequency is required"],
        },
        duration: {
          type: String,
          required: [true, "Duration is required"],
        },
        timing: [String], // morning, afternoon, evening, night
        withFood: {
          type: Boolean,
          default: false,
        },
        instructions: String,
        refillCount: {
          type: Number,
          default: 0,
        },
        refillsRemaining: {
          type: Number,
          default: 0,
        },
      },
    ],
    tests: [
      {
        name: String,
        instructions: String,
        isCompleted: {
          type: Boolean,
          default: false,
        },
        reportUrl: String,
      },
    ],
    notes: String,
    followUpDate: Date,
    followUpInstructions: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isChronic: {
      type: Boolean,
      default: false,
    },
    digitalSignature: {
      type: String,
      required: [true, "Doctor signature is required"],
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
prescriptionSchema.index({ patientId: 1, date: -1 });
prescriptionSchema.index({ doctorId: 1, date: -1 });
prescriptionSchema.index({ isActive: 1 });
prescriptionSchema.index({ followUpDate: 1 });

// Pre-save middleware
prescriptionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if prescription is expired
prescriptionSchema.methods.isExpired = function () {
  if (!this.followUpDate) return false;
  return new Date() > new Date(this.followUpDate);
};

// Static method to get active prescriptions
prescriptionSchema.statics.getActivePrescriptions = function (patientId) {
  return this.find({
    patientId,
    isActive: true,
    $or: [
      { followUpDate: { $exists: false } },
      { followUpDate: { $gte: new Date() } },
    ],
  }).sort({ date: -1 });
};

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
