const moment = require('moment-timezone');
import mongoose, { Schema } from "mongoose";

const { ObjectId } = mongoose.Types;
const CommentSchema = new Schema(
  {
    commentContent: {
      type: String,
    },
    user: {
      type: ObjectId,
      ref: "User",
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    date: {
      type: Date,
      default: () => {
        return moment().tz('Asia/Ho_Chi_Minh').toDate();
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
