import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaVideo,
  FaHome,
  FaMapMarkerAlt,
  FaClock,
  FaUserMd,
  FaFileMedical,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { MdCancel, MdPending } from "react-icons/md";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import { formatDate, formatTime } from "../../Utils/helpers.js";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await patientAPI.getAppointments();
      setAppointments(response.data.data);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    try {
      await patientAPI.cancelAppointment(selectedAppointment._id, cancelReason);
      toast.success("Appointment cancelled successfully");
      setShowCancelModal(false);
      setCancelReason("");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <FaCheckCircle className="w-5 h-5 text-success-500" />;
      case "pending":
        return <MdPending className="w-5 h-5 text-warning-500" />;
      case "cancelled":
        return <MdCancel className="w-5 h-5 text-error-500" />;
      case "completed":
        return <FaCheckCircle className="w-5 h-5 text-primary-500" />;
      default:
        return <FaExclamationCircle className="w-5 h-5 text-secondary-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-success-100 text-success-700 border-success-200";
      case "pending":
        return "bg-warning-100 text-warning-700 border-warning-200";
      case "cancelled":
        return "bg-error-100 text-error-700 border-error-200";
      case "completed":
        return "bg-primary-100 text-primary-700 border-primary-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
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
            My Appointments
          </h1>
          <p className="text-secondary-600">
            Manage and track your appointments
          </p>
        </div>
        <Button to="/patient/book-appointment" icon={FaCalendarAlt}>
          Book New Appointment
        </Button>
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
          <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No appointments found
          </h3>
          <p className="text-secondary-600 mb-4">
            {filter === "all"
              ? "You haven't booked any appointments yet"
              : `No ${filter} appointments`}
          </p>
          <Button to="/patient/book-appointment">Book an Appointment</Button>
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
              <Card className="hover:shadow-medium transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
                        <FaUserMd className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        {getStatusIcon(appointment.status)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-secondary-800">
                        Dr. {appointment.doctorId?.userId?.name}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {appointment.doctorId?.specialization}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="w-4 h-4 text-primary-500" />
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAppointment(appointment)}
                    >
                      View Details
                    </Button>
                    {appointment.status === "confirmed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-error-600 border-error-200 hover:bg-error-50"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowCancelModal(true);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    {appointment.mode === "online" &&
                      appointment.status === "confirmed" && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={FaVideo}
                          onClick={() =>
                            window.open(
                              appointment.videoCallDetails?.roomUrl,
                              "_blank",
                            )
                          }
                        >
                          Join
                        </Button>
                      )}
                  </div>
                </div>

                {/* Problem Description */}
                {appointment.problem?.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-secondary-600">
                      <span className="font-medium">Reason: </span>
                      {appointment.problem.description}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Appointment Details Modal */}
      <Modal
        isOpen={selectedAppointment && !showCancelModal}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedAppointment.status)}`}
              >
                {selectedAppointment.status}
              </span>
            </div>

            {/* Doctor Info */}
            <div className="text-center">
              <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3">
                <FaUserMd className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold text-secondary-800">
                Dr. {selectedAppointment.doctorId?.userId?.name}
              </h3>
              <p className="text-secondary-600">
                {selectedAppointment.doctorId?.specialization}
              </p>
            </div>

            {/* Appointment Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500 mb-1">Date</p>
                <p className="font-medium">
                  {formatDate(selectedAppointment.date)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500 mb-1">Time</p>
                <p className="font-medium">
                  {formatTime(selectedAppointment.startTime)}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500 mb-1">Mode</p>
                <p className="font-medium capitalize">
                  {selectedAppointment.mode}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500 mb-1">Duration</p>
                <p className="font-medium">
                  {selectedAppointment.duration} minutes
                </p>
              </div>
            </div>

            {/* Problem Details */}
            {selectedAppointment.problem && (
              <div className="space-y-3">
                <h4 className="font-medium">Problem Description</h4>
                <p className="text-secondary-600">
                  {selectedAppointment.problem.description}
                </p>

                {selectedAppointment.problem.symptoms?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAppointment.problem.symptoms.map(
                        (symptom, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                          >
                            {symptom}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Call Info */}
            {selectedAppointment.mode === "online" &&
              selectedAppointment.videoCallDetails && (
                <div className="p-4 bg-primary-50 rounded-xl">
                  <h4 className="font-medium mb-2">Video Consultation</h4>
                  <Button
                    variant="primary"
                    className="w-full"
                    icon={FaVideo}
                    onClick={() =>
                      window.open(
                        selectedAppointment.videoCallDetails.roomUrl,
                        "_blank",
                      )
                    }
                  >
                    Join Video Call
                  </Button>
                </div>
              )}

            {/* Prescription Link */}
            {selectedAppointment.prescriptionId && (
              <div className="p-4 bg-success-50 rounded-xl">
                <h4 className="font-medium mb-2">Prescription Available</h4>
                <Button
                  variant="secondary"
                  className="w-full"
                  icon={FaFileMedical}
                  to={`/patient/prescriptions/${selectedAppointment.prescriptionId}`}
                >
                  View Prescription
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
        }}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </p>

          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancellation"
            className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none transition-all"
            rows="4"
          />

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
              }}
            >
              Keep Appointment
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-error-600 hover:bg-error-700"
              onClick={handleCancelAppointment}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
