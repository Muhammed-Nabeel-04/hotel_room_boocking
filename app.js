// DOM wiring only — all calculation/validation logic lives in logic.js.

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
    // Errors get announced immediately by screen readers; routine info doesn't interrupt.
    messageEl.setAttribute("role", kind === "error" ? "alert" : "status");
  }

  function renderRooms() {
    const checkInVal = checkInEl.value;
    const checkOutVal = checkOutEl.value;
    const minGuests = guestFilterEl.value === "any" ? 0 : Number(guestFilterEl.value);

    const rooms = ROOMS.filter((room) => room.maxGuests >= minGuests);

    // If the guest filter just hid the currently-selected room, drop the
    // selection rather than leaving an invisible room "selected" behind the scenes.
    if (selectedRoomCode && !rooms.some((r) => r.code === selectedRoomCode)) {
      selectedRoomCode = null;
    }

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
          <p>${formatCurrency(room.pricePerNight)} / night &middot; Max ${room.maxGuests} guests</p>
          ${!isAvailable ? '<p class="unavailable-tag">Already booked for these dates</p>' : ""}
        </div>
        <button type="button" aria-pressed="${isSelected}" ${!isAvailable ? "disabled" : ""}>${isSelected ? "Selected" : "Select"}</button>
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
      <p>${validation.nights} night${validation.nights === 1 ? "" : "s"} &times; ${formatCurrency(room.pricePerNight)}</p>
      <p class="total">Total: ${formatCurrency(total)}</p>
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