import mongoose, { Schema } from "mongoose";

const ImageUser = new Schema({
  url: {
    type: String
  },
  user_id:{
    type:mongoose.Types.ObjectId,
    ref:'User'
  }
}, { timestamps: true });

export default mongoose.model('ImageUser', ImageUser);