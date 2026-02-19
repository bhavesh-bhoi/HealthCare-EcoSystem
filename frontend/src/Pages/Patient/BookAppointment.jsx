import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaHome,
  FaMapMarkerAlt,
  FaSearch,
  FaStar,
  FaMapPin,
  FaRupeeSign,
  FaCheckCircle,
} from "react-icons/fa";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Input from "../../Components/Common/Input.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationMode, setConsultationMode] = useState("clinic");
  const [problem, setProblem] = useState({
    description: "",
    symptoms: [],
    severity: "low",
  });
  const [filters, setFilters] = useState({
    specialization: "",
    location: "",
    mode: "all",
  });

  const specializations = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Dermatology",
    "Orthopedics",
    "Gynecology",
    "ENT",
    "Ophthalmology",
  ];

  useEffect(() => {
    fetchDoctors();
  }, [filters]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.specialization)
        params.specialization = filters.specialization;
      if (filters.location) params.location = filters.location;

      const response = await patientAPI.getDoctors(params);
      console.log("Doctors:", response.data);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error("Failed to load doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (
      !selectedDoctor ||
      !selectedDate ||
      !selectedSlot ||
      !problem.description
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const appointmentData = {
        doctorId: selectedDoctor._id,
        date: selectedDate.toISOString(),
        startTime: selectedSlot,
        mode: consultationMode,
        problem,
      };

      const response = await patientAPI.bookAppointment(appointmentData);
      console.log("Appointment booked:", response.data);
      toast.success("Appointment booked successfully!");
      navigate("/patient/appointments");
    } catch (error) {
      console.error("Booking error:", error);
      toast.error(
        error.response?.data?.message || "Failed to book appointment",
      );
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <h1 className="text-2xl font-display font-bold text-secondary-800 mb-2">
          Book an Appointment
        </h1>
        <p className="text-secondary-600">
          Find and book appointments with top doctors
        </p>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mt-8">
          <div className="flex items-center space-x-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 1
                  ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                  : "bg-gray-200 text-secondary-600"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 rounded-full transition-all ${
                step >= 2
                  ? "bg-gradient-to-r from-primary-600 to-teal-600"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 2
                  ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                  : "bg-gray-200 text-secondary-600"
              }`}
            >
              2
            </div>
            <div
              className={`w-16 h-1 rounded-full transition-all ${
                step >= 3
                  ? "bg-gradient-to-r from-primary-600 to-teal-600"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= 3
                  ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                  : "bg-gray-200 text-secondary-600"
              }`}
            >
              3
            </div>
          </div>
        </div>
      </Card>

      {step === 1 && (
        /* Step 1: Select Doctor */
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
              Filter Doctors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.specialization}
                onChange={(e) =>
                  setFilters({ ...filters, specialization: e.target.value })
                }
                className="input-field"
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>

              <Input
                type="text"
                placeholder="Enter location"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                icon={FaMapPin}
              />

              <select
                value={filters.mode}
                onChange={(e) =>
                  setFilters({ ...filters, mode: e.target.value })
                }
                className="input-field"
              >
                <option value="all">All Modes</option>
                <option value="clinic">Clinic Visit</option>
                <option value="home">Home Visit</option>
                <option value="online">Online</option>
              </select>
            </div>
          </Card>

          {/* Doctors List */}
          {loading ? (
            <PulseLoader size="md" />
          ) : (
            <div className="space-y-4">
              {doctors.length === 0 ? (
                <Card className="text-center py-12">
                  <FaUserMd className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-secondary-600">No doctors found</p>
                </Card>
              ) : (
                doctors.map((doctor, index) => (
                  <motion.div
                    key={doctor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedDoctor?._id === doctor._id
                          ? "border-2 border-primary-600 shadow-medium"
                          : "hover:shadow-medium"
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 to-teal-600 flex items-center justify-center">
                          <FaUserMd className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-display font-semibold text-secondary-800">
                                Dr. {doctor.userId?.name}
                              </h3>
                              <p className="text-primary-600">
                                {doctor.specialization}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FaStar className="w-4 h-4 text-yellow-400" />
                              <span className="font-medium">
                                {doctor.rating?.toFixed(1) || "4.5"}
                              </span>
                              <span className="text-sm text-secondary-500">
                                ({doctor.totalReviews || 0} reviews)
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-600">
                            <span>💰 ₹{doctor.consultationFee} per visit</span>
                            <span>📅 {doctor.experience}+ years exp</span>
                          </div>

                          <div className="flex items-center space-x-2 mt-2">
                            {doctor.languages?.map((lang) => (
                              <span
                                key={lang}
                                className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          )}

          {/* Next Button */}
          {selectedDoctor && (
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next: Select Date & Time
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        /* Step 2: Select Date & Time */
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Select Date & Time
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Select Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date()}
                inline
                calendarClassName="!border-0 !shadow-soft rounded-xl"
              />
            </div>

            {/* Time Slots */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Available Time Slots
              </label>
              <div className="grid grid-cols-3 gap-2">
                {generateTimeSlots().map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSlot === slot
                        ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                        : "bg-gray-100 text-secondary-700 hover:bg-gray-200"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Consultation Mode */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Consultation Mode
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  value: "clinic",
                  label: "Clinic Visit",
                  icon: FaMapMarkerAlt,
                },
                { value: "home", label: "Home Visit", icon: FaHome },
                { value: "online", label: "Online", icon: FaVideo },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setConsultationMode(mode.value)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center space-y-2 ${
                    consultationMode === mode.value
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <mode.icon
                    className={`w-6 h-6 ${
                      consultationMode === mode.value
                        ? "text-primary-600"
                        : "text-secondary-400"
                    }`}
                  />
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedSlot}
            >
              Next: Describe Problem
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        /* Step 3: Describe Problem */
        <Card>
          <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
            Describe Your Problem
          </h2>

          <div className="space-y-4">
            {/* Problem Description */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Describe your symptoms/concerns *
              </label>
              <textarea
                value={problem.description}
                onChange={(e) =>
                  setProblem({ ...problem, description: e.target.value })
                }
                rows="4"
                className="input-field"
                placeholder="Please describe your symptoms in detail..."
              />
            </div>

            {/* Symptoms Tags */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Select Symptoms (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Fever",
                  "Cough",
                  "Headache",
                  "Fatigue",
                  "Nausea",
                  "Body Ache",
                ].map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => {
                      const newSymptoms = problem.symptoms.includes(symptom)
                        ? problem.symptoms.filter((s) => s !== symptom)
                        : [...problem.symptoms, symptom];
                      setProblem({ ...problem, symptoms: newSymptoms });
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      problem.symptoms.includes(symptom)
                        ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                        : "bg-gray-100 text-secondary-700 hover:bg-gray-200"
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "low", label: "Low", color: "bg-green-500" },
                  { value: "medium", label: "Medium", color: "bg-yellow-500" },
                  { value: "high", label: "High", color: "bg-red-500" },
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() =>
                      setProblem({ ...problem, severity: level.value })
                    }
                    className={`p-3 rounded-xl border-2 transition-all ${
                      problem.severity === level.value
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${level.color} mx-auto mb-2`}
                    />
                    <span className="text-sm font-medium">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-primary-50 rounded-xl">
              <h3 className="font-medium mb-2">Appointment Summary</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Doctor:</span> Dr.{" "}
                  {selectedDoctor?.userId?.name}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {selectedDate.toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {selectedSlot}
                </p>
                <p>
                  <span className="font-medium">Mode:</span> {consultationMode}
                </p>
                <p>
                  <span className="font-medium">Fee:</span> ₹
                  {selectedDoctor?.consultationFee}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4">
              <Button variant="secondary" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={handleBookAppointment}
                disabled={loading || !problem.description}
              >
                {loading ? "Booking..." : "Confirm Appointment"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BookAppointment;
