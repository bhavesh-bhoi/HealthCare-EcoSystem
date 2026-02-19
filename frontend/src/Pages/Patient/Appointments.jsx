import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaVideo,
  FaHome,
  FaMapMarkerAlt,
  FaClock,
  FaUserMd,
  FaFileMedical,
  FaStar,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await patientAPI.getAppointments();
      console.log("Appointments:", response.data);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await patientAPI.cancelAppointment(id, "Cancelled by patient");
      toast.success("Appointment cancelled successfully");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter !== "all" && apt.status !== filter) return false;
    if (searchTerm) {
      const doctorName = apt.doctorId?.userId?.name?.toLowerCase() || "";
      return doctorName.includes(searchTerm.toLowerCase());
    }
    return true;
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
        <Button to="/patient/book-appointment">+ New Appointment</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <Card className="text-center py-12">
          <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No appointments found
          </h3>
          <p className="text-secondary-600 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "Book your first appointment"}
          </p>
          <Button to="/patient/book-appointment">Book Appointment</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment, index) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 to-teal-600 flex items-center justify-center">
                      <FaUserMd className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-secondary-800">
                        Dr. {appointment.doctorId?.userId?.name || "Loading..."}
                      </h3>
                      <p className="text-sm text-primary-600">
                        {appointment.doctorId?.specialization ||
                          "General Physician"}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <FaStar className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">
                          {appointment.doctorId?.rating?.toFixed(1) || "4.5"}
                        </span>
                        <span className="text-xs text-secondary-500">
                          ({appointment.doctorId?.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="w-4 h-4 text-primary-500" />
                      <span className="text-sm">
                        {new Date(appointment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaClock className="w-4 h-4 text-primary-500" />
                      <span className="text-sm">{appointment.startTime}</span>
                    </div>
                  </div>

                  {/* Mode & Status */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full">
                      {appointment.mode === "online" && (
                        <FaVideo className="w-3 h-3 text-blue-500" />
                      )}
                      {appointment.mode === "home" && (
                        <FaHome className="w-3 h-3 text-green-500" />
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
                      Details
                    </Button>
                    {appointment.status === "confirmed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleCancelAppointment(appointment._id)}
                      >
                        Cancel
                      </Button>
                    )}
                    {appointment.mode === "online" &&
                      appointment.status === "confirmed" && (
                        <Button
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
                    {appointment.prescriptionId && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={FaFileMedical}
                        to={`/patient/prescriptions/${appointment.prescriptionId}`}
                      >
                        Prescription
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
        isOpen={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-600 to-teal-600 flex items-center justify-center mx-auto mb-3">
                <FaUserMd className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold">
                Dr. {selectedAppointment.doctorId?.userId?.name}
              </h3>
              <p className="text-primary-600">
                {selectedAppointment.doctorId?.specialization}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Date</p>
                <p className="font-medium">
                  {new Date(selectedAppointment.date).toLocaleDateString()}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Time</p>
                <p className="font-medium">{selectedAppointment.startTime}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Mode</p>
                <p className="font-medium capitalize">
                  {selectedAppointment.mode}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Status</p>
                <p
                  className={`font-medium capitalize ${getStatusColor(selectedAppointment.status)}`}
                >
                  {selectedAppointment.status}
                </p>
              </div>
            </div>

            {selectedAppointment.problem?.description && (
              <div>
                <h4 className="font-medium mb-2">Problem Description</h4>
                <p className="text-secondary-600 bg-gray-50 p-3 rounded-lg">
                  {selectedAppointment.problem.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
