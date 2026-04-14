require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Parking backend is running");
});

console.log("MYSQL PROJECT STARTED");

/* ---------------- SIGNUP ---------------- */

app.post("/signup", (req, res) => {
  const { name, email, password, phone } = req.body;

  const sql =
    "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, email, password, phone], (err, result) => {
    if (err) {
      console.log("Signup error:", err);
      return res.status(500).json({ message: "Database Error" });
    }

    res.json({ message: "User Registered Successfully" });
  });
});

/* ---------------- LOGIN ---------------- */

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.log("Login error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
      },
    });
  });
});

/* ---------------- ADMIN DASHBOARD ---------------- */

app.get("/admin/dashboard", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) AS totalBookings,
      SUM(CASE WHEN booking_status = 'Active' THEN 1 ELSE 0 END) AS activeBookings,
      SUM(CASE WHEN booking_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelledBookings,
      SUM(CASE WHEN booking_status = 'Expired' THEN 1 ELSE 0 END) AS expiredBookings,
      SUM(CASE WHEN payment_status = 'Success' THEN amount ELSE 0 END) AS totalRevenue,
      SUM(CASE WHEN payment_status = 'Refunded' THEN amount ELSE 0 END) AS totalRefunded
    FROM bookings
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log("Admin dashboard error:", err);
      return res.status(500).json({ message: "Error fetching dashboard data" });
    }

    res.json(results[0]);
  });
});

/* ---------------- USER BOOKING HISTORY ---------------- */

app.get("/my-bookings/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT *,
    CASE 
      WHEN booking_status = 'Cancelled' THEN 'Cancelled'
      WHEN booking_status = 'Expired' THEN 'Expired'
      WHEN expiry_time > NOW() THEN 'Active'
      ELSE 'Expired'
    END AS status
    FROM bookings
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.log("Fetch bookings error:", err);
      return res.status(500).json({ message: "Error fetching bookings" });
    }

    res.json({
      totalBookings: results.length,
      bookings: results,
    });
  });
});

/* ---------------- AVAILABLE SLOTS ---------------- */

app.get("/available-slots/:location/:vehicleType", (req, res) => {
  const { location, vehicleType } = req.params;

  let allSlots = [];

  if (vehicleType === "Normal") {
    allSlots = ["N1", "N2"];
  } else if (vehicleType === "Electric") {
    allSlots = ["E1"];
  } else {
    return res.status(400).json({ message: "Invalid vehicle type" });
  }

  const sql = `
    SELECT slot FROM bookings
    WHERE location = ?
    AND vehicle_type = ?
    AND booking_status = 'Active'
    AND expiry_time > NOW()
  `;

  db.query(sql, [location, vehicleType], (err, results) => {
    if (err) {
      console.log("Available slots error:", err);
      return res.status(500).json({ message: "Error checking slots" });
    }

    const bookedSlots = results.map((r) => r.slot);
    const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    res.json({
      location,
      vehicleType,
      totalSlots: allSlots.length,
      bookedSlots,
      availableSlots,
    });
  });
});

/* ---------------- BOOK SLOT ---------------- */

