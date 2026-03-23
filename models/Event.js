import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: String,
  date: String,
  location: String,
  category: String,
  mainCategory: { type: String , required: true },
  image: String,
  description: {
    type: String,
    default: "No description available"
  },

  department: {
    type: [String],   // ["CSE", "EEE"] or ["ALL"]
    default: ["ALL"]
  },

  year: {
    type: [String],   // ["1", "2"] or ["ALL"]
    default: ["ALL"]
  }
  
});

export default mongoose.model("Event", eventSchema);