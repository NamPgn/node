import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String
  },
  linkImg: {
    type: String
  },
  des: {
    type: String
  },
  sumSeri: {
    type: String
  },
  products: [
    {
      type: mongoose.Types.ObjectId, ref: 'Products'
    }
  ],
  type: {
    type: String
  },
  week: {
    type: mongoose.Types.ObjectId,
    ref: 'Week'
  },
  up: {
    type: Number
  }
}, { timestamps: true });
categorySchema.indexes();
export default mongoose.model("Category", categorySchema);