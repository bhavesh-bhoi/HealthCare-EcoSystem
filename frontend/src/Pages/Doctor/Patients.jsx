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
} from "react-icons/fa";
import { doctorAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import { formatDate, calculateAge } from "../../Utils/helpers.js";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      // This endpoint might need to be implemented in your backend
      const response = await doctorAPI.getPatients();
      setPatients(response.data.data);
    } catch (error) {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (patientId) => {
    try {
      const response = await doctorAPI.getPatientHistory(patientId);
      setPatientHistory(response.data.data);
    } catch (error) {
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
      patient.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "recent") {
      // Filter patients seen in last 30 days
      // This would need actual appointment data
      return matchesSearch;
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
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field md:w-48"
        >
          <option value="all">All Patients</option>
          <option value="recent">Recent (30 days)</option>
          <option value="chronic">Chronic Conditions</option>
        </select>
      </div>

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
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {patient.userId?.name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-secondary-800">
                      {patient.userId?.name}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      Age: {calculateAge(patient.dateOfBirth)} •{" "}
                      {patient.gender}
                    </p>
                    <p className="text-xs text-secondary-500 mt-1">
                      Blood Group: {patient.bloodGroup || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 bg-primary-50 rounded-lg text-center">
                    <p className="text-xs text-secondary-500">Appointments</p>
                    <p className="font-medium text-primary-600">12</p>
                  </div>
                  <div className="p-2 bg-success-50 rounded-lg text-center">
                    <p className="text-xs text-secondary-500">Prescriptions</p>
                    <p className="font-medium text-success-600">8</p>
                  </div>
                </div>

                {/* Medical History Preview */}
                {patient.medicalHistory?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-secondary-500 mb-1">
                      Medical Conditions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {patient.medicalHistory
                        .slice(0, 2)
                        .map((condition, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                          >
                            {condition.condition}
                          </span>
                        ))}
                      {patient.medicalHistory.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                          +{patient.medicalHistory.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Allergies Preview */}
                {patient.allergies?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-secondary-500 mb-1">
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {patient.allergies.slice(0, 2).map((allergy, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-error-50 text-error-700 rounded-full text-xs"
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
        isOpen={selectedPatient}
        onClose={() => {
          setSelectedPatient(null);
          setPatientHistory(null);
        }}
        title="Patient Medical History"
        size="lg"
      >
        {selectedPatient && patientHistory && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            {/* Patient Info */}
            <div className="flex items-center space-x-4 p-4 gradient-bg rounded-xl text-white">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <FaUser className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold">
                  {selectedPatient.userId?.name}
                </h3>
                <p className="text-white/80">
                  {calculateAge(selectedPatient.dateOfBirth)} years •{" "}
                  {selectedPatient.gender} • {selectedPatient.bloodGroup}
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
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          {condition.condition}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            condition.status === "active"
                              ? "bg-warning-100 text-warning-700"
                              : "bg-success-100 text-success-700"
                          }`}
                        >
                          {condition.status}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600">
                        Diagnosed: {formatDate(condition.diagnosedDate)}
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
                  <FaAllergies className="text-error-500" />
                  <span>Allergies</span>
                </h4>
                <div className="space-y-2">
                  {selectedPatient.allergies.map((allergy, idx) => (
                    <div key={idx} className="p-3 bg-error-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{allergy.allergen}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            allergy.severity === "severe"
                              ? "bg-error-200 text-error-800"
                              : "bg-warning-100 text-warning-700"
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

            {/* Recent Appointments */}
            {patientHistory.appointments?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <FaCalendarAlt className="text-primary-500" />
                  <span>Recent Appointments</span>
                </h4>
                <div className="space-y-2">
                  {patientHistory.appointments.slice(0, 5).map((apt, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {formatDate(apt.date)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            apt.status === "completed"
                              ? "bg-success-100 text-success-700"
                              : "bg-primary-100 text-primary-700"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-600 mt-1">
                        {apt.problem?.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Prescriptions */}
            {patientHistory.prescriptions?.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center space-x-2">
                  <FaFileMedical className="text-primary-500" />
                  <span>Previous Prescriptions</span>
                </h4>
                <div className="space-y-2">
                  {patientHistory.prescriptions.slice(0, 5).map((rx, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                      <p className="font-medium">{formatDate(rx.date)}</p>
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

export default Patients;
