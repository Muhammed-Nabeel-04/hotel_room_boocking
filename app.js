// all calculation/validation logic are in logic.js.

document.addEventListener("DOMContentLoaded", () => {
  const checkInEl = document.getElementById("check-in");
  const checkOutEl = document.getElementById("check-out");
  const guestFilterEl = document.getElementById("guest-filter");
  const roomListEl = document.getElementById("room-list");
  const messageEl = document.getElementById("message");
  const summaryEl = document.getElementById("summary");

  let selectedRoomCode = null;

  function toDateInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Stop the native picker offering past check-in dates at all.
  checkInEl.min = toDateInputValue(getTodayDateOnly());

  function setMessage(text, kind) {
    messageEl.textContent = text || "";
    messageEl.className = "message" + (kind ? ` ${kind}` : "");
  }

  function renderRooms() {
    const checkInVal = checkInEl.value;
    const checkOutVal = checkOutEl.value;
    const minGuests = guestFilterEl.value === "any" ? 0 : Number(guestFilterEl.value);

    const rooms = ROOMS.filter((room) => room.maxGuests >= minGuests);
    roomListEl.innerHTML = "";

    if (rooms.length === 0) {
      roomListEl.innerHTML = '<p class="empty">No rooms match that guest count.</p>';
      return;
    }

    rooms.forEach((room) => {
      const hasDates = Boolean(checkInVal && checkOutVal);
      const isAvailable = !hasDates || isRoomAvailableForDates(room, checkInVal, checkOutVal, EXISTING_BOOKINGS);
      const isSelected = room.code === selectedRoomCode;

      const card = document.createElement("article");
      card.className = "room-card" + (isSelected ? " selected" : "") + (!isAvailable ? " unavailable" : "");

      card.innerHTML = `
        <div class="room-info">
          <h3>${room.type} <span class="room-code">${room.code}</span></h3>
          <p>&#8377;${room.pricePerNight.toLocaleString("en-IN")} / night &middot; Max ${room.maxGuests} guests</p>
          ${!isAvailable ? '<p class="unavailable-tag">Already booked for these dates</p>' : ""}
        </div>
        <button type="button" ${!isAvailable ? "disabled" : ""}>${isSelected ? "Selected" : "Select"}</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        selectedRoomCode = room.code;
        renderRooms();
        updateSummary();
      });

      roomListEl.appendChild(card);
    });
  }

  function updateSummary() {
    summaryEl.innerHTML = "";
    setMessage("");

    const checkInVal = checkInEl.value;
    const checkOutVal = checkOutEl.value;
    if (!checkInVal || !checkOutVal) {
      return; // Nothing to validate yet — stay quiet until both dates are picked.
    }

    const validation = validateBookingDates(checkInVal, checkOutVal);
    if (!validation.valid) {
      setMessage(validation.message, "error");
      return;
    }

    if (!selectedRoomCode) {
      setMessage("Select a room below to see the total price.", "info");
      return;
    }

    const room = ROOMS.find((r) => r.code === selectedRoomCode);
    if (!isRoomAvailableForDates(room, checkInVal, checkOutVal, EXISTING_BOOKINGS)) {
      setMessage(`${room.code} is already booked for part of these dates. Pick different dates or another room.`, "error");
      return;
    }

    const total = calculateTotalPrice(validation.nights, room.pricePerNight);
    summaryEl.innerHTML = `
      <p class="summary-room">${room.type} <span class="room-code">${room.code}</span></p>
      <p>${validation.nights} night${validation.nights === 1 ? "" : "s"} &times; &#8377;${room.pricePerNight.toLocaleString("en-IN")}</p>
      <p class="total">Total: &#8377;${total.toLocaleString("en-IN")}</p>
    `;
  }

  checkInEl.addEventListener("change", () => {
    // Keep check-out from being pickable before (or on) check-in.
    if (checkInEl.value) {
      const nextDay = parseDateOnly(checkInEl.value);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOutEl.min = toDateInputValue(nextDay);
    }
    renderRooms();
    updateSummary();
  });

  checkOutEl.addEventListener("change", () => {
    renderRooms();
    updateSummary();
  });

  guestFilterEl.addEventListener("change", () => {
    renderRooms();
    updateSummary();
  });

  renderRooms();
  updateSummary();
});