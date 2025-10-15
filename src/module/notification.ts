import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
  title: string; // Tên series/phim
  body: string; // Nội dung thông báo
  categoryId: mongoose.Types.ObjectId; // Ref Category
  categorySlug: string; // Slug để navigate
  productId?: mongoose.Types.ObjectId; // Ref Product (episode)
  productSlug?: string; // Slug của product (để query dễ hơn)
  episodeNumber?: number; // Số tập

  // Thông tin gửi
  sentAt: Date; // Thời gian gửi
  sentBy?: mongoose.Types.ObjectId; // Ref User (admin gửi)

  // Thống kê
  totalRecipients: number; // Tổng số người nhận
  successCount: number; // Số người gửi thành công
  failureCount: number; // Số người gửi thất bại

  // Push notification data
  data?: {
    categorySlug?: string;
    episodeNumber?: number;
    productId?: string;
    [key: string]: any;
  };

  // Metadata
  platform?: string; // "expo" | "fcm" | "apns"
  status: "pending" | "sent" | "failed" | "partial"; // Trạng thái
  errorMessage?: string; // Lỗi nếu có

  // Tính năng nâng cao
  isRead?: boolean; // Đã đọc (cho notification history trên mobile)
  expiresAt?: Date; // Hết hạn (optional)
}

const notificationSchema = new Schema<INotification>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    categorySlug: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    },
    productSlug: {
      type: String,
      index: true,
    },
    episodeNumber: {
      type: Number,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    platform: {
      type: String,
      enum: ["expo", "fcm", "apns", "all"],
      default: "expo",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "partial"],
      default: "pending",
      index: true,
    },
    errorMessage: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      index: { expires: 0 }, // TTL index - tự động xóa khi hết hạn
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index compound để query hiệu quả
notificationSchema.index({ categoryId: 1, sentAt: -1 });
notificationSchema.index({ status: 1, sentAt: -1 });
notificationSchema.index({ categorySlug: 1, episodeNumber: -1 });

// Virtual để tính success rate
notificationSchema.virtual("successRate").get(function () {
  if (this.totalRecipients === 0) return 0;
  return ((this.successCount / this.totalRecipients) * 100).toFixed(2);
});

// Middleware: Auto update status dựa trên success/failure count
notificationSchema.pre("save", function (next) {
  if (this.isModified("successCount") || this.isModified("failureCount")) {
    const total = this.successCount + this.failureCount;
    if (total > 0) {
      if (this.failureCount === 0) {
        this.status = "sent";
      } else if (this.successCount === 0) {
        this.status = "failed";
      } else {
        this.status = "partial";
      }
    }
  }
  next();
});

// Static method: Tìm notifications của một category
notificationSchema.statics.findByCategory = function (categoryId: string, limit = 20) {
  return this.find({ categoryId })
    .sort({ sentAt: -1 })
    .limit(limit)
    .populate("sentBy", "username email")
    .populate("categoryId", "name slug")
    .exec();
};

// Static method: Lấy thống kê thông báo
notificationSchema.statics.getStats = async function (startDate?: Date, endDate?: Date) {
  const match: any = {};
  if (startDate) match.sentAt = { $gte: startDate };
  if (endDate) match.sentAt = { ...match.sentAt, $lte: endDate };

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRecipients: { $sum: "$totalRecipients" },
        successCount: { $sum: "$successCount" },
        failureCount: { $sum: "$failureCount" },
      },
    },
  ]);
};

// Static method: Kiểm tra đã gửi notification cho episode chưa
notificationSchema.statics.hasNotifiedEpisode = async function (
  categorySlug: string,
  episodeNumber: number
): Promise<boolean> {
  const count = await this.countDocuments({
    categorySlug,
    episodeNumber,
    status: { $in: ["sent", "partial"] },
  });
  return count > 0;
};

// Interface cho static methods
export interface INotificationModel extends Model<INotification> {
  findByCategory(categoryId: string, limit?: number): Promise<INotification[]>;
  getStats(startDate?: Date, endDate?: Date): Promise<any[]>;
  hasNotifiedEpisode(categorySlug: string, episodeNumber: number): Promise<boolean>;
}

export default mongoose.model<INotification, INotificationModel>("Notification", notificationSchema);

