import { Request, Response } from "express";
import Category from "../../../module/category";

export const getAllCategory3d = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1);

    const categories = await Category.find({
      vs: "3d",
    })
      .select('name slug')
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();
    const totalCount = await Category.countDocuments({
      vs: "3d",
    });

    return res.status(200).json({
      success: true,
      data: categories,
      totalCount,
      totalPages: Math.ceil(totalCount),
      currentPage: page,
      version: "3d"
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};