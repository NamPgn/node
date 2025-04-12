import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Types;

const reportSchema = new Schema(
  {
    product: {
      type: ObjectId,
      ref: "Products",
      required: true
    },
    reaction: {
      type: String,
      required: true
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "rejected"],
      default: "pending"
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
