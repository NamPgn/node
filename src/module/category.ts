import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    linkImg: {
      type: String,
    },
    des: {
      type: String,
    },
    sumSeri: {
      type: String,
    },
    products: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Products",
      },
    ],
    type: {
      type: String,
    },
    week: {
      type: mongoose.Types.ObjectId,
      ref: "Week",
    },
    up: {
      type: Number,
    },
    year: {
      type: String,
    },
    time: {
      type: String,
    },
    country: {
      type: String,
    },
    isActive: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
categorySchema.indexes();
export default mongoose.model("Category", categorySchema);
