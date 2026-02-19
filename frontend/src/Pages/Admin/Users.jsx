import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaUserMd,
  FaHospital,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaCheck,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserCheck,
  FaUserTimes,
  FaSort,
  FaDownload,
  FaSync,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaStar,
  FaClock,
} from "react-icons/fa";
import { adminAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const [activeTab, setActiveTab] = useState("doctors");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [activeTab, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;
      const params = {};

      if (filter !== "all") {
        if (filter === "pending") params.status = "pending";
        else if (filter === "verified") params.status = "verified";
      }

      if (activeTab === "doctors") {
        response = await adminAPI.getDoctors(params);
      } else if (activeTab === "pharmacies") {
        response = await adminAPI.getPharmacies(params);
      } else {
        response = await adminAPI.getPatients({ search: searchTerm });
      }

      const usersData = response.data.data || [];
      setUsers(usersData);

      // Calculate stats
      setStats({
        total: usersData.length,
        verified: usersData.filter((u) => u.isVerified).length,
        pending: usersData.filter((u) => !u.isVerified).length,
        active: usersData.filter((u) => u.userId?.isActive).length,
        inactive: usersData.filter((u) => !u.userId?.isActive).length,
      });
    } catch (error) {
      console.error(`Failed to load ${activeTab}:`, error);
      toast.error(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      if (activeTab === "doctors") {
        await adminAPI.verifyDoctor(id);
      } else {
        await adminAPI.verifyPharmacy(id);
      }
      toast.success(`${activeTab.slice(0, -1)} verified successfully`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to verify");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminAPI.manageUser(userId, !currentStatus);
      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeTab === "doctors") {
        await adminAPI.deleteDoctor(id);
      } else if (activeTab === "pharmacies") {
        await adminAPI.deletePharmacy(id);
      } else {
        // Handle patient deletion if needed
        toast.error("Patient deletion not implemented");
        return;
      }
      toast.success("User deleted successfully");
      setShowDeleteConfirm(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (activeTab === "doctors") {
        await adminAPI.updateDoctor(selectedUser._id, editForm);
      } else if (activeTab === "pharmacies") {
        await adminAPI.updatePharmacy(selectedUser._id, editForm);
      } else {
        // Handle patient update if needed
        toast.error("Patient update not implemented");
        return;
      }
      toast.success("User updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleExport = () => {
    const data = users.map((user) => ({
      name: user.userId?.name,
      email: user.userId?.email,
      phone: user.userId?.phone,
      role: activeTab.slice(0, -1),
      verified: user.isVerified ? "Yes" : "No",
      active: user.userId?.isActive ? "Yes" : "No",
      joined: new Date(user.userId?.createdAt).toLocaleDateString(),
      ...(activeTab === "doctors" && {
        specialization: user.specialization,
        experience: user.experience,
        fee: user.consultationFee,
      }),
      ...(activeTab === "pharmacies" && {
        license: user.licenseNumber,
        gst: user.gstNumber,
        deliveryRadius: user.deliveryRadius,
      }),
    }));

    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Export started");
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0] || {}).join(",");
    const rows = data.map((obj) => Object.values(obj).join(","));
    return [headers, ...rows].join("\n");
  };

  const filteredUsers = users
    .filter((user) => {
      const name = user.userId?.name?.toLowerCase() || "";
      const email = user.userId?.email?.toLowerCase() || "";
      const phone = user.userId?.phone || "";
      const searchLower = searchTerm.toLowerCase();

      return (
        name.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower)
      );
    })
    .sort((a, b) => {
      let aValue = a.userId?.name || "";
      let bValue = b.userId?.name || "";

      if (sortBy === "date") {
        aValue = new Date(a.userId?.createdAt || 0);
        bValue = new Date(b.userId?.createdAt || 0);
      } else if (sortBy === "status") {
        aValue = a.isVerified ? 1 : 0;
        bValue = b.isVerified ? 1 : 0;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const tabs = [
    {
      id: "doctors",
      label: "Doctors",
      icon: FaUserMd,
      color: "from-green-600 to-emerald-600",
    },
    {
      id: "pharmacies",
      label: "Pharmacies",
      icon: FaHospital,
      color: "from-purple-600 to-pink-600",
    },
    {
      id: "patients",
      label: "Patients",
      icon: FaUsers,
      color: "from-blue-600 to-cyan-600",
    },
  ];

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary-800">
            User Management
          </h1>
          <p className="text-secondary-600">
            Manage doctors, pharmacies, and patients
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" icon={FaSync} onClick={fetchUsers}>
            Refresh
          </Button>
          <Button variant="outline" icon={FaDownload} onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-display font-bold text-primary-600">
            {stats.total}
          </p>
          <p className="text-sm text-secondary-600">Total {activeTab}</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-display font-bold text-green-600">
            {stats.verified}
          </p>
          <p className="text-sm text-secondary-600">Verified</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-display font-bold text-orange-600">
            {stats.pending}
          </p>
          <p className="text-sm text-secondary-600">Pending</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-display font-bold text-blue-600">
            {stats.active}
          </p>
          <p className="text-sm text-secondary-600">Active</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 font-medium transition-all relative ${
              activeTab === tab.id
                ? "text-primary-600"
                : "text-secondary-600 hover:text-primary-600"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="capitalize">{tab.label}</span>
            <span
              className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? "bg-primary-100 text-primary-700"
                  : "bg-gray-100 text-secondary-600"
              }`}
            >
              {stats.total}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-teal-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} by name, email, or phone...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          {activeTab !== "patients" && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="all">All Users</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified</option>
            </select>
          )}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaSort
              className={`w-4 h-4 transform ${sortOrder === "desc" ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </Card>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card className="text-center py-12">
          <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No {activeTab} found
          </h3>
          <p className="text-secondary-600">
            {searchTerm
              ? "Try adjusting your search"
              : `No ${activeTab} registered yet`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 to-teal-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {user.userId?.name?.charAt(0) || "U"}
                        </span>
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          user.userId?.isActive ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-secondary-800">
                        {user.userId?.name || "Unknown"}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {user.userId?.email}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-secondary-500 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          Joined:{" "}
                          {new Date(
                            user.userId?.createdAt,
                          ).toLocaleDateString()}
                        </span>
                        {activeTab === "doctors" && user.specialization && (
                          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                            {user.specialization}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-3">
                    {activeTab !== "patients" && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                          user.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {user.isVerified ? <FaCheckCircle /> : <FaClock />}
                        <span>{user.isVerified ? "Verified" : "Pending"}</span>
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                        user.userId?.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.userId?.isActive ? <FaCheckCircle /> : <FaBan />}
                      <span>
                        {user.userId?.isActive ? "Active" : "Inactive"}
                      </span>
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>

                    {activeTab !== "patients" && !user.isVerified && (
                      <button
                        onClick={() => handleVerify(user._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Verify"
                      >
                        <FaCheckCircle />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setEditForm({
                          name: user.userId?.name,
                          email: user.userId?.email,
                          phone: user.userId?.phone,
                          ...user,
                        });
                        setShowEditModal(true);
                      }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() =>
                        handleToggleStatus(
                          user.userId?._id,
                          user.userId?.isActive,
                        )
                      }
                      className={`p-2 rounded-lg transition-colors ${
                        user.userId?.isActive
                          ? "text-orange-600 hover:bg-orange-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={user.userId?.isActive ? "Deactivate" : "Activate"}
                    >
                      {user.userId?.isActive ? <FaBan /> : <FaCheck />}
                    </button>

                    {activeTab !== "patients" && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>

                {/* Additional Info for Doctors/Pharmacies */}
                {activeTab === "doctors" && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <FaStar className="text-yellow-400" />
                      <span>
                        Rating: {user.rating?.toFixed(1) || "N/A"} (
                        {user.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <FaCalendarAlt />
                      <span>Experience: {user.experience || 0} years</span>
                    </div>
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <FaMoneyBillWave />
                      <span>Fee: ₹{user.consultationFee || "N/A"}</span>
                    </div>
                  </div>
                )}

                {activeTab === "pharmacies" && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <FaMapMarkerAlt />
                      <span>
                        Delivery Radius: {user.deliveryRadius || 0} km
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <FaBox />
                      <span>
                        Inventory: {user.inventory?.length || 0} items
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-secondary-600">
                      <FaCheckCircle />
                      <span>License: {user.licenseNumber || "N/A"}</span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-600 to-teal-600 rounded-xl text-white">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {selectedUser.userId?.name?.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-semibold">
                  {selectedUser.userId?.name}
                </h3>
                <p className="text-white/80">{selectedUser.userId?.email}</p>
              </div>
              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedUser.userId?.isActive
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                >
                  {selectedUser.userId?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Phone</p>
                <p className="font-medium flex items-center">
                  <FaPhone className="mr-2 text-primary-500" />
                  {selectedUser.userId?.phone || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Member Since</p>
                <p className="font-medium flex items-center">
                  <FaCalendarAlt className="mr-2 text-primary-500" />
                  {new Date(
                    selectedUser.userId?.createdAt,
                  ).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Role Specific Details */}
            {activeTab === "doctors" && (
              <div className="space-y-4">
                <h4 className="font-medium">Professional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">Specialization</p>
                    <p className="font-medium">
                      {selectedUser.specialization || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">Experience</p>
                    <p className="font-medium">
                      {selectedUser.experience || 0} years
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">
                      Registration No.
                    </p>
                    <p className="font-medium">
                      {selectedUser.registrationNumber || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">
                      Consultation Fee
                    </p>
                    <p className="font-medium">
                      ₹{selectedUser.consultationFee || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedUser.qualification?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Qualifications</h4>
                    <div className="space-y-2">
                      {selectedUser.qualification.map((qual, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{qual.degree}</p>
                          <p className="text-sm text-secondary-600">
                            {qual.institution} ({qual.year})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.clinicAddress && (
                  <div>
                    <h4 className="font-medium mb-2">Clinic Address</h4>
                    <p className="text-secondary-700 bg-gray-50 p-3 rounded-lg">
                      {selectedUser.clinicAddress.address}
                      <br />
                      {selectedUser.clinicAddress.city},{" "}
                      {selectedUser.clinicAddress.state} -{" "}
                      {selectedUser.clinicAddress.pincode}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "pharmacies" && (
              <div className="space-y-4">
                <h4 className="font-medium">Pharmacy Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">License Number</p>
                    <p className="font-medium">
                      {selectedUser.licenseNumber || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">GST Number</p>
                    <p className="font-medium">
                      {selectedUser.gstNumber || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">
                      Delivery Radius
                    </p>
                    <p className="font-medium">
                      {selectedUser.deliveryRadius || 0} km
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">
                      Inventory Items
                    </p>
                    <p className="font-medium">
                      {selectedUser.inventory?.length || 0}
                    </p>
                  </div>
                </div>

                {selectedUser.operatingHours && (
                  <div>
                    <h4 className="font-medium mb-2">Operating Hours</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(selectedUser.operatingHours).map(
                        ([day, hours]) => (
                          <div
                            key={day}
                            className="p-2 bg-gray-50 rounded-lg text-sm"
                          >
                            <span className="font-medium capitalize">
                              {day}:{" "}
                            </span>
                            {hours.closed
                              ? "Closed"
                              : `${hours.open} - ${hours.close}`}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "patients" && (
              <div className="space-y-4">
                <h4 className="font-medium">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">Age</p>
                    <p className="font-medium">{selectedUser.age || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">Gender</p>
                    <p className="font-medium capitalize">
                      {selectedUser.gender || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-secondary-500">Blood Group</p>
                    <p className="font-medium">
                      {selectedUser.bloodGroup || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedUser.emergencyContact && (
                  <div>
                    <h4 className="font-medium mb-2">Emergency Contact</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium">
                        {selectedUser.emergencyContact.name}
                      </p>
                      <p className="text-sm text-secondary-600">
                        {selectedUser.emergencyContact.relationship}
                      </p>
                      <p className="text-sm text-secondary-600">
                        {selectedUser.emergencyContact.phone}
                      </p>
                    </div>
                  </div>
                )}

                {selectedUser.medicalHistory?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Medical History</h4>
                    <div className="space-y-2">
                      {selectedUser.medicalHistory.map((history, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium">{history.condition}</p>
                          <p className="text-sm text-secondary-600">
                            Diagnosed:{" "}
                            {new Date(
                              history.diagnosedDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditForm({});
        }}
        title="Edit User"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={editForm.name || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={editForm.email || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Phone
            </label>
            <input
              type="text"
              value={editForm.phone || ""}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
              className="input-field"
            />
          </div>

          {activeTab === "doctors" && (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={editForm.specialization || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, specialization: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Consultation Fee
                </label>
                <input
                  type="number"
                  value={editForm.consultationFee || ""}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      consultationFee: e.target.value,
                    })
                  }
                  className="input-field"
                />
              </div>
            </>
          )}

          {activeTab === "pharmacies" && (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  License Number
                </label>
                <input
                  type="text"
                  value={editForm.licenseNumber || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, licenseNumber: e.target.value })
                  }
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Delivery Radius (km)
                </label>
                <input
                  type="number"
                  value={editForm.deliveryRadius || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, deliveryRadius: e.target.value })
                  }
                  className="input-field"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpdateUser}>
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p className="text-secondary-700">
            Are you sure you want to delete this {activeTab.slice(0, -1)}? This
            action cannot be undone.
          </p>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => handleDelete(selectedUser._id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminUsers;
