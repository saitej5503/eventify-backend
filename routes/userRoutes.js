import express from "express";
import User from "../models/User.js";
import { sendMail } from "../services/mailer.js";
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, interests } = req.body;

    const newUser = new User({
      name,
      email,
      password,
      department: "ALL", // 🔥 DEFAULT VALUE
      year: "ALL", // 🔥 DEFAULT VALUE
      interests
    });

    await newUser.save();

    res.json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
  }
});
//user login route
router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user
    });

  } catch (error) {

    res.status(500).json({ message: "Login failed" });

  }

});
// User Interests Update Route
router.put("/update-interests/:id", async (req, res) => {
  try {

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { interests: req.body.interests },
      { new: true }
    );

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.get("/test-mail", async (req, res) => {
  try {
    await sendMail({
      to: "pulisettysaiteja@gmail.com",  // your email
      subject: "Eventify Test Mail",
      text: "Email is working successfully",
      html: "<h2>✅ Email is working successfully</h2>",
    });

    res.json({ message: "Mail sent successfully" });
  } catch (error) {
    console.error("Mail error:", error);
    res.status(500).json({ message: "Mail failed" });
  }
});

export default router;