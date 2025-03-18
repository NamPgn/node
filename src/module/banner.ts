import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    position: {
      type: String,
      enum: ["top-center", "bottom-center", "left-center", "right-center"],
      required: true,
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    link: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
