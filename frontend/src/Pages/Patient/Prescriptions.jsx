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
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await patientAPI.getPrescriptions();
      console.log("Prescriptions:", response.data);
      setPrescriptions(response.data.data || []);
    } catch (error) {
      console.error("Failed to load prescriptions:", error);
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (prescription) => {
    // Generate PDF content
    const content = `
      Prescription #${prescription.prescriptionId}
      Date: ${new Date(prescription.date).toLocaleDateString()}
      Doctor: Dr. ${prescription.doctorId?.userId?.name}
      Diagnosis: ${prescription.diagnosis}
      
      Medicines:
      ${prescription.medicines?.map((m) => `- ${m.name}: ${m.dosage}, ${m.frequency} for ${m.duration}`).join("\n")}
      
      Notes: ${prescription.notes || "None"}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription-${prescription.prescriptionId}.txt`;
    a.click();
    toast.success("Download started");
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    if (filter === "active" && !p.isActive) return false;
    if (filter === "expired" && p.isActive) return false;
    if (searchTerm) {
      const doctorName = p.doctorId?.userId?.name?.toLowerCase() || "";
      const diagnosis = p.diagnosis?.toLowerCase() || "";
      return (
        doctorName.includes(searchTerm.toLowerCase()) ||
        diagnosis.includes(searchTerm.toLowerCase())
      );
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
            My Prescriptions
          </h1>
          <p className="text-secondary-600">
            View and manage your prescriptions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by doctor or diagnosis..."
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
            <option value="all">All Prescriptions</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </Card>

      {/* Prescriptions List */}
      {filteredPrescriptions.length === 0 ? (
        <Card className="text-center py-12">
          <FaFileMedical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No prescriptions found
          </h3>
          <p className="text-secondary-600">
            {searchTerm
              ? "Try adjusting your search"
              : "Your prescriptions will appear here"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPrescriptions.map((prescription, index) => (
            <motion.div
              key={prescription._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-r from-primary-600 to-teal-600 rounded-xl">
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
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {prescription.isActive ? "Active" : "Expired"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-secondary-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <FaUserMd className="w-4 h-4" />
                          <span>
                            Dr.{" "}
                            {prescription.doctorId?.userId?.name || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-4 h-4" />
                          <span>
                            {new Date(prescription.date).toLocaleDateString()}
                          </span>
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
                        <p className="text-xs text-orange-600 mt-3">
                          Follow-up:{" "}
                          {new Date(
                            prescription.followUpDate,
                          ).toLocaleDateString()}
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
                    />
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
                      onClick={() => window.print()}
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
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Doctor</p>
                <p className="font-medium">
                  Dr. {selectedPrescription.doctorId?.userId?.name}
                </p>
                <p className="text-sm text-secondary-600">
                  {selectedPrescription.doctorId?.specialization}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Date</p>
                <p className="font-medium">
                  {new Date(selectedPrescription.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <h3 className="font-medium mb-2">Diagnosis</h3>
              <p className="text-secondary-700 bg-gray-50 p-3 rounded-lg">
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
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
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
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
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
                <p className="text-secondary-700 bg-gray-50 p-3 rounded-lg">
                  {selectedPrescription.notes}
                </p>
              </div>
            )}

            {/* Follow-up */}
            {selectedPrescription.followUpDate && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="font-medium mb-1">Follow-up Appointment</p>
                <p className="text-primary-700">
                  Schedule a follow-up on{" "}
                  {new Date(
                    selectedPrescription.followUpDate,
                  ).toLocaleDateString()}
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
