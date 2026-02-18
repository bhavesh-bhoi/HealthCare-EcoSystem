import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarCheck,
  FaVideo,
  FaHome,
  FaMapMarkerAlt,
  FaClock,
  FaUser,
  FaFileMedical,
  FaCheckCircle,
  FaTimesCircle,
  FaStethoscope,
} from "react-icons/fa";
import { MdPending } from "react-icons/md";
import { doctorAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import { formatDate, formatTime } from "../../Utils/helpers.js";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const [prescription, setPrescription] = useState({
    diagnosis: "",
    medicines: [],
    tests: [],
    notes: "",
    followUpDate: null,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await doctorAPI.getAppointments();
      setAppointments(response.data.data);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      await doctorAPI.updateAppointmentStatus(appointmentId, status);
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to update appointment");
    }
  };

  const handleStartConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setShowConsultModal(true);
  };

  const handleSubmitPrescription = async () => {
    if (!prescription.diagnosis) {
      toast.error("Please add a diagnosis");
      return;
    }

    try {
      await doctorAPI.createPrescription({
        appointmentId: selectedAppointment._id,
        ...prescription,
      });
      toast.success("Prescription added successfully");
      setShowConsultModal(false);
      setPrescription({
        diagnosis: "",
        medicines: [],
        tests: [],
        notes: "",
        followUpDate: null,
      });
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to add prescription");
    }
  };

  const addMedicine = () => {
    setPrescription({
      ...prescription,
      medicines: [
        ...prescription.medicines,
        { name: "", dosage: "", frequency: "", duration: "" },
      ],
    });
  };

  const updateMedicine = (index, field, value) => {
    const updated = [...prescription.medicines];
    updated[index][field] = value;
    setPrescription({ ...prescription, medicines: updated });
  };

  const removeMedicine = (index) => {
    const updated = prescription.medicines.filter((_, i) => i !== index);
    setPrescription({ ...prescription, medicines: updated });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <FaCheckCircle className="w-5 h-5 text-success-500" />;
      case "pending":
        return <MdPending className="w-5 h-5 text-warning-500" />;
      case "cancelled":
        return <FaTimesCircle className="w-5 h-5 text-error-500" />;
      case "completed":
        return <FaCheckCircle className="w-5 h-5 text-primary-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-success-100 text-success-700";
      case "pending":
        return "bg-warning-100 text-warning-700";
      case "cancelled":
        return "bg-error-100 text-error-700";
      case "completed":
        return "bg-primary-100 text-primary-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary-800">
            Appointments
          </h1>
          <p className="text-secondary-600">Manage your patient appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {["all", "pending", "confirmed", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                filter === status
                  ? "gradient-bg text-white shadow-medium"
                  : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ),
        )}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <FaCalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No appointments found
          </h3>
          <p className="text-secondary-600">
            {filter === "all"
              ? "No appointments scheduled"
              : `No ${filter} appointments`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Patient Info */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
                        <FaUser className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusIcon(appointment.status)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-secondary-800">
                        {appointment.patientId?.userId?.name}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        Age: {appointment.patientId?.age} •{" "}
                        {appointment.patientId?.gender}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <FaCalendarCheck className="w-4 h-4 text-primary-500" />
                      <span className="text-sm">
                        {formatDate(appointment.date)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock className="w-4 h-4 text-primary-500" />
                      <span className="text-sm">
                        {formatTime(appointment.startTime)}
                      </span>
                    </div>
                  </div>

                  {/* Mode & Status */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full">
                      {appointment.mode === "online" && (
                        <FaVideo className="w-3 h-3 text-primary-500" />
                      )}
                      {appointment.mode === "home" && (
                        <FaHome className="w-3 h-3 text-success-500" />
                      )}
                      {appointment.mode === "clinic" && (
                        <FaMapMarkerAlt className="w-3 h-3 text-orange-500" />
                      )}
                      <span className="text-xs capitalize">
                        {appointment.mode}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(appointment.status)}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {appointment.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateStatus(appointment._id, "confirmed")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-error-600"
                          onClick={() =>
                            handleUpdateStatus(appointment._id, "cancelled")
                          }
                        >
                          Decline
                        </Button>
                      </>
                    )}
                    {appointment.status === "confirmed" && (
                      <Button
                        size="sm"
                        icon={FaStethoscope}
                        onClick={() => handleStartConsultation(appointment)}
                      >
                        Start Consultation
                      </Button>
                    )}
                    {appointment.mode === "online" &&
                      appointment.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={FaVideo}
                          onClick={() =>
                            window.open(
                              appointment.videoCallDetails?.roomUrl,
                              "_blank",
                            )
                          }
                        >
                          Join Call
                        </Button>
                      )}
                    {appointment.prescriptionId && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={FaFileMedical}
                        onClick={() => {
                          /* View prescription */
                        }}
                      >
                        View Rx
                      </Button>
                    )}
                  </div>
                </div>

                {/* Problem Description */}
                {appointment.problem?.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-secondary-600">
                      <span className="font-medium">Patient concern: </span>
                      {appointment.problem.description}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Consultation Modal */}
      <Modal
        isOpen={showConsultModal}
        onClose={() => {
          setShowConsultModal(false);
          setPrescription({
            diagnosis: "",
            medicines: [],
            tests: [],
            notes: "",
            followUpDate: null,
          });
        }}
        title="Add Prescription"
        size="lg"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          {/* Patient Info */}
          {selectedAppointment && (
            <div className="p-4 bg-primary-50 rounded-xl">
              <p className="font-medium">
                Patient: {selectedAppointment.patientId?.userId?.name}
              </p>
              <p className="text-sm text-secondary-600">
                Age: {selectedAppointment.patientId?.age}
              </p>
            </div>
          )}

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Diagnosis *
            </label>
            <textarea
              value={prescription.diagnosis}
              onChange={(e) =>
                setPrescription({ ...prescription, diagnosis: e.target.value })
              }
              rows="3"
              className="input-field"
              placeholder="Enter diagnosis..."
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-secondary-700">
                Medicines
              </label>
              <Button size="sm" onClick={addMedicine}>
                + Add Medicine
              </Button>
            </div>
            <div className="space-y-3">
              {prescription.medicines.map((medicine, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-xl relative">
                  <button
                    onClick={() => removeMedicine(index)}
                    className="absolute top-2 right-2 text-error-500 hover:text-error-600"
                  >
                    <FaTimesCircle />
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={medicine.name}
                      onChange={(e) =>
                        updateMedicine(index, "name", e.target.value)
                      }
                      className="input-field text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      value={medicine.dosage}
                      onChange={(e) =>
                        updateMedicine(index, "dosage", e.target.value)
                      }
                      className="input-field text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={medicine.frequency}
                      onChange={(e) =>
                        updateMedicine(index, "frequency", e.target.value)
                      }
                      className="input-field text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={medicine.duration}
                      onChange={(e) =>
                        updateMedicine(index, "duration", e.target.value)
                      }
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tests */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Recommended Tests
            </label>
            <input
              type="text"
              placeholder="Enter tests (comma separated)"
              className="input-field"
              value={prescription.tests.join(", ")}
              onChange={(e) =>
                setPrescription({
                  ...prescription,
                  tests: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter((t) => t),
                })
              }
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={prescription.notes}
              onChange={(e) =>
                setPrescription({ ...prescription, notes: e.target.value })
              }
              rows="3"
              className="input-field"
              placeholder="Any special instructions..."
            />
          </div>

          {/* Follow-up */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Follow-up Date
            </label>
            <input
              type="date"
              className="input-field"
              value={prescription.followUpDate || ""}
              onChange={(e) =>
                setPrescription({
                  ...prescription,
                  followUpDate: e.target.value,
                })
              }
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowConsultModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmitPrescription}
            >
              Save Prescription
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
