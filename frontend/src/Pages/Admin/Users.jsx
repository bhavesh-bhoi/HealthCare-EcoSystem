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
} from "react-icons/fa";
import { adminAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import { formatDate } from "../../Utils/helpers.js";

const Users = () => {
  const [activeTab, setActiveTab] = useState("doctors");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [activeTab, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "doctors") {
        response = await adminAPI.getDoctors({
          status: filter !== "all" ? filter : undefined,
        });
      } else if (activeTab === "pharmacies") {
        response = await adminAPI.getPharmacies({
          status: filter !== "all" ? filter : undefined,
        });
      } else {
        response = await adminAPI.getPatients();
      }
      setUsers(response.data.data);
    } catch (error) {
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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await adminAPI.manageUser(id, !currentStatus);
      toast.success(
        `User ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      if (activeTab === "doctors") {
        await adminAPI.deleteDoctor(id);
      } else {
        await adminAPI.deletePharmacy(id);
      }
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateUser = async () => {
    try {
      if (activeTab === "doctors") {
        await adminAPI.updateDoctor(selectedUser._id, editForm);
      } else {
        await adminAPI.updatePharmacy(selectedUser._id, editForm);
      }
      toast.success("User updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const name =
      activeTab === "patients" ? user.userId?.name : user.userId?.name;
    return (
      name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const tabs = [
    { id: "doctors", label: "Doctors", icon: FaUserMd, count: users.length },
    {
      id: "pharmacies",
      label: "Pharmacies",
      icon: FaHospital,
      count: users.length,
    },
    { id: "patients", label: "Patients", icon: FaUsers, count: users.length },
  ];

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-secondary-800">
          User Management
        </h1>
        <p className="text-secondary-600">
          Manage doctors, pharmacies, and patients
        </p>
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
              {tab.count}
            </span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 gradient-bg"
              />
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>

        {activeTab !== "patients" && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Users</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
          </select>
        )}
      </div>

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
                <div className="flex items-center justify-between">
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {user.userId?.name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-secondary-800">
                        {user.userId?.name}
                      </h3>
                      <p className="text-sm text-secondary-600">
                        {user.userId?.email}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs text-secondary-500">
                          Joined: {formatDate(user.userId?.createdAt)}
                        </span>
                        {activeTab === "doctors" && (
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
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.isVerified
                            ? "bg-success-100 text-success-700"
                            : "bg-warning-100 text-warning-700"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.userId?.isActive
                          ? "bg-success-100 text-success-700"
                          : "bg-error-100 text-error-700"
                      }`}
                    >
                      {user.userId?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>

                    {activeTab !== "patients" && !user.isVerified && (
                      <button
                        onClick={() => handleVerify(user._id)}
                        className="p-2 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
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
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                          ? "text-warning-600 hover:bg-warning-50"
                          : "text-success-600 hover:bg-success-50"
                      }`}
                      title={user.userId?.isActive ? "Deactivate" : "Activate"}
                    >
                      {user.userId?.isActive ? <FaBan /> : <FaCheck />}
                    </button>

                    <button
                      onClick={() => handleDelete(user._id)}
                      className="p-2 text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
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
            <div className="flex items-center space-x-4 p-4 gradient-bg rounded-xl text-white">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {selectedUser.userId?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold">
                  {selectedUser.userId?.name}
                </h3>
                <p className="text-white/80">{selectedUser.userId?.email}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500">Phone</p>
                <p className="font-medium">{selectedUser.userId?.phone}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500">Role</p>
                <p className="font-medium capitalize">
                  {activeTab.slice(0, -1)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500">Joined</p>
                <p className="font-medium">
                  {formatDate(selectedUser.userId?.createdAt)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500">Last Login</p>
                <p className="font-medium">
                  {selectedUser.userId?.lastLogin
                    ? formatDate(selectedUser.userId.lastLogin)
                    : "Never"}
                </p>
              </div>
            </div>

            {/* Doctor Specific Details */}
            {activeTab === "doctors" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-secondary-500">Specialization</p>
                    <p className="font-medium">{selectedUser.specialization}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-secondary-500">Experience</p>
                    <p className="font-medium">
                      {selectedUser.experience} years
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-secondary-500">
                      Registration No.
                    </p>
                    <p className="font-medium">
                      {selectedUser.registrationNumber}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-secondary-500">
                      Consultation Fee
                    </p>
                    <p className="font-medium">
                      ₹{selectedUser.consultationFee}
                    </p>
                  </div>
                </div>

                {/* Qualifications */}
                {selectedUser.qualification?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Qualifications</h4>
                    <div className="space-y-2">
                      {selectedUser.qualification.map((qual, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                          <p className="font-medium">{qual.degree}</p>
                          <p className="text-sm text-secondary-600">
                            {qual.institution} ({qual.year})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Pharmacy Specific Details */}
            {activeTab === "pharmacies" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-secondary-500">License Number</p>
                  <p className="font-medium">{selectedUser.licenseNumber}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-secondary-500">GST Number</p>
                  <p className="font-medium">
                    {selectedUser.gstNumber || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-secondary-500">Delivery Radius</p>
                  <p className="font-medium">
                    {selectedUser.deliveryRadius} km
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-secondary-500">Inventory Items</p>
                  <p className="font-medium">
                    {selectedUser.inventory?.length || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Address */}
            {selectedUser.userId?.location && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-secondary-500 mb-1">Address</p>
                <p className="text-secondary-700">
                  {selectedUser.userId.location.address},
                  {selectedUser.userId.location.city},
                  {selectedUser.userId.location.state} -{" "}
                  {selectedUser.userId.location.pincode}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
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
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleUpdateUser}
            >
              Update User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
