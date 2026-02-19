import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaCalendarAlt,
  FaFileMedical,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaUserMd,
  FaHeartbeat,
  FaAllergies,
  FaNotesMedical,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaPrescription,
  FaStethoscope,
} from "react-icons/fa";
import { doctorAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await doctorAPI.getPatients();
      console.log("Patients:", response.data);
      setPatients(response.data.data || []);
    } catch (error) {
      console.error("Failed to load patients:", error);
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    try {
      const response = await doctorAPI.getPatientHistory(patientId);
      console.log("Patient history:", response.data);
      setPatientHistory(response.data.data);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Failed to load patient history:", error);
      toast.error("Failed to load patient history");
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    fetchPatientHistory(patient._id);
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.bloodGroup?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "recent") {
      // Check if patient had appointment in last 30 days
      return matchesSearch;
    }
    if (filter === "chronic") {
      return patient.medicalHistory?.length > 0 && matchesSearch;
    }
    return matchesSearch;
  });

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-secondary-800">
          My Patients
        </h1>
        <p className="text-secondary-600">View and manage your patient list</p>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Search patients by name, email, or blood group..."
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
            <option value="all">All Patients</option>
            <option value="recent">Recent (30 days)</option>
            <option value="chronic">Chronic Conditions</option>
            <option value="new">New Patients</option>
          </select>
        </div>
      </Card>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <Card className="text-center py-12">
          <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No patients found
          </h3>
          <p className="text-secondary-600">
            {searchTerm
              ? "Try adjusting your search"
              : "Your patient list is empty"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-all">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 to-teal-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {patient.userId?.name?.charAt(0) || "P"}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-secondary-800">
                      {patient.userId?.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      Age: {patient.age || "N/A"} • {patient.gender || "N/A"}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                        {patient.bloodGroup || "B+"}
                      </span>
                      {patient.medicalHistory?.length > 0 && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">
                          {patient.medicalHistory.length} conditions
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {patient.userId?.email && (
                    <div className="flex items-center space-x-2 text-sm text-secondary-600">
                      <FaEnvelope className="w-3 h-3" />
                      <span className="truncate">{patient.userId.email}</span>
                    </div>
                  )}
                  {patient.userId?.phone && (
                    <div className="flex items-center space-x-2 text-sm text-secondary-600">
                      <FaPhone className="w-3 h-3" />
                      <span>{patient.userId.phone}</span>
                    </div>
                  )}
                </div>

                {/* Medical History Preview */}
                {patient.medicalHistory?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-secondary-500 mb-1 flex items-center">
                      <FaNotesMedical className="mr-1" /> Medical Conditions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {patient.medicalHistory
                        .slice(0, 2)
                        .map((condition, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs"
                          >
                            {condition.condition}
                          </span>
                        ))}
                      {patient.medicalHistory.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{patient.medicalHistory.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Allergies Preview */}
                {patient.allergies?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-secondary-500 mb-1 flex items-center">
                      <FaAllergies className="mr-1" /> Allergies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.slice(0, 2).map((allergy, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-orange-50 text-orange-700 rounded-full text-xs"
                        >
                          {allergy.allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewPatient(patient)}
                  >
                    View History
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      (window.location.href = `/doctor/appointments?patient=${patient._id}`)
                    }
                  >
                    New Appointment
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Patient History Modal */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedPatient(null);
          setPatientHistory(null);
        }}
        title="Patient Medical History"
        size="lg"
      >
        {selectedPatient && patientHistory && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            {/* Patient Header */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-600 to-teal-600 rounded-xl text-white">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {selectedPatient.userId?.name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-semibold">
                  {selectedPatient.userId?.name}
                </h3>
                <p className="text-white/80">
                  {selectedPatient.age} years • {selectedPatient.gender} •{" "}
                  {selectedPatient.bloodGroup}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Email</p>
                <p className="font-medium text-sm">
                  {selectedPatient.userId?.email}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Phone</p>
                <p className="font-medium text-sm">
                  {selectedPatient.userId?.phone}
                </p>
              </div>
            </div>

            {/* Medical History */}
            {selectedPatient.medicalHistory?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <FaNotesMedical className="text-primary-500" />
                  <span>Medical History</span>
                </h4>
                <div className="space-y-3">
                  {selectedPatient.medicalHistory.map((condition, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {condition.condition}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            condition.status === "active"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {condition.status}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">
                        Diagnosed:{" "}
                        {new Date(condition.diagnosedDate).toLocaleDateString()}
                      </p>
                      {condition.medications?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-secondary-500 mb-1">
                            Medications:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {condition.medications.map((med, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                              >
                                {med}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {selectedPatient.allergies?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <FaAllergies className="text-orange-500" />
                  <span>Allergies</span>
                </h4>
                <div className="space-y-2">
                  {selectedPatient.allergies.map((allergy, idx) => (
                    <div key={idx} className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{allergy.allergen}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            allergy.severity === "severe"
                              ? "bg-red-200 text-red-800"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {allergy.severity}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600 mt-1">
                        Reaction: {allergy.reaction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Appointments */}
            {patientHistory.appointments?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <FaCalendarAlt className="text-primary-500" />
                  <span>Previous Appointments</span>
                </h4>
                <div className="space-y-2">
                  {patientHistory.appointments.slice(0, 5).map((apt, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">
                          {new Date(apt.date).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            apt.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">
                        {apt.problem?.description || "No description"}
                      </p>
                      {apt.prescriptionId && (
                        <div className="flex items-center space-x-1 mt-2 text-xs text-primary-600">
                          <FaPrescription />
                          <span>Prescription available</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Prescriptions */}
            {patientHistory.prescriptions?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <FaFileMedical className="text-green-500" />
                  <span>Previous Prescriptions</span>
                </h4>
                <div className="space-y-2">
                  {patientHistory.prescriptions.slice(0, 5).map((rx, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        {new Date(rx.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-secondary-700 mt-1">
                        {rx.diagnosis}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rx.medicines?.slice(0, 3).map((med, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                          >
                            {med.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorPatients;
