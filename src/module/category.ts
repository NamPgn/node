import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    anotherName: {
      type: String,
    },
    slug: {
      type: String,
    },
    linkImg: {
      type: String,
    },
    des: {
      type: String,
    },
    sumSeri: {
      type: String,
    },
    products: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Products",
      },
    ],
    type: {
      type: String,
    },
    week: {
      type: mongoose.Types.ObjectId,
      ref: "Week",
    },
    up: {
      type: Number,
    },
    year: {
      type: String,
    },
    time: {
      type: String,
    },
    country: {
      type: String,
    },
    isActive: {
      type: Number,
      default: 0,
    },
    latestProductUploadDate: {
      type: Date,
    },
    rating: [
      {
        type: Number,
      },
    ],
    ratingCount: {
      type: Number,
      default: 0,
    },
    hour: {
      type: String,
    },
    season: {
      type: String,
    },
    lang: {
      type: String,
      default: "Vietsub",
    },
    quality: {
      type: String,
      default: "HD",
    },
    comment: [
      {
        type: mongoose.Types.ObjectId || undefined,
        ref: "Comment",
      },
    ],
    upcomingReleases: {
      type: String,
      default: "comeout",
    },
    releaseDate: {
      type: String,
    },
    isMovie: {
      type: String,
      default: "drama",
    },
    episode_many_title: {
      type: String,
    },
  },
  { timestamps: true }
);
categorySchema.indexes();
export default mongoose.model("Category", categorySchema);
