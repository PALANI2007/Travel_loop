/**
 * Traveloop Production-Grade Safety System
 * Prevents all common runtime crashes and provides graceful fallbacks.
 */

/**
 * Safely handles arrays to prevent errors on undefined/null
 */
export const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

/**
 * Safely converts any value to a number
 */
export const safeNumber = (value, fallback = 0) => {
  if (value === undefined || value === null) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

/**
 * Safely handles strings
 */
export const safeString = (value, fallback = "") => {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return fallback;
  return String(value);
};

/**
 * Safely formats currency without crashing
 */
export const safeCurrency = (value, currency = "INR") => {
  const num = safeNumber(value);
  try {
    return num.toLocaleString("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    });
  } catch {
    return currency === "INR" ? `₹${num}` : `$${num}`;
  }
};

/**
 * Safely handles dates to prevent toLocaleDateString crashes
 */
export const safeDate = (dateValue, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  try {
    if (!dateValue) return "Dates TBD";
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "Invalid Date";
    return d.toLocaleDateString('en-IN', options);
  } catch {
    return "Dates TBD";
  }
};

/**
 * Safely parses JSON with try/catch
 */
export const safeParseJSON = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.error("Safe JSON Parse Error:", err);
    return fallback;
  }
};

/**
 * Safely access properties or provide default trip object
 */
export const sanitizeTripData = (trip) => {
  const t = trip || {};
  return {
    id: t.id || "temp-id",
    name: safeString(t.name || t.title, "Untitled Trip"),
    destination: safeString(t.destination, "Unknown Destination"),
    budget: safeString(t.budget, "Moderate"),
    totalBudget: safeNumber(t.totalBudget || t.budget_limit),
    memberCount: safeNumber(t.memberCount || t.members, 1),
    status: safeString(t.status, "upcoming"),
    startDate: t.startDate || "",
    endDate: t.endDate || "",
    coverImage: safeString(t.coverImage, "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"),
    description: safeString(t.description, "Embarking on a journey to discover new horizons.")
  };
};
