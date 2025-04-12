import { Request, Response } from "express";
import Report from "../module/report";
import Products from "../module/products";

// Create a new report
export const createReport = async (req: Request, res: Response) => {
  try {
    const { productId, reaction, comment } = req.body;

    // Kiểm tra xem product có tồn tại không
    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Không tìm thấy phim",
        success: false
      });
    }

    // Lấy thông tin IP và User Agent
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    // Kiểm tra xem IP này đã report phim này trong 24h gần đây chưa
    const existingReport = await Report.findOne({
      product: productId,
      ipAddress,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (existingReport) {
      return res.status(400).json({
        message: "Bạn đã báo cáo phim này trong 24h qua",
        success: false
      });
    }

    // Tạo report mới
    const report = await Report.create({
      product: productId,
      reaction,
      comment,
      ipAddress,
      userAgent
    });
    console.log(comment + ipAddress);
    res.status(201).json({
      message: "Báo cáo đã được gửi",
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

// Get all reports with pagination
export const getAllReports = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find()
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments();

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
    console.error("Error getting all reports:", error);
    res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách báo cáo",
      success: false
    });
  }
};
