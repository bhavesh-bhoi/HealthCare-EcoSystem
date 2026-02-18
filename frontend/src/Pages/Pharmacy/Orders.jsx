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
} from "react-icons/fa";
import { pharmacyAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";
import { formatDate, formatCurrency } from "../../Utils/helpers.js";

const PharmacyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [deliveryPartner, setDeliveryPartner] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await pharmacyAPI.getOrders();
      setOrders(response.data.data);
    } catch (error) {
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
      toast.success(`Order status updated to ${statusUpdate}`);
      setShowStatusModal(false);
      setStatusUpdate("");
      setDeliveryPartner("");
      setEstimatedTime("");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="w-5 h-5 text-success-500" />;
      case "cancelled":
        return <FaTimesCircle className="w-5 h-5 text-error-500" />;
      case "out_for_delivery":
        return <FaTruck className="w-5 h-5 text-primary-500" />;
      case "preparing":
        return <FaClock className="w-5 h-5 text-warning-500" />;
      case "ready":
        return <FaCheck className="w-5 h-5 text-success-500" />;
      default:
        return <FaClock className="w-5 h-5 text-warning-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-success-100 text-success-700 border-success-200";
      case "cancelled":
        return "bg-error-100 text-error-700 border-error-200";
      case "out_for_delivery":
        return "bg-primary-100 text-primary-700 border-primary-200";
      case "preparing":
        return "bg-warning-100 text-warning-700 border-warning-200";
      case "ready":
        return "bg-success-100 text-success-700 border-success-200";
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
    if (filter === "all") return true;
    return order.status === filter;
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
            Manage Orders
          </h1>
          <p className="text-secondary-600">
            Process and track customer orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          "all",
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
              filter === status
                ? "gradient-bg text-white shadow-medium"
                : "bg-gray-100 text-secondary-600 hover:bg-gray-200"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No orders found
          </h3>
          <p className="text-secondary-600">
            {filter === "all"
              ? "No orders received yet"
              : `No ${filter} orders`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <div className="flex flex-col space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 gradient-bg rounded-lg">
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
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {order.patientId?.userId?.name}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {order.patientId?.userId?.phone}
                      </p>
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Items ({order.items.length})
                    </p>
                    <div className="space-y-2">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span className="font-medium flex items-center">
                            <FaRupeeSign className="w-3 h-3" />
                            {item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-xs text-secondary-500">
                          +{order.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Total & Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-sm text-secondary-500">Total Amount</p>
                      <p className="text-lg font-display font-bold text-primary-600 flex items-center">
                        <FaRupeeSign className="w-4 h-4" />
                        {order.totalAmount}
                      </p>
                    </div>

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

                      {order.status === "ready" && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={FaTruck}
                          onClick={() => {
                            setSelectedOrder(order);
                            setStatusUpdate("out_for_delivery");
                            setShowStatusModal(true);
                          }}
                        >
                          Dispatch
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  {order.estimatedDeliveryTime && (
                    <div className="flex items-center space-x-2 text-xs text-primary-600 bg-primary-50 p-2 rounded-lg">
                      <FaClock />
                      <span>
                        Est. delivery: {formatDate(order.estimatedDeliveryTime)}
                      </span>
                    </div>
                  )}

                  {/* Urgent Orders */}
                  {order.status === "pending" && (
                    <div className="flex items-center space-x-2 text-xs text-warning-600 bg-warning-50 p-2 rounded-lg">
                      <FaExclamationTriangle />
                      <span>Pending for over 30 minutes</span>
                    </div>
                  )}
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
            <div className="p-4 bg-gray-50 rounded-xl">
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
                    <p>{selectedOrder.deliveryAddress.address}</p>
                    <p className="text-sm text-secondary-600">
                      {selectedOrder.deliveryAddress.city},{" "}
                      {selectedOrder.deliveryAddress.state} -{" "}
                      {selectedOrder.deliveryAddress.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
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
                        <p className="text-xs text-warning-600 mt-1">
                          Expires: {formatDate(item.expiryDate)}
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
                  <div className="flex justify-between text-sm text-success-600">
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
            <div className="p-4 bg-gray-50 rounded-xl">
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
                        ? "text-success-600"
                        : "text-warning-600"
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

            {/* Prescription Link */}
            {selectedOrder.prescriptionId && (
              <div className="p-4 bg-primary-50 rounded-xl">
                <p className="font-medium mb-2">Prescription Attached</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `/prescriptions/${selectedOrder.prescriptionId}`,
                      "_blank",
                    )
                  }
                >
                  View Prescription
                </Button>
              </div>
            )}

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
                          {formatDate(track.timestamp)}
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

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                icon={FaPrint}
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={FaDownload}
                onClick={() => {
                  /* Download invoice */
                }}
              >
                Invoice
              </Button>
            </div>
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
              variant="primary"
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
