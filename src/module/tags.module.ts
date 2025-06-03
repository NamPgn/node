import mongoose from "mongoose";

const tagsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    categories: [{
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    }]
  },
  { timestamps: true }
);

tagsSchema.indexes();
export default mongoose.model("Tags", tagsSchema);
