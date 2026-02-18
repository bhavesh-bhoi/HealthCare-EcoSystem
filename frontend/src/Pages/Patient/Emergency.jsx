import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaExclamationTriangle,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaAmbulance,
  FaHeartbeat,
} from "react-icons/fa";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import toast from "react-hot-toast";

const Emergency = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [response, setResponse] = useState(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGettingLocation(false);
          toast.success("Location detected");
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Failed to get location. Please enter manually.");
          setGettingLocation(false);
        },
      );
    } else {
      toast.error("Geolocation not supported");
      setGettingLocation(false);
    }
  };

  const handleEmergency = async () => {
    if (!location) {
      toast.error("Please enable location for emergency services");
      return;
    }

    setLoading(true);
    try {
      const response = await patientAPI.emergencyAlert({
        description,
        location,
      });
      setResponse(response.data);
      setAlertSent(true);
      toast.success("Emergency alert sent! Help is on the way.");
    } catch (error) {
      toast.error("Failed to send emergency alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!alertSent ? (
        <Card className="overflow-hidden">
          {/* Emergency Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 -mt-6 -mx-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <FaExclamationTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  Emergency Assistance
                </h1>
                <p className="text-red-100">
                  Click the button below for immediate medical help
                </p>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-warning-50 border-l-4 border-warning-500 p-4 mb-6 rounded-r-xl">
            <p className="text-warning-700 text-sm">
              <strong>⚠️ Important:</strong> This is for genuine emergencies
              only. Nearest available doctors and ambulances will be notified
              immediately.
            </p>
          </div>

          {/* Location Detection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Your Location
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="flex-1 flex items-center justify-center space-x-2 p-3 bg-primary-50 text-primary-700 rounded-xl hover:bg-primary-100 transition-colors"
              >
                {gettingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt />
                    <span>
                      {location ? "Location Detected" : "Detect My Location"}
                    </span>
                  </>
                )}
              </button>
              {location && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="p-2 bg-success-100 rounded-full"
                >
                  <FaHeartbeat className="w-5 h-5 text-success-600" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Emergency Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Describe your emergency (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
              placeholder="e.g., Severe chest pain, difficulty breathing, unconscious person..."
            />
          </div>

          {/* Emergency Button */}
          <Button
            variant="emergency"
            onClick={handleEmergency}
            disabled={loading || !location}
            className="w-full py-4 text-lg"
            icon={FaAmbulance}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending Alert...
              </span>
            ) : (
              "🚨 SEND EMERGENCY ALERT"
            )}
          </Button>

          <p className="text-xs text-secondary-500 text-center mt-4">
            By clicking, you agree to share your location with emergency
            services
          </p>
        </Card>
      ) : (
        /* Success Screen */
        <Card>
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-success-100 rounded-full mb-4"
            >
              <FaAmbulance className="w-12 h-12 text-success-600" />
            </motion.div>
            <h2 className="text-2xl font-display font-bold text-success-600">
              Alert Sent Successfully!
            </h2>
            <p className="text-secondary-600 mt-2">
              Medical assistance is on the way. Stay calm and wait for help.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="font-medium">Location Shared</p>
                  <p className="text-sm text-secondary-600">
                    Your location has been shared with nearby emergency services
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start space-x-3">
                <FaClock className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="font-medium">Estimated Response Time</p>
                  <p className="text-sm text-secondary-600">
                    Medical help should arrive within 5-10 minutes
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-start space-x-3">
                <FaPhone className="w-5 h-5 text-primary-500 mt-0.5" />
                <div>
                  <p className="font-medium">Emergency Contact</p>
                  <p className="text-sm text-secondary-600">
                    We've also notified your emergency contact: +1 234 567 8900
                  </p>
                </div>
              </div>
            </div>
          </div>

          {response?.notifiedDoctors && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Notified Doctors:</h3>
              <div className="space-y-2">
                {response.notifiedDoctors.map((doctor, index) => (
                  <div key={index} className="p-3 bg-primary-50 rounded-xl">
                    <p className="font-medium">Dr. {doctor.name}</p>
                    <p className="text-sm text-primary-600">
                      Available and responding
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={() => navigate("/patient/dashboard")}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Emergency;
