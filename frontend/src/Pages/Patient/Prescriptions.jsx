import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaFileMedical,
  FaDownload,
  FaPrint,
  FaCalendarAlt,
  FaUserMd,
  FaPills,
  FaFlask,
  FaEye,
} from "react-icons/fa";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import { formatDate } from "../../Utils/helpers.js";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await patientAPI.getPrescriptions();
      setPrescriptions(response.data.data);
    } catch (error) {
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (prescription) => {
    // In a real app, this would generate a PDF
    toast.success("Download started");
  };

  const handlePrint = (prescription) => {
    window.print();
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (filter === "all") return true;
    if (filter === "active") return p.isActive;
    if (filter === "expired") return !p.isActive;
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
            My Prescriptions
          </h1>
          <p className="text-secondary-600">
            View and manage your prescriptions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {["all", "active", "expired"].map((status) => (
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
        ))}
      </div>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <Card className="text-center py-12">
          <FaFileMedical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No prescriptions found
          </h3>
          <p className="text-secondary-600">
            Your prescriptions will appear here after doctor visits
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription, index) => (
            <motion.div
              key={prescription._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 gradient-bg rounded-xl">
                      <FaFileMedical className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-display font-semibold text-secondary-800">
                          Prescription #{prescription.prescriptionId}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            prescription.isActive
                              ? "bg-success-100 text-success-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {prescription.isActive ? "Active" : "Expired"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <FaUserMd className="w-4 h-4" />
                          <span>Dr. {prescription.doctorId?.userId?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-4 h-4" />
                          <span>{formatDate(prescription.date)}</span>
                        </div>
                      </div>

                      <p className="text-sm text-secondary-800 mb-3">
                        <span className="font-medium">Diagnosis:</span>{" "}
                        {prescription.diagnosis}
                      </p>

                      {/* Medicines Preview */}
                      <div className="flex flex-wrap gap-2">
                        {prescription.medicines?.slice(0, 3).map((med, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                          >
                            {med.name}
                          </span>
                        ))}
                        {prescription.medicines?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            +{prescription.medicines.length - 3} more
                          </span>
                        )}
                      </div>

                      {prescription.followUpDate && (
                        <p className="text-xs text-warning-600 mt-3">
                          Follow-up: {formatDate(prescription.followUpDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FaEye}
                      onClick={() => setSelectedPrescription(prescription)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FaDownload}
                      onClick={() => handleDownload(prescription)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FaPrint}
                      onClick={() => handlePrint(prescription)}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Prescription Details Modal */}
      <Modal
        isOpen={selectedPrescription}
        onClose={() => setSelectedPrescription(null)}
        title="Prescription Details"
        size="lg"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-display font-bold text-secondary-800">
                Medical Prescription
              </h2>
              <p className="text-sm text-secondary-500">
                #{selectedPrescription.prescriptionId}
              </p>
            </div>

            {/* Doctor & Patient Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-500">Doctor</p>
                <p className="font-medium">
                  Dr. {selectedPrescription.doctorId?.userId?.name}
                </p>
                <p className="text-sm text-secondary-600">
                  {selectedPrescription.doctorId?.specialization}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Date</p>
                <p className="font-medium">
                  {formatDate(selectedPrescription.date)}
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <h3 className="font-medium mb-2">Diagnosis</h3>
              <p className="text-secondary-700">
                {selectedPrescription.diagnosis}
              </p>
            </div>

            {/* Medicines */}
            {selectedPrescription.medicines?.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center space-x-2">
                  <FaPills className="text-primary-500" />
                  <span>Prescribed Medicines</span>
                </h3>
                <div className="space-y-3">
                  {selectedPrescription.medicines.map((medicine, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-sm text-primary-600">
                          {medicine.dosage}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-secondary-500">Frequency:</span>
                          <span className="ml-2">{medicine.frequency}</span>
                        </div>
                        <div>
                          <span className="text-secondary-500">Duration:</span>
                          <span className="ml-2">{medicine.duration}</span>
                        </div>
                      </div>
                      {medicine.instructions && (
                        <p className="text-xs text-secondary-500 mt-2">
                          Note: {medicine.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tests */}
            {selectedPrescription.tests?.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center space-x-2">
                  <FaFlask className="text-primary-500" />
                  <span>Recommended Tests</span>
                </h3>
                <div className="space-y-2">
                  {selectedPrescription.tests.map((test, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                      <p className="font-medium">{test.name}</p>
                      {test.instructions && (
                        <p className="text-sm text-secondary-600 mt-1">
                          {test.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedPrescription.notes && (
              <div>
                <h3 className="font-medium mb-2">Additional Notes</h3>
                <p className="text-secondary-700 bg-gray-50 p-3 rounded-xl">
                  {selectedPrescription.notes}
                </p>
              </div>
            )}

            {/* Follow-up */}
            {selectedPrescription.followUpDate && (
              <div className="p-4 bg-primary-50 rounded-xl">
                <p className="font-medium mb-1">Follow-up Appointment</p>
                <p className="text-primary-700">
                  Schedule a follow-up on{" "}
                  {formatDate(selectedPrescription.followUpDate)}
                </p>
              </div>
            )}

            {/* Digital Signature */}
            <div className="border-t pt-4 text-right">
              <p className="text-sm text-secondary-500">Digitally Signed by</p>
              <p className="font-medium">
                {selectedPrescription.digitalSignature}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Prescriptions;
