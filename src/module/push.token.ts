import mongoose from "mongoose";

const pushTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: false, // Optional: có thể gửi cho guest users
    },
    deviceInfo: {
      platform: {
        type: String,
        enum: ["android", "ios", "web"],
      },
      deviceName: String,
      appVersion: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsed: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index để tìm kiếm nhanh
pushTokenSchema.index({ token: 1 });
pushTokenSchema.index({ userId: 1 });
pushTokenSchema.index({ isActive: 1 });

export default mongoose.model("PushToken", pushTokenSchema);

