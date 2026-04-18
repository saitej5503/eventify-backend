import User from "../models/User.js";
import Event from "../models/Event.js";
import axios from "axios";
import { sendMail } from "../services/mailer.js";

const getMainCategory = (category) => {
  if (!category) return "other";
  const cat = category.toLowerCase();

  if (["tech", "coding", "ai", "hackathon"].includes(cat)) return "technical";
  if (["music", "dance", "cultural"].includes(cat)) return "cultural";
  if (["cricket", "kabaddi", "sports"].includes(cat)) return "sports";
  if (["workshop", "seminar"].includes(cat)) return "academic";
  if (["club", "networking"].includes(cat)) return "social";

  return "other";
};

const getEventStatus = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(startDate);

  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Ongoing";
  return "Completed";
};

const formatEventWithStatus = (event) => {
  const eventObj = event.toObject();
  eventObj.eventStatus = getEventStatus(eventObj.date, eventObj.endDate);
  return eventObj;
};

export const addEvent = async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const {
      name,
      date,
      endDate,
      location,
      category,
      image,
      description = "No description available",
      department = ["ALL"],
      year = ["ALL"],
    } = req.body;

    if (!name || !date || !location || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const mainCategory = getMainCategory(category);

    console.log("Main Category:", mainCategory);

    const event = new Event({
      name,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location,
      category,
      mainCategory,
      image,
      description,
      department,
      year,
    });

    await event.save();

    const formattedEvent = formatEventWithStatus(event);

    res.status(201).json({
      message: "Event added successfully",
      event: formattedEvent,
    });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });

    const formattedEvents = events.map((event) => formatEventWithStatus(event));

    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const formattedEvent = formatEventWithStatus(event);

    res.status(200).json(formattedEvent);
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

export const updateEventWinners = async (req, res) => {
  try {
    const { id } = req.params;
    const { winners } = req.body;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.winners = winners;
    event.resultStatus = "announced";

    await event.save();

    // 🔥 Send email to winners
    for (const winner of winners) {
      try {
        const user = await User.findById(winner.user);

        if (user?.email) {
          await sendMail({
            to: user.email,
            subject: `🎉 Congratulations! You won ${event.name}`,
            text: `Congrats ${user.name}! You secured ${winner.position} place in ${event.name}`,
            html: `
              <div style="font-family: Arial;">
                <h2 style="color:green;">🎉 Congratulations ${user.name}!</h2>
                <p>You have secured <strong>${winner.position}</strong> place in:</p>

                <div style="background:#f4f4f5; padding:15px; border-radius:10px;">
                  <p><strong>Event:</strong> ${event.name}</p>
                  <p><strong>Position:</strong> ${winner.position}</p>
                  <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> ${event.location}</p>
                </div>

                <p>Keep shining ✨<br/>Team Eventify</p>
              </div>
            `,
          });

          console.log("✅ Winner mail sent:", user.email);
        }
      } catch (err) {
        console.error("❌ Winner mail failed:", err.message);
      }
    }

    res.json({ message: "Winners updated & emails sent" });

  } catch (error) {
    console.error("Winner update error:", error);
    res.status(500).json({ message: "Error updating winners" });
  }
};

export const recommendEvents = async (req, res) => {
  try {
    const { interests, location } = req.body;

    let categories = [];

    try {
      const mlRes = await axios.post(
        "https://eventify-ml-1.onrender.com/recommend",
        {
          user_interests: interests,
          location: location,
        },
        { timeout: 10000 }
      );

      categories = mlRes.data.recommended_categories || [];

      console.log("ML Categories:", categories);
    } catch (err) {
      console.log("ML failed → fallback used");

      const fallbackMap = {
        tech: "technical",
        music: "cultural",
        dance: "cultural",
        sports: "sports",
      };

      const interest = interests?.[0]?.toLowerCase() || "tech";
      categories = [fallbackMap[interest] || "technical"];
    }

    const events = await Event.find();

    const recommended = events
      .filter((e) => {
        const category = e.category?.toLowerCase();
        const mainCategory = e.mainCategory?.toLowerCase();

        return (
          categories.includes(category) || categories.includes(mainCategory)
        );
      })
      .map((event) => formatEventWithStatus(event));

    res.json({ recommendedEvents: recommended });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Recommendation failed" });
  }
};