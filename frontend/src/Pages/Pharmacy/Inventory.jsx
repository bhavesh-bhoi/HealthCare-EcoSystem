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
  FaFilter,
  FaSort,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { pharmacyAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";

const PharmacyInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [formData, setFormData] = useState({
    medicineId: "",
    name: "",
    stock: "",
    price: "",
    batchNumber: "",
    expiryDate: "",
    discount: 0,
    manufacturer: "",
    category: "",
  });

  const categories = [
    "Pain Relief",
    "Antibiotic",
    "Antihistamine",
    "Antidiabetic",
    "Cardiovascular",
    "Gastric",
    "Respiratory",
    "Dermatological",
    "Vitamin",
    "Other",
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await pharmacyAPI.getInventory();
      console.log("Inventory:", response.data);
      setInventory(response.data.data?.inventory || []);
    } catch (error) {
      console.error("Failed to load inventory:", error);
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!formData.name || !formData.stock || !formData.price) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const updatedInventory = [
        ...inventory,
        { ...formData, _id: Date.now().toString() },
      ];
      await pharmacyAPI.updateInventory({ inventory: updatedInventory });
      toast.success("Item added successfully");
      setShowAddModal(false);
      resetForm();
      fetchInventory();
    } catch (error) {
      console.error("Failed to add item:", error);
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
      console.error("Failed to update item:", error);
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
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleBulkImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv,.json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          await pharmacyAPI.updateInventory({ inventory: data });
          toast.success("Inventory imported successfully");
          fetchInventory();
        } catch (error) {
          toast.error("Failed to import inventory");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = () => {
    const data = JSON.stringify(inventory, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success("Inventory exported successfully");
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
      manufacturer: "",
      category: "",
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-700",
        icon: FaTimesCircle,
      };
    if (stock < 10)
      return {
        label: "Low Stock",
        color: "bg-orange-100 text-orange-700",
        icon: FaExclamationTriangle,
      };
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-700",
      icon: FaCheckCircle,
    };
  };

  const filteredInventory = inventory
    .filter((item) => {
      const medicineName = item.name?.toLowerCase() || "";
      const batchNumber = item.batchNumber?.toLowerCase() || "";
      const manufacturer = item.manufacturer?.toLowerCase() || "";
      const matchesSearch =
        medicineName.includes(searchTerm.toLowerCase()) ||
        batchNumber.includes(searchTerm.toLowerCase()) ||
        manufacturer.includes(searchTerm.toLowerCase());

      if (filter === "all") return matchesSearch;
      if (filter === "lowStock") {
        const status = getStockStatus(item.stock);
        return status.label === "Low Stock" && matchesSearch;
      }
      if (filter === "outOfStock") {
        const status = getStockStatus(item.stock);
        return status.label === "Out of Stock" && matchesSearch;
      }
      if (filter === "expiring") {
        if (!item.expiryDate) return false;
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
        );
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0 && matchesSearch;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "price" || sortBy === "stock") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const lowStockItems = inventory.filter((i) => {
    const status = getStockStatus(i.stock);
    return status.label === "Low Stock";
  });

  const outOfStockItems = inventory.filter((i) => {
    const status = getStockStatus(i.stock);
    return status.label === "Out of Stock";
  });

  const expiringItems = inventory.filter((i) => {
    if (!i.expiryDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(i.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
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
      {(lowStockItems.length > 0 ||
        outOfStockItems.length > 0 ||
        expiringItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="bg-orange-50 border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FaExclamationTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">
                    {lowStockItems.length} Low Stock Items
                  </p>
                  <p className="text-sm text-orange-600">
                    Need to reorder soon
                  </p>
                </div>
              </div>
            </Card>
          )}

          {outOfStockItems.length > 0 && (
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <FaTimesCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-800">
                    {outOfStockItems.length} Out of Stock
                  </p>
                  <p className="text-sm text-red-600">
                    Immediate attention required
                  </p>
                </div>
              </div>
            </Card>
          )}

          {expiringItems.length > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaClock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-yellow-800">
                    {expiringItems.length} Expiring Soon
                  </p>
                  <p className="text-sm text-yellow-600">Within 30 days</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by medicine name, batch number, or manufacturer..."
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
            <option value="all">All Items</option>
            <option value="lowStock">Low Stock</option>
            <option value="outOfStock">Out of Stock</option>
            <option value="expiring">Expiring Soon</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200"
          >
            <option value="name">Sort by Name</option>
            <option value="stock">Sort by Stock</option>
            <option value="price">Sort by Price</option>
            <option value="expiryDate">Sort by Expiry</option>
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
          <FaPills className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-secondary-800">
            {inventory.reduce((sum, item) => sum + (item.stock || 0), 0)}
          </p>
          <p className="text-sm text-secondary-600">Total Units</p>
        </Card>

        <Card className="text-center">
          <FaRupeeSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-display font-bold text-secondary-800">
            ₹
            {inventory
              .reduce(
                (sum, item) => sum + (item.price || 0) * (item.stock || 0),
                0,
              )
              .toLocaleString()}
          </p>
          <p className="text-sm text-secondary-600">Inventory Value</p>
        </Card>

        <Card className="text-center">
          <FaExclamationTriangle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
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
                  Category
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
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-secondary-800">
                          {item.name}
                        </p>
                        {item.manufacturer && (
                          <p className="text-xs text-secondary-500">
                            {item.manufacturer}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-secondary-600">
                      {item.batchNumber || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${
                          item.stock < 10
                            ? "text-orange-600"
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
                      {item.discount > 0 && (
                        <span className="text-xs text-green-600">
                          {item.discount}% off
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {item.expiryDate ? (
                        <div>
                          <span className="text-sm">
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </span>
                          {daysUntilExpiry && daysUntilExpiry <= 30 && (
                            <p className="text-xs text-orange-600">
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
                        className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${stockStatus.color}`}
                      >
                        <stockStatus.icon className="w-3 h-3" />
                        <span>{stockStatus.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setFormData({
                              medicineId: item.medicineId,
                              name: item.name,
                              stock: item.stock,
                              price: item.price,
                              batchNumber: item.batchNumber,
                              expiryDate: item.expiryDate
                                ? item.expiryDate.split("T")[0]
                                : "",
                              discount: item.discount || 0,
                              manufacturer: item.manufacturer || "",
                              category: item.category || "",
                            });
                            setShowDetailsModal(true);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setFormData({
                              medicineId: item.medicineId,
                              name: item.name,
                              stock: item.stock,
                              price: item.price,
                              batchNumber: item.batchNumber,
                              expiryDate: item.expiryDate
                                ? item.expiryDate.split("T")[0]
                                : "",
                              discount: item.discount || 0,
                              manufacturer: item.manufacturer || "",
                              category: item.category || "",
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
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
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="input-field"
                placeholder="Enter manufacturer"
              />
            </div>
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
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                className="input-field"
                placeholder="Enter manufacturer"
              />
            </div>
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
              className="flex-1"
              onClick={handleUpdateItem}
              disabled={!formData.name || !formData.stock || !formData.price}
            >
              Update Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Item Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedItem(null);
        }}
        title="Item Details"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-600 to-teal-600 flex items-center justify-center mx-auto mb-3">
                <FaPills className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-display font-semibold">
                {selectedItem.name}
              </h3>
              <p className="text-primary-600">
                {selectedItem.category || "General"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Stock</p>
                <p className="font-medium text-lg">
                  {selectedItem.stock} units
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Price</p>
                <p className="font-medium text-lg flex items-center">
                  <FaRupeeSign className="w-4 h-4" />
                  {selectedItem.price}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Batch Number</p>
                <p className="font-medium">
                  {selectedItem.batchNumber || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Manufacturer</p>
                <p className="font-medium">
                  {selectedItem.manufacturer || "N/A"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Expiry Date</p>
                <p className="font-medium">
                  {selectedItem.expiryDate
                    ? new Date(selectedItem.expiryDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500">Discount</p>
                <p className="font-medium text-green-600">
                  {selectedItem.discount || 0}%
                </p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-secondary-500 mb-1">Status</p>
              {(() => {
                const status = getStockStatus(selectedItem.stock);
                return (
                  <span
                    className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${status.color}`}
                  >
                    <status.icon className="w-4 h-4" />
                    <span>{status.label}</span>
                  </span>
                );
              })()}
            </div>

            {selectedItem.expiryDate && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-secondary-500 mb-1">
                  Days Until Expiry
                </p>
                <p
                  className={`font-medium ${
                    Math.ceil(
                      (new Date(selectedItem.expiryDate) - new Date()) /
                        (1000 * 60 * 60 * 24),
                    ) <= 30
                      ? "text-orange-600"
                      : "text-green-600"
                  }`}
                >
                  {Math.ceil(
                    (new Date(selectedItem.expiryDate) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PharmacyInventory;
