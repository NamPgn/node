import { Request, Response } from "express";
import { getAllCategoryByVersionAdmin } from "../../../services/v2/admin/category";

export const getAllCategoryByVersion = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string;
    const version = req.params.version || req.query.version as string;

    const result = await getAllCategoryByVersionAdmin(page, search, version);

    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
