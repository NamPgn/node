import mongoose from "mongoose";

const categorymainSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    categorys: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Categorymain", categorymainSchema);
