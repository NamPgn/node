import mongoose from "mongoose";

const weekSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    }
  ],
});

export default mongoose.model('Week', weekSchema);