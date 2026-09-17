
const assert = require("assert");
const {
  calculateNights,
  calculateTotalPrice,
  validateBookingDates,
  isRoomAvailableForDates,
} = require("./logic");

let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ok  - ${name}`);
  } catch (err) {
    failed++;
    console.log(`FAIL  - ${name}`);
    console.log(`        ${err.message}`);
  }
}

function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

function daysFromToday(n) {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return toDateInputValue(d);
}

console.log("Night & price calculation");
test("counts whole nights between two dates", () => {
  assert.strictEqual(calculateNights(new Date(2026, 8, 20), new Date(2026, 8, 23)), 3);
});
test("multiplies nights by the nightly rate", () => {
  assert.strictEqual(calculateTotalPrice(3, 3500), 10500);
});

console.log("\nDate validation");
test("rejects a same-day range (0 nights)", () => {
  const result = validateBookingDates(daysFromToday(2), daysFromToday(2));
  assert.strictEqual(result.valid, false);
});
test("rejects check-out before check-in", () => {
  const result = validateBookingDates(daysFromToday(5), daysFromToday(2));
  assert.strictEqual(result.valid, false);
});
test("rejects a check-in date in the past", () => {
  const result = validateBookingDates("2020-01-01", "2020-01-05");
  assert.strictEqual(result.valid, false);
});
test("accepts a valid future range and returns correct nights", () => {
  const result = validateBookingDates(daysFromToday(10), daysFromToday(13));
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.nights, 3);
});
test("accepts today as a valid check-in date", () => {
  const result = validateBookingDates(daysFromToday(0), daysFromToday(1));
  assert.strictEqual(result.valid, true);
});

console.log("\nAvailability check (bonus)");
test("flags an overlapping date range as unavailable", () => {
  const room = { code: "R101" };
  const bookings = [{ roomCode: "R101", checkIn: "2026-09-20", checkOut: "2026-09-23" }];
  assert.strictEqual(isRoomAvailableForDates(room, "2026-09-21", "2026-09-22", bookings), false);
});
test("allows a back-to-back booking starting the day an old one ends", () => {
  const room = { code: "R101" };
  const bookings = [{ roomCode: "R101", checkIn: "2026-09-20", checkOut: "2026-09-23" }];
  assert.strictEqual(isRoomAvailableForDates(room, "2026-09-23", "2026-09-25", bookings), true);
});
test("ignores bookings that belong to a different room", () => {
  const room = { code: "R102" };
  const bookings = [{ roomCode: "R101", checkIn: "2026-09-20", checkOut: "2026-09-23" }];
  assert.strictEqual(isRoomAvailableForDates(room, "2026-09-21", "2026-09-22", bookings), true);
});

console.log(`\n${failed === 0 ? "All tests passed." : `${failed} test(s) failed.`}`);
process.exitCode = failed === 0 ? 0 : 1;