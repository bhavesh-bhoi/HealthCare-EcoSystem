import crypto from "crypto";

// Generate random string
export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

// Generate order ID
export const generateOrderId = () => {
  return (
    "ORD" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  );
};

// Generate appointment ID
export const generateAppointmentId = () => {
  return (
    "APT" + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase()
  );
};

// Format date
export const formatDate = (date, format = "YYYY-MM-DD") => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate phone number
export const isValidPhone = (phone) => {
  const phoneRegex =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

// Validate pincode
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Mask sensitive data
export const maskData = (data, type) => {
  if (!data) return data;

  switch (type) {
    case "email":
      const [local, domain] = data.split("@");
      return local.substring(0, 2) + "***@" + domain;

    case "phone":
      return data.substring(0, 2) + "****" + data.substring(data.length - 4);

    case "aadhaar":
      return "XXXX-XXXX-" + data.substring(data.length - 4);

    case "pan":
      return data.substring(0, 2) + "XXXX" + data.substring(data.length - 2);

    default:
      return data;
  }
};

// Paginate results
export const paginateResults = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    limit: parseInt(limit),
    page: parseInt(page),
  };
};

// Build filter query
export const buildFilterQuery = (filters, allowedFields) => {
  const query = {};

  Object.keys(filters).forEach((key) => {
    if (allowedFields.includes(key) && filters[key]) {
      if (typeof filters[key] === "string") {
        query[key] = { $regex: filters[key], $options: "i" };
      } else {
        query[key] = filters[key];
      }
    }
  });

  return query;
};

// Sort results
export const buildSortQuery = (sortBy, sortOrder = "desc") => {
  const order = sortOrder === "desc" ? -1 : 1;
  return { [sortBy]: order };
};

// Group by time period
export const groupByTimePeriod = (data, dateField, period) => {
  const grouped = {};

  data.forEach((item) => {
    const date = new Date(item[dateField]);
    let key;

    switch (period) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        key = date.getFullYear().toString();
        break;
      default:
        key = date.toISOString().split("T")[0];
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return grouped;
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

// Format currency
export const formatCurrency = (amount, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

// Parse CSV
export const parseCSV = (csvString) => {
  const lines = csvString.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    return obj;
  });
};

// Generate OTP
export const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, "0");
};

// Check if date is within range
export const isDateInRange = (date, startDate, endDate) => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
};

// Merge objects deeply
export const deepMerge = (target, source) => {
  const output = { ...target };

  Object.keys(source).forEach((key) => {
    if (isObject(source[key]) && isObject(target[key])) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });

  return output;
};

const isObject = (obj) => {
  return obj && typeof obj === "object" && !Array.isArray(obj);
};