app.post("/book", (req, res) => {
  console.log("BOOK REQ BODY:", req.body);

  const {
    user_id,
    location,
    slot,
    vehicle_type,
    vehicle_number,
    phone,
    hours,
    amount,
    payment_mode,
    start_time,
  } = req.body;

  if (
    !user_id ||
    !location ||
    !slot ||
    !vehicle_type ||
    !hours ||
    !amount ||
    !payment_mode
  ) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  const checkSql = `
    SELECT * FROM bookings
    WHERE location = ?
    AND slot = ?
    AND booking_status = 'Active'
    AND expiry_time > NOW()
  `;

  db.query(checkSql, [location, slot], (err, results) => {
    if (err) {
      console.log("Book slot check error:", err);
      return res.status(500).json({
        message: "Server error while checking slot",
        error: err.message,
      });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    const startDateObj = start_time ? new Date(start_time) : new Date();

    if (isNaN(startDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid start time" });
    }

    const expiryDateObj = new Date(
      startDateObj.getTime() + Number(hours) * 60 * 60 * 1000,
    );

    const formattedStartTime = startDateObj
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const formattedExpiryTime = expiryDateObj
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const insertSql = `
      INSERT INTO bookings
      (
        user_id,
        location,
        slot,
        vehicle_type,
        vehicle_number,
        phone,
        hours,
        amount,
        payment_mode,
        start_time,
        expiry_time,
        booking_status,
        payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSql,
      [
        Number(user_id),
        location,
        slot,
        vehicle_type,
        vehicle_number || "MH12AB1234",
        phone || "9999999999",
        Number(hours),
        Number(amount),
        payment_mode,
        formattedStartTime,
        formattedExpiryTime,
        "Active",
        "Success",
      ],
      (err, result) => {
        if (err) {
          console.log("Booking insert error full:", err);
          return res.status(500).json({
            message: "Booking failed",
            error: err.message,
          });
        }

        return res.json({
          message: "Booking successful",
          bookingId: result.insertId,
          start_time: formattedStartTime,
          expiry_time: formattedExpiryTime,
        });
      },
    );
  });
});

/* ---------------- CANCEL BOOKING ---------------- */

app.delete("/cancel-booking/:id", (req, res) => {
  const bookingId = req.params.id;

  const checkSql = `
    SELECT * FROM bookings
    WHERE id = ?
  `;

  db.query(checkSql, [bookingId], (err, results) => {
    if (err) {
      console.log("Cancel check error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = results[0];

    if (booking.booking_status === "Cancelled") {
      return res.json({ message: "Booking already cancelled" });
    }

    if (booking.expiry_time && new Date(booking.expiry_time) <= new Date()) {
      return res.status(400).json({
        message: "Cannot cancel expired booking",
      });
    }

    const updateSql = `
      UPDATE bookings
      SET booking_status = 'Cancelled'
      WHERE id = ?
    `;

    db.query(updateSql, [bookingId], (err, result) => {
      if (err) {
        console.log("Cancel booking error:", err);
        return res.status(500).json({ message: "Cancel failed" });
      }

      return res.json({
        message: "Booking cancelled successfully",
      });
    });
  });
});

/* ---------------- OVERSTAY CHARGE ---------------- */

app.get("/overstay-charge/:bookingId", (req, res) => {
  const bookingId = req.params.bookingId;

  const sql = `
    SELECT id, expiry_time, booking_status
    FROM bookings
    WHERE id = ?
  `;

  db.query(sql, [bookingId], (err, results) => {
    if (err) {
      console.log("Overstay charge error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = results[0];

    if (booking.booking_status === "Cancelled") {
      return res.json({
        overstayMinutes: 0,
        extraCharge: 0,
        message: "Booking already cancelled",
      });
    }

    const now = new Date();
    const expiryTime = new Date(booking.expiry_time);

    if (now <= expiryTime) {
      return res.json({
        overstayMinutes: 0,
        extraCharge: 0,
        message: "No extra charge",
      });
    }

    const diffMs = now - expiryTime;
    const overstayMinutes = Math.ceil(diffMs / (1000 * 60));
    const extraCharge = Math.ceil(overstayMinutes / 15) * 10;

    return res.json({
      overstayMinutes,
      extraCharge,
      message: "Extra charge applicable",
    });
  });
});

/* ---------------- EXPIRE BOOKINGS ---------------- */

app.put("/expire-bookings", (req, res) => {
  const sql = `
    UPDATE bookings
    SET booking_status = 'Expired'
    WHERE expiry_time <= NOW()
    AND booking_status = 'Active'
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Expire bookings error:", err);
      return res.status(500).json({ message: "Error expiring bookings" });
    }

    res.json({
      message: "Expired bookings updated",
      expiredCount: result.affectedRows,
    });
  });
});

/* ---------------- AUTO EXPIRE EVERY 1 MIN ---------------- */

setInterval(() => {
  const sql = `
    UPDATE bookings
    SET booking_status = 'Expired'
    WHERE expiry_time <= NOW()
    AND booking_status = 'Active'
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log("Auto expire error:", err);
    }
  });
}, 60000);

/* ---------------- SERVER START ---------------- */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});