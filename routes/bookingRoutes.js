import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

// Register event
router.post("/register", async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    // check if already booked
    const existing = await Booking.findOne({ userId, eventId });

    if (existing) {
      return res.json({ message: "Already registered" });
    }

    const booking = new Booking({ userId, eventId });
    await booking.save();

    res.json({ message: "Registered successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error registering" });
  }
});

// check booking
router.get("/check/:userId/:eventId", async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const existing = await Booking.findOne({ userId, eventId });

    res.json({ registered: !!existing });

  } catch {
    res.status(500).json({ message: "Error" });
  }
});

// ✅ get all bookings for a user (VERY IMPORTANT)
router.get("/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

export default router;