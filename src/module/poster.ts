import mongoose from "mongoose";

const posterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    alt: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    aspect: {
      type: String,
      enum: ["1:1", "16:9", "4:3", "3:2", "21:9", "9:16", "2:3"],
      default: "16:9",
    },
    coverPoster: {
      type: String,
      enum: ["cover", "poster"],
      default: "poster",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Poster", posterSchema);


