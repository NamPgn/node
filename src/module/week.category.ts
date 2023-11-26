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
  products:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    }
  ]
});

export default mongoose.model('Week', weekSchema);