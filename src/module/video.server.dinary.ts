import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Types
const Dinary = new Schema({
  url: {
    type: String
  },
  product: {
    type: ObjectId,
    ref:'Products'
  }
}, { timestamps: true });
//ádf
export default mongoose.model('Dinary', Dinary)