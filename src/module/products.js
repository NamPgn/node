import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Types;
import mongoosePaginate from "mongoose-paginate-v2";
const productSchema = new Schema(
  {
    name: {
      type: String,
    },
    view: {
      type: String,
    },
    image: {
      type: String,
    },
    descriptions: {
      type: String,
    },
    category: {
      type: ObjectId || undefined,
      ref: "Category",
    },
    seri: {
      type: String || undefined,
    },
    select: {
      type: Boolean,
      default: false,
    },
    uploadDate: {
      type: Date,
    },
    options: {
      type: String,
    },
    link: {
      type: String,
    },
    server2: {
      type: String,
    },
    copyright: {
      type: String,
    },
    LinkCopyright: {
      type: String,
    },
    year: {
      type: String,
    },
    country: {
      type: String,
    },
    comments: [
      {
        commentContent: { type: String },
        user: { type: ObjectId, ref: "User" },
        date: { type: Date, default: Date.now() },
      },
    ],
    categorymain: {
      type: ObjectId,
      ref: "Categorymain",
      required: false,
    },
    typeId: {
      type: ObjectId,
      ref: "Types",
      required: false,
    },
    dailyMotionServer: {
      type: String,
    },
    video2: {
      type: String,
    },
    imageLink: {
      type: String,
    },
    trailer: {
      type: String,
    },
    isApproved:{
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, validateBeforeSave: false }
);
productSchema.indexes();
productSchema.plugin(mongoosePaginate);
export default mongoose.model("Products", productSchema);