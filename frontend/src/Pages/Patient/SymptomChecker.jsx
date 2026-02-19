import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";

const SymptomChecker = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const commonSymptoms = [
    { name: "Fever", icon: "🌡️", category: "vital" },
    { name: "Cough", icon: "🤧", category: "respiratory" },
    { name: "Headache", icon: "🤕", category: "neurological" },
    { name: "Fatigue", icon: "😴", category: "general" },
    { name: "Nausea", icon: "🤢", category: "digestive" },
    { name: "Body Ache", icon: "💪", category: "general" },
    { name: "Sore Throat", icon: "😷", category: "respiratory" },
    { name: "Shortness of Breath", icon: "😮‍💨", category: "respiratory" },
    { name: "Chest Pain", icon: "❤️", category: "cardiac" },
    { name: "Dizziness", icon: "😵", category: "neurological" },
  ];

  const handleSymptomSelect = (symptom) => {
    if (selectedSymptoms.find((s) => s.name === symptom.name)) {
      setSelectedSymptoms(
        selectedSymptoms.filter((s) => s.name !== symptom.name),
      );
    } else {
      setSelectedSymptoms([
        ...selectedSymptoms,
        { ...symptom, severity: "moderate", duration: "" },
      ]);
    }
  };

  const updateSymptomDetail = (index, field, value) => {
    const updated = [...selectedSymptoms];
    updated[index][field] = value;
    setSelectedSymptoms(updated);
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }

    setLoading(true);
    try {
      const response = await patientAPI.checkSymptoms({
        symptoms: selectedSymptoms,
      });
      console.log("Analysis result:", response.data);
      setAnalysis(response.data);
      setStep(2);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-primary-600 to-teal-600 rounded-xl">
            <MdHealthAndSafety className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-secondary-800">
              AI Symptom Checker
            </h1>
            <p className="text-secondary-600">
              Select your symptoms for an initial AI-powered assessment
            </p>
          </div>
        </div>
      </Card>

      {step === 1 ? (
        <>
          {/* Symptoms Grid */}
          <Card>
            <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
              Select Your Symptoms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {commonSymptoms.map((symptom) => (
                <motion.button
                  key={symptom.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSymptomSelect(symptom)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSymptoms.find((s) => s.name === symptom.name)
                      ? "border-primary-600 bg-primary-50"
                      : "border-gray-200 hover:border-primary-300"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{symptom.icon}</span>
                  <span className="text-sm font-medium">{symptom.name}</span>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Selected Symptoms Details */}
          {selectedSymptoms.length > 0 && (
            <Card>
              <h2 className="text-lg font-display font-semibold text-secondary-800 mb-4">
                Symptom Details
              </h2>
              <div className="space-y-4">
                {selectedSymptoms.map((symptom, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{symptom.icon}</span>
                        <span className="font-medium">{symptom.name}</span>
                      </div>
                      <select
                        value={symptom.severity}
                        onChange={(e) =>
                          updateSymptomDetail(index, "severity", e.target.value)
                        }
                        className="px-3 py-1 rounded-lg border border-gray-200 text-sm"
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Duration (e.g., 2 days)"
                      value={symptom.duration}
                      onChange={(e) =>
                        updateSymptomDetail(index, "duration", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Analyze Button */}
          <div className="flex justify-center">
            <Button
              onClick={analyzeSymptoms}
              disabled={loading || selectedSymptoms.length === 0}
              icon={FaArrowRight}
            >
              {loading ? "Analyzing..." : "Analyze Symptoms"}
            </Button>
          </div>
        </>
      ) : (
        /* Analysis Results */
        <Card>
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-6">
            Analysis Results
          </h2>

          {/* Overall Risk */}
          <div
            className={`mb-6 p-6 rounded-xl border-2 ${getSeverityColor(analysis?.analysis?.overallSeverity)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium mb-1">Overall Risk Level</p>
                <p className="text-3xl font-display font-bold capitalize">
                  {analysis?.analysis?.overallSeverity || "Unknown"}
                </p>
              </div>
              {analysis?.analysis?.overallSeverity === "high" && (
                <FaExclamationTriangle className="w-12 h-12 text-red-500" />
              )}
              {analysis?.analysis?.overallSeverity === "low" && (
                <FaCheckCircle className="w-12 h-12 text-green-500" />
              )}
            </div>
          </div>

          {/* Risk Score */}
          {analysis?.riskScore && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-sm text-secondary-600">
                  {analysis.riskScore.score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.riskScore.score}%` }}
                  className={`h-2 rounded-full ${
                    analysis.riskScore.score > 70
                      ? "bg-red-500"
                      : analysis.riskScore.score > 40
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Possible Causes */}
          {analysis?.analysis?.possibleCauses?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Possible Causes</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.analysis.possibleCauses.map((cause, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {cause}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis?.analysis?.recommendations?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {analysis.analysis.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <span className="text-primary-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {analysis?.riskScore?.warnings?.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center space-x-2">
                <FaExclamationTriangle className="w-4 h-4" />
                <span>Warnings</span>
              </h3>
              <ul className="space-y-1">
                {analysis.riskScore.warnings.map((warning, index) => (
                  <li key={index} className="text-sm text-red-600">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() =>
                (window.location.href = "/patient/book-appointment")
              }
              className="flex-1"
            >
              Book Appointment
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedSymptoms([]);
                setAnalysis(null);
                setStep(1);
              }}
              className="flex-1"
            >
              Check Again
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-secondary-500 mt-4 text-center">
            This is an AI-assisted analysis and not a medical diagnosis. Always
            consult with a healthcare professional.
          </p>
        </Card>
      )}
    </div>
  );
};

export default SymptomChecker;
