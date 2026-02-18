import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaPills,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaExclamationTriangle,
  FaClock,
  FaRupeeSign,
  FaBoxes,
  FaFileImport,
  FaFileExport,
} from "react-icons/fa";
import { pharmacyAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import { formatDate, formatCurrency } from "../../Utils/helpers.js";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [formData, setFormData] = useState({
    medicineId: "",
    name: "",
    stock: "",
    price: "",
    batchNumber: "",
    expiryDate: "",
    discount: 0,
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await pharmacyAPI.getInventory();
      setInventory(response.data.data.inventory || []);
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      await pharmacyAPI.updateInventory({
        inventory: [...inventory, formData],
      });
      toast.success("Item added successfully");
      setShowAddModal(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  const handleUpdateItem = async () => {
    try {
      const updatedInventory = inventory.map((item) =>
        item._id === selectedItem._id ? { ...item, ...formData } : item,
      );
      await pharmacyAPI.updateInventory({ inventory: updatedInventory });
      toast.success("Item updated successfully");
      setShowEditModal(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const updatedInventory = inventory.filter((item) => item._id !== itemId);
      await pharmacyAPI.updateInventory({ inventory: updatedInventory });
      toast.success("Item deleted successfully");
      fetchInventory();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleBulkImport = () => {
    // Implement bulk import functionality
    toast.success("Bulk import feature coming soon");
  };

  const handleExport = () => {
    // Implement export functionality
    const data = JSON.stringify(inventory, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString()}.json`;
    a.click();
  };

  const resetForm = () => {
    setFormData({
      medicineId: "",
      name: "",
      stock: "",
      price: "",
      batchNumber: "",
      expiryDate: "",
      discount: 0,
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return { label: "Out of Stock", color: "bg-error-100 text-error-700" };
    if (stock < 10)
      return { label: "Low Stock", color: "bg-warning-100 text-warning-700" };
    return { label: "In Stock", color: "bg-success-100 text-success-700" };
  };

  const filteredInventory = inventory.filter((item) => {
    const medicineName = item.medicineId?.name || item.name || "";
    return (
      medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const lowStockItems = inventory.filter((item) => item.stock < 10);
  const expiringItems = inventory.filter((item) => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
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
            Inventory Management
          </h1>
          <p className="text-secondary-600">Manage your medicine stock</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            icon={FaFileImport}
            onClick={handleBulkImport}
          >
            Import
          </Button>
          <Button variant="outline" icon={FaFileExport} onClick={handleExport}>
            Export
          </Button>
          <Button icon={FaPlus} onClick={() => setShowAddModal(true)}>
            Add Item
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(lowStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="bg-warning-50 border-warning-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <FaExclamationTriangle className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <p className="font-medium text-warning-800">
                    {lowStockItems.length} items are running low on stock
                  </p>
                  <button
                    onClick={() => setShowLowStockModal(true)}
                    className="text-sm text-warning-600 hover:text-warning-700"
                  >
                    View details →
                  </button>
                </div>
              </div>
            </Card>
          )}

          {expiringItems.length > 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FaClock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">
                    {expiringItems.length} items expiring within 30 days
                  </p>
                  <button
                    onClick={() => {
                      /* Show expiring items */
                    }}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    View details →
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
        <input
          type="text"
          placeholder="Search by medicine name or batch number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <FaBoxes className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-secondary-800">
            {inventory.length}
          </p>
          <p className="text-sm text-secondary-600">Total Items</p>
        </Card>
        <Card className="text-center">
          <FaPills className="w-6 h-6 text-success-500 mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-secondary-800">
            {inventory.reduce((sum, item) => sum + item.stock, 0)}
          </p>
          <p className="text-sm text-secondary-600">Total Units</p>
        </Card>
        <Card className="text-center">
          <FaRupeeSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-secondary-800">
            {formatCurrency(
              inventory.reduce((sum, item) => sum + item.price * item.stock, 0),
            )}
          </p>
          <p className="text-sm text-secondary-600">Inventory Value</p>
        </Card>
        <Card className="text-center">
          <FaExclamationTriangle className="w-6 h-6 text-warning-500 mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-secondary-800">
            {lowStockItems.length}
          </p>
          <p className="text-sm text-secondary-600">Low Stock Items</p>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">
                  Medicine
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">
                  Batch No.
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">
                  Stock
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">
                  Price
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">
                  Expiry
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-secondary-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => {
                const stockStatus = getStockStatus(item.stock);
                const medicineName =
                  item.medicineId?.name || item.name || "Unknown";
                const daysUntilExpiry = item.expiryDate
                  ? Math.ceil(
                      (new Date(item.expiryDate) - new Date()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : null;

                return (
                  <motion.tr
                    key={item._id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-800">
                          {medicineName}
                        </p>
                        {item.discount > 0 && (
                          <p className="text-xs text-success-600">
                            {item.discount}% off
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600">
                      {item.batchNumber || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          item.stock < 10
                            ? "text-warning-600"
                            : "text-secondary-800"
                        }`}
                      >
                        {item.stock} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium flex items-center">
                        <FaRupeeSign className="w-3 h-3" />
                        {item.price}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.expiryDate ? (
                        <div>
                          <span className="text-sm">
                            {formatDate(item.expiryDate)}
                          </span>
                          {daysUntilExpiry && daysUntilExpiry <= 30 && (
                            <p className="text-xs text-warning-600">
                              {daysUntilExpiry} days left
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-secondary-400">
                          Not set
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${stockStatus.color}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setFormData({
                              medicineId: item.medicineId,
                              name: medicineName,
                              stock: item.stock,
                              price: item.price,
                              batchNumber: item.batchNumber,
                              expiryDate: item.expiryDate
                                ? item.expiryDate.split("T")[0]
                                : "",
                              discount: item.discount || 0,
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1 text-primary-600 hover:text-primary-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-1 text-error-600 hover:text-error-700 transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <FaPills className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-secondary-600">No inventory items found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Inventory Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Medicine Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="Enter medicine name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                }
                className="input-field"
                placeholder="Enter quantity"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) })
                }
                className="input-field"
                placeholder="Enter price"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Batch Number
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
                className="input-field"
                placeholder="Enter batch number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="input-field"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: parseInt(e.target.value) })
              }
              className="input-field"
              placeholder="Enter discount percentage"
              min="0"
              max="100"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleAddItem}
              disabled={!formData.name || !formData.stock || !formData.price}
            >
              Add Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Inventory Item"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Medicine Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              placeholder="Enter medicine name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) })
                }
                className="input-field"
                placeholder="Enter quantity"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseInt(e.target.value) })
                }
                className="input-field"
                placeholder="Enter price"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Batch Number
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) =>
                  setFormData({ ...formData, batchNumber: e.target.value })
                }
                className="input-field"
                placeholder="Enter batch number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                className="input-field"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: parseInt(e.target.value) })
              }
              className="input-field"
              placeholder="Enter discount percentage"
              min="0"
              max="100"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleUpdateItem}
              disabled={!formData.name || !formData.stock || !formData.price}
            >
              Update Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Low Stock Modal */}
      <Modal
        isOpen={showLowStockModal}
        onClose={() => setShowLowStockModal(false)}
        title="Low Stock Items"
        size="lg"
      >
        <div className="space-y-4">
          {lowStockItems.map((item, index) => (
            <div key={index} className="p-4 bg-warning-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {item.medicineId?.name || item.name}
                  </p>
                  <p className="text-sm text-secondary-600">
                    Batch: {item.batchNumber || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-warning-700 font-medium">
                    {item.stock} units left
                  </p>
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setShowLowStockModal(false);
                      setSelectedItem(item);
                      setFormData({
                        medicineId: item.medicineId,
                        name: item.medicineId?.name || item.name,
                        stock: item.stock,
                        price: item.price,
                        batchNumber: item.batchNumber,
                        expiryDate: item.expiryDate
                          ? item.expiryDate.split("T")[0]
                          : "",
                        discount: item.discount || 0,
                      });
                      setShowEditModal(true);
                    }}
                  >
                    Restock Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
