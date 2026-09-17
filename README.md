# Hotel Room Booking — Coding Test

A single-page room booking screen: pick check-in/check-out dates, select a
room, and see the number of nights and total price. Built for the Raintech
Software developer skills assessment.

## Stack

Plain HTML, CSS, and vanilla JavaScript — no build step, no framework, no
dependencies. `logic.js` holds the date/price calculations as pure functions
with no DOM access, so they're easy to read and unit-test; `app.js` handles
rendering and events.

## How to run

No build step needed. Either:

- Open `index.html` directly in a browser, or
- Serve the folder locally, e.g. `python3 -m http.server`, then visit
  `http://localhost:8000`

## How to run the tests


Uses Node's built-in `assert` — no test framework or install required.

## Features

- Room list rendered from hardcoded sample data (5 rooms, 3 types)
- Check-in/check-out date pickers
- Room selection
- Nights and total price calculation once dates + a room are chosen
- Validation with clear inline messages for:
  - missing dates
  - check-in in the past
  - check-out on or before check-in

### Bonus features included

- **Booking conflict check** — a couple of existing bookings are hardcoded
  in `data.js`; a room already booked for an overlapping date range is
  shown as unavailable and can't be selected.
- **Guest filter** — filter the room list by minimum guest capacity.
- **Unit tests** — `test.js` covers night/price calculation, date
  validation edge cases (same-day, reversed range, past date), and the
  availability overlap check.

## What I'd improve with more time

- Move sample data and bookings into a small JSON fixture file so it's
  easier to extend without touching logic.
- Add a proper test runner (Vitest/Jest) instead of a hand-rolled one, and
  wire it into CI.
- Add keyboard-navigable room selection (arrow keys) rather than relying
  solely on the button.
- Persist the selected room/dates in the URL so a booking summary is
  shareable/linkable.