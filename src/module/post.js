import mongoose,{ Schema } from "mongoose";

const postSchema = new Schema({
  title: {
    type: String
  },
  content: {
    type: String
  },
  image: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('Post', postSchema);