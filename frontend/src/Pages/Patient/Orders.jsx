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
  FaStar,
  FaFilter,
  FaSearch,
} from "react-icons/fa";
import { patientAPI } from "../../services/api.js";
import Card from "../../Components/Common/Card.jsx";
import Button from "../../Components/Common/Button.jsx";
import Modal from "../../Components/Common/Modal.jsx";
import PulseLoader from "../../Components/Animations/PulseLoader.jsx";
import toast from "react-hot-toast";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await patientAPI.getOrders();
      console.log("Orders:", response.data);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (order) => {
    try {
      await patientAPI.createOrder({
        prescriptionId: order.prescriptionId,
        pharmacyId: order.pharmacyId,
        items: order.items,
        deliveryAddress: order.deliveryAddress,
      });
      toast.success("Order placed successfully!");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  const handleTrackOrder = (orderId) => {
    // Implement tracking logic
    toast.success("Tracking feature coming soon");
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      // API call to submit rating
      toast.success("Thank you for your feedback!");
      setShowRatingModal(false);
      setRating(0);
      setReview("");
    } catch (error) {
      toast.error("Failed to submit rating");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="w-5 h-5 text-red-500" />;
      case "out_for_delivery":
        return <FaTruck className="w-5 h-5 text-blue-500" />;
      default:
        return <FaClock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "out_for_delivery":
        return "bg-blue-100 text-blue-700";
      case "preparing":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter !== "all" && order.status !== filter) return false;
    if (searchTerm) {
      const pharmacyName = order.pharmacyId?.userId?.name?.toLowerCase() || "";
      const orderId = order.orderId?.toLowerCase() || "";
      return (
        pharmacyName.includes(searchTerm.toLowerCase()) ||
        orderId.includes(searchTerm.toLowerCase())
      );
    }
    return true;
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
            My Orders
          </h1>
          <p className="text-secondary-600">
            Track and manage your medicine orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by pharmacy or order ID..."
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
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <FaBox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-800 mb-2">
            No orders found
          </h3>
          <p className="text-secondary-600 mb-4">
            {searchTerm
              ? "Try adjusting your search"
              : "You haven't placed any orders yet"}
          </p>
          <Button to="/patient/prescriptions">Order from Prescriptions</Button>
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

                  {/* Pharmacy Info */}
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {order.pharmacyId?.userId?.name || "Pharmacy"}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {order.pharmacyId?.location?.address ||
                          "Address not available"}
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

                  {/* Amount & Date */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-secondary-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-medium flex items-center">
                        <FaRupeeSign className="w-3 h-3" />
                        {order.totalAmount}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={FaEye}
                        onClick={() => setSelectedOrder(order)}
                      />
                      {order.status === "out_for_delivery" && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={FaTruck}
                          onClick={() => handleTrackOrder(order._id)}
                        >
                          Track
                        </Button>
                      )}
                      {order.status === "delivered" && !order.rating && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={FaStar}
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRatingModal(true);
                          }}
                        >
                          Rate
                        </Button>
                      )}
                      {order.status === "delivered" && (
                        <Button size="sm" onClick={() => handleReorder(order)}>
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        isOpen={selectedOrder && !showRatingModal}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
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

            {/* Pharmacy Info */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Pharmacy</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <FaUser className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {selectedOrder.pharmacyId?.userId?.name}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {selectedOrder.pharmacyId?.location?.address}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {selectedOrder.pharmacyId?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-medium mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-secondary-500">
                        Quantity: {item.quantity}
                      </p>
                      {item.batchNumber && (
                        <p className="text-xs text-secondary-400">
                          Batch: {item.batchNumber}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium flex items-center">
                        <FaRupeeSign className="w-3 h-3" />
                        {item.price * item.quantity}
                      </p>
                      <p className="text-xs text-secondary-500">
                        ₹{item.price} each
                      </p>
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

            {/* Delivery Address */}
            <div>
              <h3 className="font-medium mb-2 flex items-center space-x-2">
                <FaMapMarkerAlt className="text-primary-500" />
                <span>Delivery Address</span>
              </h3>
              <p className="text-secondary-700">
                {selectedOrder.deliveryAddress?.address}
              </p>
              <p className="text-sm text-secondary-600">
                {selectedOrder.deliveryAddress?.city},{" "}
                {selectedOrder.deliveryAddress?.state} -{" "}
                {selectedOrder.deliveryAddress?.pincode}
              </p>
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

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setRating(0);
          setReview("");
        }}
        title="Rate Your Order"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-secondary-600 mb-4">
              How would you rate your experience with{" "}
              {selectedOrder?.pharmacyId?.userId?.name}?
            </p>

            {/* Star Rating */}
            <div className="flex justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`w-8 h-8 transition-all ${
                      star <= rating
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Review */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review (optional)"
              rows="4"
              className="input-field"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowRatingModal(false);
                setRating(0);
                setReview("");
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmitRating}>
              Submit Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Orders;
