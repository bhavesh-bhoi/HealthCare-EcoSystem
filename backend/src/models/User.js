import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Base User Schema
const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["patient", "doctor", "pharmacy", "admin"],
      required: [true, "Role is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
        "Please enter a valid phone number",
      ],
    },
    profileImage: {
      type: String,
      default: "default-avatar.png",
    },
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number],
          default: [0, 0], // Default coordinates
          index: "2dsphere",
        },
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
  },
  {
    timestamps: true,
  },
);

// Create index for location-based queries
userSchema.index({ "location.coordinates": "2dsphere" });

// Hash password before saving - FIXED VERSION (no next parameter)
userSchema.pre("save", async function () {
  // Only hash if password is modified (or new)
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error; // Throw error instead of calling next()
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Patient Schema
const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
      max: [150, "Age cannot exceed 150"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    dateOfBirth: Date,
    height: Number,
    weight: Number,
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        treatedBy: String,
        hospital: String,
        status: {
          type: String,
          enum: ["active", "resolved", "ongoing"],
          default: "active",
        },
        medications: [String],
        notes: String,
        documents: [
          {
            name: String,
            url: String,
            uploadedAt: Date,
          },
        ],
      },
    ],
    allergies: [
      {
        allergen: String,
        reaction: String,
        severity: {
          type: String,
          enum: ["mild", "moderate", "severe"],
        },
      },
    ],
    chronicConditions: [String],
    surgeries: [
      {
        name: String,
        date: Date,
        hospital: String,
        notes: String,
      },
    ],
    familyHistory: [
      {
        relation: String,
        condition: String,
        notes: String,
      },
    ],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      expiryDate: Date,
    },
    preferredPharmacies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pharmacy",
      },
    ],
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
);

// Doctor Schema
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, "Specialization is required"],
    },
    qualification: [
      {
        degree: String,
        institution: String,
        year: Number,
        certificate: String,
      },
    ],
    experience: {
      type: Number,
      default: 0,
    },
    registrationNumber: {
      type: String,
      required: [true, "Medical registration number is required"],
    },
    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
    },
    availableSlots: [
      {
        date: Date,
        slots: [
          {
            startTime: String,
            endTime: String,
            isBooked: { type: Boolean, default: false },
            bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
            mode: {
              type: String,
              enum: ["clinic", "home", "online"],
              default: "clinic",
            },
          },
        ],
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
        rating: Number,
        comment: String,
        date: { type: Date, default: Date.now },
      },
    ],
    clinicAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: [Number],
      },
    },
    languages: [String],
    services: [String],
    awards: [
      {
        title: String,
        year: Number,
        description: String,
      },
    ],
    publications: [
      {
        title: String,
        journal: String,
        year: Number,
        link: String,
      },
    ],
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
  },
  {
    timestamps: true,
  },
);

doctorSchema.index({ "clinicAddress.coordinates": "2dsphere" });

// Pharmacy Schema
const pharmacySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
    },
    gstNumber: String,
    deliveryRadius: {
      type: Number,
      default: 5,
    },
    isDeliveryAvailable: {
      type: Boolean,
      default: true,
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
    },
    deliveryCharges: {
      type: Number,
      default: 0,
    },
    inventory: [
      {
        medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
        stock: { type: Number, default: 0 },
        price: Number,
        batchNumber: String,
        expiryDate: Date,
        discount: { type: Number, default: 0 },
      },
    ],
    operatingHours: {
      monday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      tuesday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      wednesday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      thursday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      friday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      saturday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: false },
      },
      sunday: {
        open: String,
        close: String,
        closed: { type: Boolean, default: true },
      },
    },
    deliveryPartners: [
      {
        name: String,
        phone: String,
        vehicleNumber: String,
        isAvailable: { type: Boolean, default: true },
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Export models
export const User = mongoose.model("User", userSchema);
export const Patient = mongoose.model("Patient", patientSchema);
export const Doctor = mongoose.model("Doctor", doctorSchema);
export const Pharmacy = mongoose.model("Pharmacy", pharmacySchema);
