// Pure logic — no DOM access here, so this file can be unit-tested directly

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Parses a "YYYY-MM-DD" string (the native format of <input type="date">)
 * surprises that shift the date by a day depending on timezone.
 */
function parseDateOnly(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  // JS auto-rolls invalid dates (e.g. Feb 30 -> Mar 2), so confirm the
  // constructed date actually matches what was typed before trusting it.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function getTodayDateOnly() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Whole nights between two local, midnight-aligned Date objects. */
function calculateNights(checkIn, checkOut) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY);
}

function calculateTotalPrice(nights, pricePerNight) {
  return nights * pricePerNight;
}

/** Locale-aware INR formatting, e.g. formatCurrency(10500) -> "₹10,500". */
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validates a check-in/check-out pair (as date-input strings).
 * Returns { valid: true, nights } or { valid: false, message }.
 */
function validateBookingDates(checkInStr, checkOutStr) {
  const checkIn = parseDateOnly(checkInStr);
  const checkOut = parseDateOnly(checkOutStr);
  const today = getTodayDateOnly();

  if (!checkIn || !checkOut) {
    return { valid: false, message: "Please select both check-in and check-out dates." };
  }
  if (checkIn < today) {
    return { valid: false, message: "Check-in date cannot be in the past." };
  }
  if (checkOut <= checkIn) {
    return { valid: false, message: "Check-out date must be after check-in date." };
  }

  return { valid: true, nights: calculateNights(checkIn, checkOut) };
}


function isRoomAvailableForDates(room, checkInStr, checkOutStr, existingBookings) {
  const checkIn = parseDateOnly(checkInStr);
  const checkOut = parseDateOnly(checkOutStr);
  if (!checkIn || !checkOut) return true;

  return existingBookings
    .filter((b) => b.roomCode === room.code)
    .every((booking) => {
      const bookedIn = parseDateOnly(booking.checkIn);
      const bookedOut = parseDateOnly(booking.checkOut);
      const overlaps = checkIn < bookedOut && checkOut > bookedIn;
      return !overlaps;
    });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseDateOnly,
    getTodayDateOnly,
    calculateNights,
    calculateTotalPrice,
    formatCurrency,
    validateBookingDates,
    isRoomAvailableForDates,
  };
}