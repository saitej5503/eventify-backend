import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // find admin by email
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      admin: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};