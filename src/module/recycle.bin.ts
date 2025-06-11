import mongoose from "mongoose";

const recycleBinSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    willBeDeletedAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    isRestored: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for automatic cleanup
recycleBinSchema.index({ willBeDeletedAt: 1 }, { expireAfterSeconds: 0 });

const RecycleBin = mongoose.model("RecycleBin", recycleBinSchema);

export default RecycleBin; 