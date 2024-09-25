import mongoose, { Schema } from "mongoose";
const { ObjectId } = mongoose.Types;
const productSchema = new Schema(
  {
    name: {
      type: String,
    },
    slug: {
      type: String,
    },
    view: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    descriptions: {
      type: String,
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    seri: {
      type: String,
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
    isApproved: {
      type: Boolean,
      default: false,
    },
    rating: [
      {
        type: Number,
      },
    ],
  },
  { timestamps: true, validateBeforeSave: false }
);
productSchema.indexes();
export default mongoose.model("Products", productSchema);
