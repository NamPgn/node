import mongoose, { Model, Schema } from "mongoose";
const { ObjectId } = mongoose.Types
const CartSchema = new Schema({
  user: {
    type: ObjectId,
    ref: "User"
  },
  product: {
    type: ObjectId,
    ref: "Products"
  },
}, { timestamps: true });

export default mongoose.model('Cart', CartSchema)
