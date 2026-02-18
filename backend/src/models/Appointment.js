import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
      default: () =>
        "APT" +
        Date.now() +
        Math.random().toString(36).substr(2, 5).toUpperCase(),
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: String,
    duration: {
      type: Number,
      default: 30, // minutes
    },
    mode: {
      type: String,
      enum: ["clinic", "home", "online"],
      required: [true, "Consultation mode is required"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rejected",
        "no-show",
        "rescheduled",
      ],
      default: "pending",
    },
    problem: {
      description: {
        type: String,
        required: [true, "Problem description is required"],
      },
      symptoms: [String],
      severity: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
      },
      duration: String,
      additionalNotes: String,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    emergencyDetails: {
      reportedBy: String,
      reportedAt: Date,
      responseTime: Number, // minutes
      actionTaken: String,
    },
    consultationNotes: String,
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "refunded", "failed"],
      default: "pending",
    },
    paymentAmount: Number,
    paymentMethod: String,
    paymentId: String,
    cancellationReason: String,
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    rescheduledTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
    feedback: {
      rating: Number,
      comment: String,
      submittedAt: Date,
    },
    videoCallDetails: {
      roomId: String,
      roomUrl: String,
      startedAt: Date,
      endedAt: Date,
      recordingUrl: String,
    },
    notifications: [
      {
        type: {
          type: String,
          enum: ["email", "sms", "push"],
        },
        sentAt: Date,
        status: String,
      },
    ],
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

// Indexes for better query performance
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ isEmergency: 1 });
// appointmentSchema.index({ appointmentId: 1 });

// Pre-save middleware to update timestamps
appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // Calculate end time if not provided
  if (this.startTime && !this.endTime) {
    const [hours, minutes] = this.startTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + this.duration);
    this.endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
  }

  next();
});

// Method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function () {
  const appointmentDate = new Date(this.date);
  const now = new Date();
  const hoursDifference = (appointmentDate - now) / (1000 * 60 * 60);
  return hoursDifference > 2 && ["pending", "confirmed"].includes(this.status);
};

// Static method to get upcoming appointments
appointmentSchema.statics.getUpcoming = function (doctorId, patientId) {
  const query = { date: { $gte: new Date() } };
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;

  return this.find(query)
    .populate("patientId", "userId")
    .populate("doctorId", "userId")
    .sort({ date: 1 });
};

export const Appointment = mongoose.model("Appointment", appointmentSchema);
