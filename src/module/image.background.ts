import mongoose, { Schema } from "mongoose";

const background = new Schema({
  url: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('background', background);