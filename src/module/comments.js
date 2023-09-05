import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Types;
const CommentSchema = new Schema({
  commentContent: {
    type: String,
  },
  user: {
    type: ObjectId,
    ref: "User"
  },
  product: {
    type: ObjectId,
    ref: "Products"
  },

}, { timestamps: true });

export default mongoose.model('Comment', CommentSchema);