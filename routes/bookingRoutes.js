import express from "express";
import Booking from "../models/Booking.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

const router = express.Router();

const getEventStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(startDate);

  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Ongoing";
  return "Completed";
};

// Register event
router.post("/register", async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const existing = await Booking.findOne({ userId, eventId });

    if (existing) {
      return res.json({ message: "Already registered" });
    }

    const booking = new Booking({ userId, eventId });
    await booking.save();

    res.json({ message: "Registered successfully", booking });
  } catch (error) {
    console.error("Register booking error:", error);
    res.status(500).json({ message: "Error registering" });
  }
});

// Unregister event
router.delete("/unregister", async (req, res) => {
  try {
    const { userId, eventId } = req.body;

    const deletedBooking = await Booking.findOneAndDelete({ userId, eventId });

    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Unregistered successfully" });
  } catch (error) {
    console.error("Unregister booking error:", error);
    res.status(500).json({ message: "Error unregistering" });
  }
});

// Check booking
router.get("/check/:userId/:eventId", async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const existing = await Booking.findOne({ userId, eventId });

    res.json({ registered: !!existing });
  } catch (error) {
    console.error("Check booking error:", error);
    res.status(500).json({ message: "Error checking booking" });
  }
});

// Get all bookings for a user with event details
router.get("/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({
      _id: -1,
    });

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const bookingObj = booking.toObject();

        const event = await Event.findById(booking.eventId);

        if (event) {
          const eventObj = event.toObject();
          eventObj.eventStatus = getEventStatus(eventObj.date, eventObj.endDate);
          bookingObj.event = eventObj;
        } else {
          bookingObj.event = null;
        }

        return bookingObj;
      })
    );

    res.json(enrichedBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});

// ✅ Get all participants for a specific event
router.get("/event/:eventId/participants", async (req, res) => {
  try {
    const { eventId } = req.params;

    const bookings = await Booking.find({ eventId });

    const participants = await Promise.all(
      bookings.map(async (booking) => {
        const user = await User.findById(booking.userId);

        if (!user) return null;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          department: user.department,
          year: user.year,
        };
      })
    );

    const filteredParticipants = participants.filter(Boolean);

    res.json(filteredParticipants);
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({ message: "Error fetching participants" });
  }
});

export default router;