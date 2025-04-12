import mongoose from "mongoose";

const seriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String
    },
    categories: [{
      type: mongoose.Types.ObjectId,
      ref: "Category"
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    releaseYear: {
      type: Number
    },
  },
  { timestamps: true }
);

export default mongoose.model("Series", seriesSchema);
