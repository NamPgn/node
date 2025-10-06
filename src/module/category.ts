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
    posters: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Poster",
      },
    ],
    type: {
      type: String,
    },
    week: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Week",
      },
    ],
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
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "completed"]
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
    relatedSeasons: {
      type: mongoose.Types.ObjectId,
      ref: "Season"
    },
    lang: {
      type: String,
      default: "Vietsub",
      enum: ["Vietsub", "ThuyetMinh", "ThuyetMinh-Vietsub"],
      
    },
    quality: {
      type: String,
      default: "HD",
      enum: ["HD", "FHD", "4K"]
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
    searchCount: { type: Number, default: 0 },
    tags: [{
      type: mongoose.Types.ObjectId,
      ref: "Tags",
    }],
    isDeleted: {
      type: Boolean,
      default: false
    },
    combiningEpisodes: [
      {
        type: mongoose.Types.ObjectId,
        ref: "combiningEpisodes",
      }
    ],
    thuyetMinh: {
      type: Boolean,
      default: false,
    },
    newMovie: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    vs: {
      type: String,
      default: "3d",
      enum: ["2d", "3d"]
    }
  },
  { timestamps: true }
);
categorySchema.indexes();
export default mongoose.model("Category", categorySchema);
