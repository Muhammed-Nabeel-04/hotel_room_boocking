// Hardcoded sample data — no backend/API needed per the brief.

const ROOMS = [
  { code: "R101", type: "Deluxe Room", pricePerNight: 3500, maxGuests: 2 },
  { code: "R102", type: "Deluxe Room", pricePerNight: 3500, maxGuests: 2 },
  { code: "R201", type: "Executive Suite", pricePerNight: 5800, maxGuests: 3 },
  { code: "R202", type: "Executive Suite", pricePerNight: 5800, maxGuests: 3 },
  { code: "R301", type: "Family Room", pricePerNight: 4200, maxGuests: 4 },
];


// free to adjust so they land in your own "near future" while testing.
const EXISTING_BOOKINGS = [
  { roomCode: "R101", checkIn: "2026-09-20", checkOut: "2026-09-23" },
  { roomCode: "R201", checkIn: "2026-09-25", checkOut: "2026-09-27" },
];

// Support both browser <script> loading and Node's require() (used by tests).
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ROOMS, EXISTING_BOOKINGS };
}