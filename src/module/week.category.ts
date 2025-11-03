import mongoose from "mongoose";

const weekSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
  },
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }
  ],
});

export default mongoose.model('Week', weekSchema);