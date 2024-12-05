import mongoose, { Model, Schema } from "mongoose";
const { ObjectId } = mongoose.Types;
const CallSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Call", CallSchema);
