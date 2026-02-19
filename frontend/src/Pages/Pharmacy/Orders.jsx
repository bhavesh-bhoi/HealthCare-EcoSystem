import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaBox,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaRupeeSign,
  FaEye,
  FaCheck,
  FaExclamationTriangle,
  FaPrint,
  FaDownload,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
} from "react-icons/fa";
import { pharmacyAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const PharmacyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [deliveryPartner, setDeliveryPartner] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await pharmacyAPI.getOrders();
      console.log("Pharmacy orders:", response.data);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusUpdate) {
      toast.error("Please select a status");
      return;
    }

    try {
      await pharmacyAPI.updateOrderStatus(selectedOrder._id, {
        status: statusUpdate,
        deliveryPartner,
        estimatedDeliveryTime: estimatedTime,
      });
      toast.success(
        `Order status updated to ${statusUpdate.replace("_", " ")}`,
      );
      setShowStatusModal(false);
      setStatusUpdate("");
      setDeliveryPartner("");
      setEstimatedTime("");
      fetchOrders();
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order status");
    }
  };

  const handlePrintInvoice = (order) => {
    const invoiceWindow = window.open("", "_blank");
    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${order.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice</h1>
            <p>Order #${order.orderId}</p>
            <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="details">
            <h3>Customer Details</h3>
            <p>Name: ${order.patientId?.userId?.name}</p>
            <p>Phone: ${order.patientId?.userId?.phone}</p>
            <p>Address: ${order.deliveryAddress?.address}, ${order.deliveryAddress?.city}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                ?.map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.price * item.quantity}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            <p>Subtotal: ₹${order.subtotal}</p>
            <p>Delivery: ₹${order.deliveryCharges}</p>
            <p>Tax: ₹${order.taxAmount}</p>
            <p>Total: ₹${order.totalAmount}</p>
          </div>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.print();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="w-5 h-5 text-red-500" />;
      case "out_for_delivery":
        return <FaTruck className="w-5 h-5 text-blue-500" />;
      case "preparing":
        return <FaClock className="w-5 h-5 text-yellow-500" />;
      case "ready":
        return <FaCheck className="w-5 h-5 text-green-500" />;
      default:
        return <FaClock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "preparing":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "ready":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "pending":
        return [
          { value: "confirmed", label: "Confirm Order" },
          { value: "cancelled", label: "Cancel Order" },
        ];
      case "confirmed":
        return [
          { value: "preparing", label: "Start Preparing" },
          { value: "cancelled", label: "Cancel Order" },
        ];
      case "preparing":
        return [
          { value: "ready", label: "Mark Ready" },
          { value: "cancelled", label: "Cancel Order" },
        ];
      case "ready":
        return [
          { value: "out_for_delivery", label: "Out for Delivery" },
          { value: "cancelled", label: "Cancel Order" },
        ];
      case "out_for_delivery":
        return [{ value: "delivered", label: "Mark Delivered" }];
      default:
        return [];
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter !== "all" && order.status !== filter) return false;

    if (searchTerm) {
      const orderId = order.orderId?.toLowerCase() || "";
      const customerName = order.patientId?.userId?.name?.toLowerCase() || "";
      return (
        orderId.includes(searchTerm.toLowerCase()) ||
        customerName.includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange.start && dateRange.end) {
      const orderDate = new Date(order.createdAt);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      return orderDate >= start && orderDate <= end;
    }

    return true;
  });

  const orderStats = {
    pending: orders.filter((o) => o.status === "pending").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    outForDelivery: orders.filter((o) => o.status === "out_for_delivery")
      .length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    total: orders.length,
  };

  if (loading) {
    return <PulseLoader size="lg" color="primary" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-secondary-800">
            Manage Orders
          </h1>
          <p className="text-secondary-600">
            Process and track customer orders
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="text-center p-4">
          <p className="text-2xl font-display font-bold text-primary-600">
            {orderStats.total}
          </p>
          <p className="text-xs text-secondary-600">Total</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-display font-bold text-yellow-600">
            {orderStats.pending}
          </p>
          <p className="text-xs text-secondary-600">Pending</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-display font-bold text-blue-600">
            {orderStats.preparing}
          </p>
          <p className="text-xs text-secondary-600">Preparing</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-display font-bold text-purple-600">
            {orderStats.outForDelivery}
          </p>
          <p className="text-xs text-secondary-600">Out for Delivery</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-display font-bold text-green-600">
            {orderStats.delivered}
          </p>
          <p className="text-xs text-secondary-600">Delivered</p>
        </Card>
        <Card className="text-center p-4">
          <p className="text-2xl font-display font-bold text-red-600">
            {orderStats.cancelled}
          </p>
          <p className="text-xs text-secondary-600">Cancelled</p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
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
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange({ ...dateRange, start: e.target.value })
              }
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <span className="text-secondary-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange({ ...dateRange, end: e.target.value })
              }
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No orders found
          </h3>
          <p className="text-secondary-600">
            {searchTerm
              ? "Try adjusting your search"
              : "No orders received yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <div className="flex flex-col space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-primary-600 to-teal-600 rounded-lg">
                        <FaBox className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500">Order ID</p>
                        <p className="font-mono font-medium">{order.orderId}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center space-x-1 ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      <span>{order.status.replace("_", " ")}</span>
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {order.patientId?.userId?.name || "Customer"}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {order.patientId?.userId?.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium flex items-center">
                        <FaRupeeSign className="w-3 h-3" />
                        {order.totalAmount}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Items ({order.items?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-primary-50 text-primary-700 rounded-full text-xs"
                        >
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                      {order.items?.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address Preview */}
                  {order.deliveryAddress && (
                    <div className="flex items-start space-x-2 text-xs text-secondary-600">
                      <FaMapMarkerAlt className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="truncate">
                        {order.deliveryAddress.address},{" "}
                        {order.deliveryAddress.city}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={FaEye}
                        onClick={() => setSelectedOrder(order)}
                      >
                        Details
                      </Button>

                      {!["delivered", "cancelled"].includes(order.status) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                          }}
                        >
                          Update Status
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        icon={FaPrint}
                        onClick={() => handlePrintInvoice(order)}
                      >
                        Invoice
                      </Button>
                    </div>

                    {order.status === "ready" && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Ready for pickup
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={selectedOrder && !showStatusModal}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            {/* Order Status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-500">Order ID</p>
                <p className="font-mono font-medium">{selectedOrder.orderId}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center space-x-1 ${getStatusColor(selectedOrder.status)}`}
              >
                {getStatusIcon(selectedOrder.status)}
                <span>{selectedOrder.status.replace("_", " ")}</span>
              </span>
            </div>

            {/* Customer Details */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-3">Customer Details</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FaUser className="w-4 h-4 text-primary-500" />
                  <span>{selectedOrder.patientId?.userId?.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhone className="w-4 h-4 text-primary-500" />
                  <span>{selectedOrder.patientId?.userId?.phone}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <FaMapMarkerAlt className="w-4 h-4 text-primary-500 mt-1" />
                  <div>
                    <p>{selectedOrder.deliveryAddress?.address}</p>
                    <p className="text-sm text-secondary-600">
                      {selectedOrder.deliveryAddress?.city},{" "}
                      {selectedOrder.deliveryAddress?.state} -{" "}
                      {selectedOrder.deliveryAddress?.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="font-medium flex items-center">
                          <FaRupeeSign className="w-3 h-3" />
                          {item.price * item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-secondary-500">
                        <span>Qty: {item.quantity}</span>
                        <span>Price: ₹{item.price} each</span>
                        {item.batchNumber && (
                          <span>Batch: {item.batchNumber}</span>
                        )}
                      </div>
                      {item.expiryDate && (
                        <p className="text-xs text-orange-600 mt-1">
                          Expires:{" "}
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Subtotal</span>
                  <span className="font-medium flex items-center">
                    <FaRupeeSign className="w-3 h-3" />
                    {selectedOrder.subtotal}
                  </span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>- ₹{selectedOrder.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Delivery Charges</span>
                  <span className="font-medium flex items-center">
                    <FaRupeeSign className="w-3 h-3" />
                    {selectedOrder.deliveryCharges}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Tax</span>
                  <span className="font-medium flex items-center">
                    <FaRupeeSign className="w-3 h-3" />
                    {selectedOrder.taxAmount}
                  </span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t">
                  <span>Total</span>
                  <span className="text-lg text-primary-600 flex items-center">
                    <FaRupeeSign className="w-4 h-4" />
                    {selectedOrder.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Payment Information</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600">Method:</span>
                  <span className="font-medium capitalize">
                    {selectedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600">Status:</span>
                  <span
                    className={`font-medium ${
                      selectedOrder.paymentStatus === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                {selectedOrder.paymentDetails?.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-secondary-600">Transaction ID:</span>
                    <span className="font-mono text-xs">
                      {selectedOrder.paymentDetails.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking History */}
            {selectedOrder.trackingHistory?.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Tracking History</h3>
                <div className="space-y-3">
                  {selectedOrder.trackingHistory.map((track, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary-500" />
                      <div>
                        <p className="font-medium capitalize">
                          {track.status.replace("_", " ")}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {new Date(track.timestamp).toLocaleString()}
                        </p>
                        {track.note && (
                          <p className="text-sm text-secondary-600 mt-1">
                            {track.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setStatusUpdate("");
          setDeliveryPartner("");
          setEstimatedTime("");
        }}
        title="Update Order Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              New Status
            </label>
            <select
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
              className="input-field"
            >
              <option value="">Select status</option>
              {selectedOrder &&
                getNextStatusOptions(selectedOrder.status).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>

          {statusUpdate === "out_for_delivery" && (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Delivery Partner
                </label>
                <input
                  type="text"
                  value={deliveryPartner}
                  onChange={(e) => setDeliveryPartner(e.target.value)}
                  placeholder="Enter delivery partner name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Estimated Delivery Time
                </label>
                <input
                  type="datetime-local"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="input-field"
                />
              </div>
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowStatusModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpdateStatus}
              disabled={!statusUpdate}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PharmacyOrders;
