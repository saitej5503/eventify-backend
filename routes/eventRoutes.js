import express from "express";
import Event from "../models/Event.js";
import axios from "axios";
const router = express.Router();

/* Get all events */
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events" });
  }
});

/* Add event */
import { addEvent } from "../controllers/eventController.js";

router.post("/", addEvent);
// delete event
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
// update event
router.put("/update/:id", async (req, res) => {
  try {

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedEvent);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/recommend", async (req, res) => {

  try {

    const { user_interest, event_category, location } = req.body;

    const response = await axios.post("http://localhost:6000/recommend", {
      user_interest,
      event_category,
      location
    });

    res.json(response.data);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "ML recommendation failed" });

  }

});
export default router;