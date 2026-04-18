import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  password: { type: String, default: "" },

  department: { type: String, default: "ALL" },
  year: { type: String, default: "ALL" },

  interests: {
    type: [String],
    default: [],
  },
});

export default mongoose.model("User", userSchema);