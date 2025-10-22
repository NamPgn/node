import mongoose from "mongoose";

const featureBannerSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    order: {
      type: Number,
      default: 0,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index để tăng tốc độ query
featureBannerSchema.index({ order: 1, isActive: 1 });
featureBannerSchema.index({ category: 1 });

export default mongoose.model("FeatureBanner", featureBannerSchema);

