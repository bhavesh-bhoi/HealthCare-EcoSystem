import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User, Patient, Doctor, Pharmacy } from "../src/models/User.js";
import { Medicine } from "../src/models/Medicine.js";
import { Appointment } from "../src/models/Appointment.js";
import { Prescription } from "../src/models/Prescription.js";
import { Order } from "../src/models/Order.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Pharmacy.deleteMany({});
    await Medicine.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Order.deleteMany({});

    console.log("🗑️  Cleared existing data");

    // Create medicines
    const medicines = [
      {
        name: "Paracetamol",
        genericName: "Acetaminophen",
        category: "Pain Relief",
        subCategory: "Analgesic",
        manufacturer: "Generic Pharma",
        description: "Used for pain relief and fever reduction",
        composition: [{ ingredient: "Paracetamol", strength: "500mg" }],
        forms: ["Tablet", "Syrup"],
        strengths: ["500mg", "650mg"],
        requiresPrescription: false,
        sideEffects: ["Nausea", "Rash"],
        contraindications: ["Liver disease"],
        isActive: true,
      },
      {
        name: "Amoxicillin",
        genericName: "Amoxicillin",
        category: "Antibiotic",
        manufacturer: "MediLife",
        description: "Antibiotic for bacterial infections",
        composition: [{ ingredient: "Amoxicillin", strength: "500mg" }],
        forms: ["Capsule", "Syrup"],
        strengths: ["250mg", "500mg"],
        requiresPrescription: true,
        sideEffects: ["Diarrhea", "Nausea"],
        contraindications: ["Penicillin allergy"],
        isActive: true,
      },
      {
        name: "Cetirizine",
        genericName: "Cetirizine Hydrochloride",
        category: "Antihistamine",
        manufacturer: "AllergyCare",
        description: "For allergy symptoms",
        composition: [{ ingredient: "Cetirizine", strength: "10mg" }],
        forms: ["Tablet", "Syrup"],
        strengths: ["10mg"],
        requiresPrescription: false,
        sideEffects: ["Drowsiness"],
        contraindications: [],
        isActive: true,
      },
      {
        name: "Metformin",
        genericName: "Metformin Hydrochloride",
        category: "Antidiabetic",
        manufacturer: "DiabetesCare",
        description: "For type 2 diabetes",
        composition: [{ ingredient: "Metformin", strength: "500mg" }],
        forms: ["Tablet"],
        strengths: ["500mg", "850mg", "1000mg"],
        requiresPrescription: true,
        sideEffects: ["Nausea", "Diarrhea"],
        contraindications: ["Kidney disease"],
        isActive: true,
      },
      {
        name: "Omeprazole",
        genericName: "Omeprazole",
        category: "Gastric",
        manufacturer: "GastroHealth",
        description: "For acid reflux and ulcers",
        composition: [{ ingredient: "Omeprazole", strength: "20mg" }],
        forms: ["Capsule"],
        strengths: ["20mg", "40mg"],
        requiresPrescription: false,
        sideEffects: ["Headache", "Nausea"],
        contraindications: [],
        isActive: true,
      },
      {
        name: "Amlodipine",
        genericName: "Amlodipine Besylate",
        category: "Cardiovascular",
        manufacturer: "CardioMed",
        description: "For high blood pressure",
        composition: [{ ingredient: "Amlodipine", strength: "5mg" }],
        forms: ["Tablet"],
        strengths: ["2.5mg", "5mg", "10mg"],
        requiresPrescription: true,
        sideEffects: ["Swelling", "Dizziness"],
        contraindications: [],
        isActive: true,
      },
      {
        name: "Salbutamol",
        genericName: "Salbutamol Sulfate",
        category: "Respiratory",
        manufacturer: "RespiCare",
        description: "For asthma and COPD",
        composition: [{ ingredient: "Salbutamol", strength: "100mcg" }],
        forms: ["Inhaler", "Nebulizer"],
        strengths: ["100mcg"],
        requiresPrescription: true,
        sideEffects: ["Tremor", "Palpitations"],
        contraindications: [],
        isActive: true,
      },
      {
        name: "Vitamin D3",
        genericName: "Cholecalciferol",
        category: "Vitamin",
        manufacturer: "NutriLife",
        description: "Vitamin D supplement",
        composition: [{ ingredient: "Vitamin D3", strength: "1000IU" }],
        forms: ["Tablet", "Capsule", "Drops"],
        strengths: ["400IU", "1000IU", "2000IU", "60000IU"],
        requiresPrescription: false,
        sideEffects: [],
        contraindications: ["Hypercalcemia"],
        isActive: true,
      },
      {
        name: "Azithromycin",
        genericName: "Azithromycin",
        category: "Antibiotic",
        manufacturer: "AntibioLife",
        description: "Macrolide antibiotic",
        composition: [{ ingredient: "Azithromycin", strength: "500mg" }],
        forms: ["Tablet", "Syrup"],
        strengths: ["250mg", "500mg"],
        requiresPrescription: true,
        sideEffects: ["Nausea", "Diarrhea"],
        contraindications: [],
        isActive: true,
      },
      {
        name: "Losartan",
        genericName: "Losartan Potassium",
        category: "Cardiovascular",
        manufacturer: "BPMed",
        description: "For high blood pressure",
        composition: [{ ingredient: "Losartan", strength: "50mg" }],
        forms: ["Tablet"],
        strengths: ["25mg", "50mg", "100mg"],
        requiresPrescription: true,
        sideEffects: ["Dizziness"],
        contraindications: [],
        isActive: true,
      },
    ];

    const createdMedicines = await Medicine.insertMany(medicines);
    console.log(`💊 Created ${createdMedicines.length} medicines`);

    // Create admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      role: "admin",
      name: "System Admin",
      email: "admin@healthcare.com",
      password: adminPassword,
      phone: "+1234567890",
      isVerified: true,
      isActive: true,
    });
    await admin.save();
    console.log("👤 Admin created");

    // Create doctors
    const doctorPassword = await bcrypt.hash("doctor123", 10);
    const doctorUsers = [];

    const doctorData = [
      {
        name: "Dr. John Smith",
        email: "john.smith@healthcare.com",
        phone: "+1234567891",
        specialization: "Cardiology",
        qualification: [
          {
            degree: "MD Cardiology",
            institution: "Harvard Medical School",
            year: 2010,
          },
        ],
        experience: 15,
        registrationNumber: "DOC001",
        consultationFee: 100,
        clinicAddress: {
          address: "123 Medical Center",
          city: "New York",
          state: "NY",
          pincode: "10001",
          coordinates: { type: "Point", coordinates: [-74.006, 40.7128] },
        },
        languages: ["English", "Spanish"],
        services: ["Cardiac Consultation", "Echocardiography"],
      },
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@healthcare.com",
        phone: "+1234567892",
        specialization: "Neurology",
        qualification: [
          { degree: "MD Neurology", institution: "Johns Hopkins", year: 2012 },
        ],
        experience: 12,
        registrationNumber: "DOC002",
        consultationFee: 120,
        clinicAddress: {
          address: "456 Neurology Center",
          city: "Los Angeles",
          state: "CA",
          pincode: "90001",
          coordinates: { type: "Point", coordinates: [-118.2437, 34.0522] },
        },
        languages: ["English"],
        services: ["Neurological Consultation", "EEG"],
      },
      {
        name: "Dr. Michael Brown",
        email: "michael.brown@healthcare.com",
        phone: "+1234567893",
        specialization: "Pediatrics",
        qualification: [
          { degree: "MD Pediatrics", institution: "Stanford", year: 2015 },
        ],
        experience: 8,
        registrationNumber: "DOC003",
        consultationFee: 80,
        clinicAddress: {
          address: "789 Children's Hospital",
          city: "Chicago",
          state: "IL",
          pincode: "60601",
          coordinates: { type: "Point", coordinates: [-87.6298, 41.8781] },
        },
        languages: ["English"],
        services: ["Pediatric Consultation", "Vaccination"],
      },
      {
        name: "Dr. Emily Davis",
        email: "emily.davis@healthcare.com",
        phone: "+1234567894",
        specialization: "Dermatology",
        qualification: [
          { degree: "MD Dermatology", institution: "Yale", year: 2014 },
        ],
        experience: 10,
        registrationNumber: "DOC004",
        consultationFee: 90,
        clinicAddress: {
          address: "321 Skin Care Center",
          city: "Miami",
          state: "FL",
          pincode: "33101",
          coordinates: { type: "Point", coordinates: [-80.1918, 25.7617] },
        },
        languages: ["English", "Spanish"],
        services: ["Skin Consultation", "Dermatological Procedures"],
      },
      {
        name: "Dr. James Wilson",
        email: "james.wilson@healthcare.com",
        phone: "+1234567895",
        specialization: "Orthopedics",
        qualification: [
          { degree: "MS Orthopedics", institution: "Mayo Clinic", year: 2011 },
        ],
        experience: 14,
        registrationNumber: "DOC005",
        consultationFee: 110,
        clinicAddress: {
          address: "654 Bone & Joint Center",
          city: "Houston",
          state: "TX",
          pincode: "77001",
          coordinates: { type: "Point", coordinates: [-95.3698, 29.7604] },
        },
        languages: ["English"],
        services: ["Orthopedic Consultation", "Joint Injections"],
      },
    ];

    for (const docData of doctorData) {
      const user = new User({
        role: "doctor",
        name: docData.name,
        email: docData.email,
        password: doctorPassword,
        phone: docData.phone,
        isVerified: true,
        isActive: true,
      });
      await user.save();

      const doctor = new Doctor({
        userId: user._id,
        specialization: docData.specialization,
        qualification: docData.qualification,
        experience: docData.experience,
        registrationNumber: docData.registrationNumber,
        consultationFee: docData.consultationFee,
        clinicAddress: docData.clinicAddress,
        languages: docData.languages,
        services: docData.services,
        availableSlots: generateAvailableSlots(),
        rating: 4 + Math.random(),
        totalReviews: Math.floor(Math.random() * 50) + 10,
      });
      await doctor.save();
      doctorUsers.push(doctor);
    }

    console.log(`👨‍⚕️ Created ${doctorUsers.length} doctors`);

    // Create pharmacies
    const pharmacyPassword = await bcrypt.hash("pharmacy123", 10);
    const pharmacyUsers = [];

    const pharmacyData = [
      {
        name: "City Pharmacy",
        email: "city@pharmacy.com",
        phone: "+1234567896",
        address: "123 Main Street",
        city: "New York",
        state: "NY",
        pincode: "10001",
        licenseNumber: "LIC001",
        gstNumber: "GST001",
        deliveryRadius: 10,
      },
      {
        name: "Health Plus Pharmacy",
        email: "healthplus@pharmacy.com",
        phone: "+1234567897",
        address: "456 Oak Avenue",
        city: "Los Angeles",
        state: "CA",
        pincode: "90001",
        licenseNumber: "LIC002",
        gstNumber: "GST002",
        deliveryRadius: 8,
      },
      {
        name: "MediCare Pharmacy",
        email: "medicare@pharmacy.com",
        phone: "+1234567898",
        address: "789 Pine Road",
        city: "Chicago",
        state: "IL",
        pincode: "60601",
        licenseNumber: "LIC003",
        gstNumber: "GST003",
        deliveryRadius: 12,
      },
    ];

    for (const pharmData of pharmacyData) {
      const user = new User({
        role: "pharmacy",
        name: pharmData.name,
        email: pharmData.email,
        password: pharmacyPassword,
        phone: pharmData.phone,
        location: {
          address: pharmData.address,
          city: pharmData.city,
          state: pharmData.state,
          pincode: pharmData.pincode,
          coordinates: {
            type: "Point",
            coordinates: getRandomCoordinates(pharmData.city),
          },
        },
        isVerified: true,
        isActive: true,
      });
      await user.save();

      // Create inventory with random stock
      const inventory = createdMedicines.map((med) => ({
        medicineId: med._id,
        stock: Math.floor(Math.random() * 100) + 20,
        price: Math.floor(Math.random() * 500) + 50,
        batchNumber:
          "BATCH" + Math.random().toString(36).substr(2, 5).toUpperCase(),
        expiryDate: new Date(
          Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000,
        ),
      }));

      const pharmacy = new Pharmacy({
        userId: user._id,
        licenseNumber: pharmData.licenseNumber,
        gstNumber: pharmData.gstNumber,
        deliveryRadius: pharmData.deliveryRadius,
        inventory,
        operatingHours: {
          monday: { open: "09:00", close: "21:00", closed: false },
          tuesday: { open: "09:00", close: "21:00", closed: false },
          wednesday: { open: "09:00", close: "21:00", closed: false },
          thursday: { open: "09:00", close: "21:00", closed: false },
          friday: { open: "09:00", close: "21:00", closed: false },
          saturday: { open: "10:00", close: "20:00", closed: false },
          sunday: { open: "10:00", close: "18:00", closed: false },
        },
        deliveryPartners: [
          {
            name: "John Delivery",
            phone: "+1234567899",
            vehicleNumber: "DL-1234",
            isAvailable: true,
          },
          {
            name: "Mike Shipping",
            phone: "+1234567800",
            vehicleNumber: "DL-5678",
            isAvailable: true,
          },
        ],
      });
      await pharmacy.save();
      pharmacyUsers.push(pharmacy);
    }

    console.log(`🏪 Created ${pharmacyUsers.length} pharmacies`);

    // Create patients
    const patientPassword = await bcrypt.hash("patient123", 10);
    const patientUsers = [];

    const patientData = [
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+1234567801",
        age: 35,
        gender: "female",
        bloodGroup: "O+",
        height: 165,
        weight: 60,
        medicalHistory: [
          {
            condition: "Hypertension",
            diagnosedDate: new Date("2020-01-15"),
            status: "active",
            medications: ["Amlodipine"],
          },
        ],
        allergies: [
          { allergen: "Penicillin", reaction: "Rash", severity: "moderate" },
        ],
        emergencyContact: {
          name: "Bob Johnson",
          relationship: "Spouse",
          phone: "+1234567802",
        },
      },
      {
        name: "Bob Williams",
        email: "bob@example.com",
        phone: "+1234567803",
        age: 45,
        gender: "male",
        bloodGroup: "A+",
        height: 175,
        weight: 80,
        medicalHistory: [
          {
            condition: "Type 2 Diabetes",
            diagnosedDate: new Date("2019-03-10"),
            status: "active",
            medications: ["Metformin"],
          },
        ],
        allergies: [],
        emergencyContact: {
          name: "Carol Williams",
          relationship: "Spouse",
          phone: "+1234567804",
        },
      },
      {
        name: "Carol Martinez",
        email: "carol@example.com",
        phone: "+1234567805",
        age: 28,
        gender: "female",
        bloodGroup: "B+",
        height: 160,
        weight: 55,
        medicalHistory: [],
        allergies: [{ allergen: "Sulfa", reaction: "Hives", severity: "mild" }],
        emergencyContact: {
          name: "David Martinez",
          relationship: "Brother",
          phone: "+1234567806",
        },
      },
    ];

    for (const patData of patientData) {
      const user = new User({
        role: "patient",
        name: patData.name,
        email: patData.email,
        password: patientPassword,
        phone: patData.phone,
        isVerified: true,
        isActive: true,
      });
      await user.save();

      const patient = new Patient({
        userId: user._id,
        age: patData.age,
        gender: patData.gender,
        bloodGroup: patData.bloodGroup,
        height: patData.height,
        weight: patData.weight,
        medicalHistory: patData.medicalHistory,
        allergies: patData.allergies,
        emergencyContact: patData.emergencyContact,
        preferredPharmacies: [pharmacyUsers[0]._id, pharmacyUsers[1]._id],
      });
      await patient.save();
      patientUsers.push(patient);
    }

    console.log(`👤 Created ${patientUsers.length} patients`);

    // Create appointments
    const appointments = [];
    for (let i = 0; i < 20; i++) {
      const patient =
        patientUsers[Math.floor(Math.random() * patientUsers.length)];
      const doctor =
        doctorUsers[Math.floor(Math.random() * doctorUsers.length)];
      const appointmentDate = new Date();
      appointmentDate.setDate(
        appointmentDate.getDate() + Math.floor(Math.random() * 10) - 5,
      ); // -5 to +5 days

      const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const startTime = `${startHour.toString().padStart(2, "0")}:00`;

      const status = ["pending", "confirmed", "completed", "cancelled"][
        Math.floor(Math.random() * 4)
      ];

      const appointment = new Appointment({
        patientId: patient._id,
        doctorId: doctor._id,
        date: appointmentDate,
        startTime,
        mode: ["clinic", "home", "online"][Math.floor(Math.random() * 3)],
        status,
        problem: {
          description: "Regular checkup and consultation",
          symptoms: ["fever", "cough"].slice(
            0,
            Math.floor(Math.random() * 2) + 1,
          ),
          severity: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
        },
        isEmergency: Math.random() < 0.1, // 10% chance of emergency
        paymentStatus: status === "completed" ? "completed" : "pending",
        paymentAmount: doctor.consultationFee,
      });

      await appointment.save();
      appointments.push(appointment);
    }
    console.log(`📅 Created ${appointments.length} appointments`);

    // Create prescriptions for completed appointments
    const prescriptions = [];
    const completedAppointments = appointments.filter(
      (a) => a.status === "completed",
    );

    for (const appointment of completedAppointments) {
      const prescription = new Prescription({
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,
        diagnosis: [
          "Viral Infection",
          "Common Cold",
          "Hypertension",
          "Diabetes",
        ][Math.floor(Math.random() * 4)],
        symptoms: ["Fever", "Cough", "Headache"].slice(
          0,
          Math.floor(Math.random() * 3) + 1,
        ),
        medicines: createdMedicines
          .slice(0, Math.floor(Math.random() * 3) + 1)
          .map((med) => ({
            name: med.name,
            dosage: "1 tablet",
            frequency: "twice daily",
            duration: "5 days",
            timing: ["morning", "evening"],
            instructions: "Take after food",
          })),
        notes: "Follow up if symptoms persist",
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        digitalSignature:
          "Dr. " + appointment.doctorId.userId?.name || "Doctor",
      });

      await prescription.save();
      prescriptions.push(prescription);

      // Update appointment with prescription
      appointment.prescriptionId = prescription._id;
      await appointment.save();
    }
    console.log(`📋 Created ${prescriptions.length} prescriptions`);

    // Create orders from prescriptions
    const orders = [];
    for (let i = 0; i < 10; i++) {
      const prescription =
        prescriptions[Math.floor(Math.random() * prescriptions.length)];
      const pharmacy =
        pharmacyUsers[Math.floor(Math.random() * pharmacyUsers.length)];
      const patient = patientUsers.find((p) =>
        p._id.equals(prescription.patientId),
      );

      const items = prescription.medicines.map((med) => {
        const medicine = createdMedicines.find((m) => m.name === med.name);
        const pharmacyInventory = pharmacy.inventory.find(
          (inv) => inv.medicineId && inv.medicineId.equals(medicine?._id),
        );

        return {
          medicineId: medicine?._id,
          name: med.name,
          quantity: Math.floor(Math.random() * 2) + 1,
          price: pharmacyInventory?.price || 100,
          batchNumber: pharmacyInventory?.batchNumber || "BATCH001",
          expiryDate:
            pharmacyInventory?.expiryDate ||
            new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        };
      });

      const order = new Order({
        prescriptionId: prescription._id,
        pharmacyId: pharmacy._id,
        patientId: patient._id,
        items,
        subtotal: items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
        deliveryCharges: 50,
        taxAmount: items.reduce(
          (sum, item) => sum + item.price * item.quantity * 0.18,
          0,
        ),
        paymentMethod: ["cash", "card", "upi"][Math.floor(Math.random() * 3)],
        status: [
          "pending",
          "confirmed",
          "preparing",
          "out_for_delivery",
          "delivered",
        ][Math.floor(Math.random() * 5)],
        paymentStatus: "completed",
        deliveryAddress: {
          address: "123 Patient Street",
          city: "Sample City",
          state: "Sample State",
          pincode: "123456",
          coordinates: { type: "Point", coordinates: [-74.006, 40.7128] },
        },
        trackingHistory: [
          {
            status: "Order placed",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      // Calculate total
      order.totalAmount =
        order.subtotal + order.deliveryCharges + order.taxAmount;

      await order.save();
      orders.push(order);
    }
    console.log(`📦 Created ${orders.length} orders`);

    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Medicines: ${createdMedicines.length}`);
    console.log(`   - Doctors: ${doctorUsers.length}`);
    console.log(`   - Pharmacies: ${pharmacyUsers.length}`);
    console.log(`   - Patients: ${patientUsers.length}`);
    console.log(`   - Appointments: ${appointments.length}`);
    console.log(`   - Prescriptions: ${prescriptions.length}`);
    console.log(`   - Orders: ${orders.length}`);

    console.log("\n🔑 Login Credentials:");
    console.log("   Admin: admin@healthcare.com / admin123");
    console.log("   Doctor: john.smith@healthcare.com / doctor123");
    console.log("   Pharmacy: city@pharmacy.com / pharmacy123");
    console.log("   Patient: alice@example.com / patient123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Helper function to generate available slots
const generateAvailableSlots = () => {
  const slots = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    // Generate slots for next 14 days
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip weekends (optional)
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const daySlots = [];
    // Generate slots from 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
      daySlots.push({
        startTime: `${hour.toString().padStart(2, "0")}:00`,
        endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
        isBooked: Math.random() < 0.3, // 30% chance of being booked
      });

      // Add half-hour slot
      if (hour < 16) {
        daySlots.push({
          startTime: `${hour.toString().padStart(2, "0")}:30`,
          endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
          isBooked: Math.random() < 0.3,
        });
      }
    }

    slots.push({
      date,
      slots: daySlots,
    });
  }

  return slots;
};

// Helper function to get random coordinates based on city
const getRandomCoordinates = (city) => {
  const coordinates = {
    "New York": [-74.006, 40.7128],
    "Los Angeles": [-118.2437, 34.0522],
    Chicago: [-87.6298, 41.8781],
    Miami: [-80.1918, 25.7617],
    Houston: [-95.3698, 29.7604],
  };

  const defaultCoords = [-74.006, 40.7128];
  const coords = coordinates[city] || defaultCoords;

  // Add some randomness
  return [
    coords[0] + (Math.random() - 0.5) * 0.1,
    coords[1] + (Math.random() - 0.5) * 0.1,
  ];
};

// Run seeding
seedDatabase();
