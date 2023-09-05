import mongoose, { Model, Schema } from "mongoose";
const { ObjectId } = mongoose.Types
const Server2 = new Schema({
  url: {
    type: String
  },
  product: {
    type: ObjectId,
    ref:'Products'
  }
}, { timestamps: true });

export default mongoose.model('Server2', Server2)