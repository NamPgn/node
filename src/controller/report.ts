import { Request, Response } from "express";
import Report from "../module/report";
import Products from "../module/products";
import { Types } from "mongoose";
// Create a new report
export const createReport = async (req: Request, res: Response) => {
  try {
    const { productId, comment } = req.body as { productId: string; comment?: string };

    // Kiểm tra xem product có tồn tại không (chấp nhận slug hoặc ObjectId)
    let product: any = null;
    if (productId) {
      if (Types.ObjectId.isValid(productId)) {
        product = await Products.findById(productId).select("_id");
      } else {
        product = await Products.findOne({ slug: productId }).select("_id");
      }
    }
    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy phim",
        success: false
      });
    }

    // Lấy thông tin nhận dạng
    const ipAddress = req.ip;
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    const userAgent = req.headers["user-agent"];
    const fingerprint = `${ipAddress}-${forwardedFor}-${realIP}-${userAgent}`;

    // Kiểm tra nội dung comment có phải spam không
    if (comment) {
      // Kiểm tra độ dài comment
      if (comment.length < 10 || comment.length > 500) {
        return res.status(400).json({
          message: "Nội dung báo cáo phải từ 10 đến 500 ký tự",
          success: false
        });
      }

      // Kiểm tra comment có chứa link spam không
      const spamLinkPattern = /(http|https|www|\.com|\.net|\.org)/i;
      if (spamLinkPattern.test(comment)) {
        return res.status(400).json({
          message: "Không được phép gửi link trong báo cáo",
          success: false
        });
      }
    }

    // Tạo report mới
    const report = await Report.create({
      product: product._id,
      comment,
      ipAddress,
      userAgent,
      fingerprint,
      forwardedFor,
      realIP,
      status: 'pending',
      adminNote: '',
      resolvedAt: null,
      resolvedBy: null
    });

    res.status(201).json({
      message: "Báo cáo đã được gửi, cảm ơn bạn!",
      success: true,
      data: report
    });

  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi gửi báo cáo",
      success: false
    });
  }
};

// Get reports for a product
export const getProductReports = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const reports = await Report.find({ product: productId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reports
    });

  } catch (error) {
    console.error("Error getting reports:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách báo cáo",
      success: false
    });
  }
};

// Get reports with advanced filtering and pagination
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    const skip = (page - 1) * limit;
    const query: any = {};

    // Áp dụng các bộ lọc
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('product', 'name slug thumbnail')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        pageSize: limit,
        totalItems: total
      }
    });

  } catch (error) {
    console.error("Error getting reports:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách báo cáo",
      success: false
    });
  }
};

// // Update report status and add admin note
// export const updateReportStatus = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { status, adminNote } = req.body;
//     const adminId = req.user?._id; // Assuming you have user info in request

//     if (!['pending', 'resolved', 'rejected'].includes(status)) {
//       return res.status(400).json({
//         message: "Trạng thái không hợp lệ",
//         success: false
//       });
//     }

//     const report = await Report.findById(id);
//     if (!report) {
//       return res.status(404).json({
//         message: "Không tìm thấy báo cáo",
//         success: false
//       });
//     }

//     // Nếu report đã được xử lý, không cho phép thay đổi
//     if (report.status !== 'pending') {
//       return res.status(400).json({
//         message: "Báo cáo này đã được xử lý",
//         success: false
//       });
//     }

//     const updatedReport = await Report.findByIdAndUpdate(
//       id,
//       {
//         status,
//         adminNote: adminNote || '',
//         resolvedAt: new Date(),
//         resolvedBy: adminId
//       },
//       { new: true }
//     ).populate('product', 'name slug thumbnail')
//      .populate('resolvedBy', 'username');

//     // Nếu report được resolve, cập nhật số lượng report cho product
//     if (status === 'resolved') {
//       await Products.findByIdAndUpdate(report.product, {
//         $inc: { reportCount: 1 }
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `Báo cáo đã được ${status === 'resolved' ? 'chấp nhận' : 'từ chối'}`,
//       data: updatedReport
//     });

//   } catch (error) {
//     console.error("Error updating report:", error);
//     res.status(500).json({
//       message: "Có lỗi xảy ra khi cập nhật báo cáo",
//       success: false
//     });
//   }
// };

// Delete report (soft delete)
export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        message: "Không tìm thấy báo cáo",
        success: false
      });
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Đã xóa báo cáo"
    });

  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi xóa báo cáo",
      success: false
    });
  }
};

// // Get report statistics
// export const getReportStats = async (req: Request, res: Response) => {
//   try {
//     const [totalStats, recentStats] = await Promise.all([
//       // Tổng số báo cáo theo trạng thái
//       Report.aggregate([
//         {
//           $group: {
//             _id: "$status",
//             count: { $sum: 1 }
//           }
//         }
//       ]),
//       // Số báo cáo trong 7 ngày gần đây
//       Report.aggregate([
//         {
//           $match: {
//             createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
//           }
//         },
//         {
//           $group: {
//             _id: {
//               date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//               status: "$status"
//             },
//             count: { $sum: 1 }
//           }
//         }
//       ])
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalStats,
//         recentStats
//       }
//     });

//   } catch (error) {
//     console.error("Error getting report stats:", error);
//     res.status(500).json({
//       message: "Có lỗi xảy ra khi lấy thống kê báo cáo",
//       success: false
//     });
//   }
// };
