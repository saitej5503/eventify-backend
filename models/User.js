import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  department: String,
  year: String,
  department: { type: String, default: "ALL" },
  year: { type: String, default: "ALL" },

  interests: [String]
});

export default mongoose.model("User", userSchema);