import React from "react";
import { Link } from "react-router-dom";
import {
  FaHeartbeat,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaHeartbeat className="w-6 h-6 text-primary-600" />
              <span className="text-xl font-display font-bold">
                <span className="gradient-text">Health</span>
                <span className="text-secondary-800">Care</span>
              </span>
            </div>
            <p className="text-secondary-600 text-sm">
              Your complete healthcare solution for booking appointments,
              checking symptoms, and ordering medicines.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-secondary-400 hover:text-primary-600 transition-colors"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-secondary-400 hover:text-primary-600 transition-colors"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-secondary-400 hover:text-primary-600 transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-secondary-400 hover:text-primary-600 transition-colors"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-secondary-800 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-secondary-600 hover:text-primary-600 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-secondary-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-secondary-600 hover:text-primary-600 transition-colors text-sm"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-secondary-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-secondary-800 mb-4">
              Services
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/patient/book-appointment"
                  className="text-secondary-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link
                  to="/patient/symptom-checker"
                  className="text-secondary-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Symptom Checker
                </Link>
              </li>
              <li>
                <Link
                  to="/patient/orders"
                  className="text-secondary-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Order Medicines
                </Link>
              </li>
              <li>
                <Link
                  to="/patient/emergency"
                  className="text-secondary-600 hover:text-primary-600 transition-colors text-sm"
                >
                  Emergency
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-secondary-800 mb-4">
              Contact
            </h4>
            <ul className="space-y-2">
              <li className="text-secondary-600 text-sm">
                123 Healthcare Street
              </li>
              <li className="text-secondary-600 text-sm">
                support@healthcare.com
              </li>
              <li className="text-secondary-600 text-sm">+1 234 567 8900</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8 text-center">
          <p className="text-secondary-500 text-sm">
            © {new Date().getFullYear()} HealthCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
