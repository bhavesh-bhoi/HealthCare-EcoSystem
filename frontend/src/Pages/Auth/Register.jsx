import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaArrowRight,
  FaUserMd,
  FaHospital,
  FaHeartbeat,
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { useAuth } from "../../Contexts/AuthContext";
import toast from "react-hot-toast";
import FadeIn from "../../Components/Animations/FadeIn";

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("patient");
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const roles = [
    {
      id: "patient",
      label: "Patient",
      icon: FaUser,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "doctor",
      label: "Doctor",
      icon: FaUserMd,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "pharmacy",
      label: "Pharmacy",
      icon: FaHospital,
      color: "from-purple-500 to-pink-500",
    },
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await registerUser({ ...data, role });
      if (response.status === "success") {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-teal-900 to-green-900 relative overflow-hidden py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Registration Form */}
      <div className="relative z-10 w-full max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-600 to-teal-600 mb-4"
            >
              <FaHeartbeat className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-display font-bold text-secondary-800">
              Create Account
            </h1>
            <p className="text-secondary-600 mt-2">
              Join{" "}
              <span className="gradient-text font-semibold">HealthCare</span>
              <HiOutlineSparkles className="inline ml-1 text-primary-500" />
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 1
                    ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                    : "bg-gray-200 text-secondary-600"
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 rounded-full transition-all duration-300 ${
                  step >= 2
                    ? "bg-gradient-to-r from-primary-600 to-teal-600"
                    : "bg-gray-200"
                }`}
              />
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 2
                    ? "bg-gradient-to-r from-primary-600 to-teal-600 text-white"
                    : "bg-gray-200 text-secondary-600"
                }`}
              >
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Role Selection */}
                  <div>
                    <label className="text-sm font-medium text-secondary-700 mb-3 block">
                      I want to join as
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {roles.map((r) => (
                        <motion.button
                          key={r.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setRole(r.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            role === r.id
                              ? `border-transparent bg-gradient-to-r ${r.color} text-white shadow-medium`
                              : "border-gray-200 hover:border-primary-300"
                          }`}
                        >
                          <r.icon className="w-6 h-6 mx-auto mb-2" />
                          <span className="font-medium">{r.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <FadeIn delay={0.1}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                        <input
                          type="text"
                          {...register("name", {
                            required: "Name is required",
                          })}
                          className="input-field pl-12"
                          placeholder="Enter your full name"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-sm">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                  </FadeIn>

                  <FadeIn delay={0.2}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                        <input
                          type="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value:
                                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                              message: "Invalid email format",
                            },
                          })}
                          className="input-field pl-12"
                          placeholder="Enter your email"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </FadeIn>

                  <FadeIn delay={0.3}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                        <input
                          type="tel"
                          {...register("phone", {
                            required: "Phone number is required",
                            pattern: {
                              value:
                                /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/,
                              message: "Invalid phone number",
                            },
                          })}
                          className="input-field pl-12"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </FadeIn>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <FadeIn delay={0.1}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary-700">
                        Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                        <input
                          type="password"
                          {...register("password", {
                            required: "Password is required",
                            minLength: {
                              value: 6,
                              message: "Password must be at least 6 characters",
                            },
                          })}
                          className="input-field pl-12"
                          placeholder="Create a password"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  </FadeIn>

                  <FadeIn delay={0.2}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary-700">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                        <input
                          type="password"
                          {...register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (val) => {
                              if (watch("password") !== val) {
                                return "Passwords do not match";
                              }
                            },
                          })}
                          className="input-field pl-12"
                          placeholder="Confirm your password"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </FadeIn>

                  <FadeIn delay={0.3}>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        {...register("terms", {
                          required: "You must accept the terms",
                        })}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <label className="text-sm text-secondary-600">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-red-500 text-sm">
                        {errors.terms.message}
                      </p>
                    )}
                  </FadeIn>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
              )}

              <div className="flex-1 flex justify-end">
                {step === 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary"
                  >
                    Continue
                  </button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <FaArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </form>

          {/* Login Link */}
          <FadeIn delay={0.5}>
            <p className="text-center mt-8 text-secondary-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </FadeIn>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
