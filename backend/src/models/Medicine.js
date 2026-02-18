import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    genericName: String,
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Pain Relief",
        "Antibiotic",
        "Antihistamine",
        "Antidiabetic",
        "Cardiovascular",
        "Gastric",
        "Respiratory",
        "Dermatological",
        "Neurological",
        "Psychiatric",
        "Hormonal",
        "Vitamin",
        "Mineral",
        "Other",
      ],
    },
    subCategory: String,
    manufacturer: String,
    description: String,
    composition: [
      {
        ingredient: String,
        strength: String,
      },
    ],
    forms: [
      {
        type: String,
        enum: [
          "Tablet",
          "Capsule",
          "Syrup",
          "Injection",
          "Cream",
          "Ointment",
          "Drops",
          "Inhaler",
          "Spray",
          "Patch",
        ],
      },
    ],
    strengths: [String],
    requiresPrescription: {
      type: Boolean,
      default: true,
    },
    isControlled: {
      type: Boolean,
      default: false,
    },
    sideEffects: [String],
    contraindications: [String],
    warnings: [String],
    storageInstructions: String,
    imageUrl: String,
    isActive: {
      type: Boolean,
      default: true,
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

// Index for search
medicineSchema.index({ name: "text", genericName: "text", category: "text" });

export const Medicine = mongoose.model("Medicine", medicineSchema);
