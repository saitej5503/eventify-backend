import Event from "../models/Event.js";
import axios from "axios";
const getMainCategory = (category) => {
  if (!category) return "other";
  const cat = category.toLowerCase();

  if (["tech","coding","ai","hackathon"].includes(cat)) return "technical";
  if (["music","dance","cultural"].includes(cat)) return "cultural";
  if (["cricket","kabaddi","sports"].includes(cat)) return "sports";
  if (["workshop","seminar"].includes(cat)) return "academic";
  if (["club","networking"].includes(cat)) return "social";

  return "other";
};

export const addEvent = async (req, res) => {
  try {

    console.log("REQ BODY:", req.body);

    const { 
      name, 
      date, 
      location, 
      category, 
      image,

      // 🔥 FIXED
      description = "No description available",
      department = ["ALL"],
      year = ["ALL"]

    } = req.body;

    if (!name || !date || !location || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const mainCategory = getMainCategory(category);

    console.log("Main Category:", mainCategory);

    const event = new Event({
      name,
      date,
      location,
      category,
      mainCategory,
      image,

      // 🔥 NEW FIELDS SAVED
      description,
      department,
      year
    });

    await event.save();

    res.status(201).json({
      message: "Event added successfully",
      event
    });

  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ message: "Server error" });
  }
};
   // 👈 add at top

   export const recommendEvents = async (req, res) => {
  try {
    const { interests, location } = req.body;

    let categories = [];

    try {
      // 🔥 ML API CALL
      const mlRes = await axios.post(
        "https://eventify-ml-1.onrender.com/recommend",
        {
          user_interests: interests,
          location: location
        },
        { timeout: 10000 }
      );

      categories = mlRes.data.recommended_categories;

      console.log("ML Categories:", categories);

    } catch (err) {
      console.log("ML failed → fallback used");

      // fallback (safe)
      const fallbackMap = {
        tech: "technical",
        music: "cultural",
        dance: "cultural",
        sports: "sports"
      };

      const interest = interests?.[0] || "tech";
      categories = [fallbackMap[interest] || "technical"];
    }

    const events = await Event.find();

    const recommended = events.filter((e) =>
      categories.includes(e.category?.toLowerCase()) ||
      categories.includes(e.mainCategory)
    );

    res.json({ recommendedEvents: recommended });

  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ message: "Recommendation failed" });
  }
};
