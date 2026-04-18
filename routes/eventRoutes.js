import express from "express";
import Event from "../models/Event.js";
import {
  addEvent,
  getAllEvents,
  getEventById,
  recommendEvents,
  updateEventWinners,
} from "../controllers/eventController.js";

const router = express.Router();

/* Recommendation */
router.post("/recommend", recommendEvents);

/* Get all events */
router.get("/", getAllEvents);

/* Get single event by ID */
router.get("/:id", getEventById);

/* Add event */
router.post("/", addEvent);

/* Delete event */
router.delete("/delete/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Update event */
router.put("/update/:id", async (req, res) => {
  try {
    const updatedData = { ...req.body };

    if (updatedData.date) {
      updatedData.date = new Date(updatedData.date);
    }

    if (updatedData.endDate) {
      updatedData.endDate = new Date(updatedData.endDate);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* Update winners for an event */
router.put("/:id/winners", updateEventWinners);

export default router;