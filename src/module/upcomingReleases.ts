import mongoose from "mongoose";
import { Schema } from "mongoose";

const releaseSchema = new Schema(
  {
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Release", releaseSchema);
