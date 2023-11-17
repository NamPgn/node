import mongoose, { Schema } from "mongoose";

const approveSchema = new Schema(
  {
    date: {
      type: Date,
    },
    products: {
      type: Object,
      ref: "Products",
      required: false,
    },
    categorymain: {
      type: mongoose.Types.ObjectId,
      ref: "Categorymain",
      required: false,
    },
    typeId: {
      type: mongoose.Types.ObjectId,
      ref: "Types",
      required: false,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User"
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Approve", approveSchema);
