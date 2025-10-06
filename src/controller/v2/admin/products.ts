import { Request, Response } from "express";
import Products from "../../../module/products";
import Category from "../../../module/category";
import { getDataFromCache } from "../../../redis";

/**
 * Admin: Lấy tất cả products với quyền admin
 */
export const getAllProductsAdmin = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const includePending = req.query.includePending === 'true';

    const query: any = {};
    if (!includePending) {
      query.isApproved = true;
    }

    const products = await Products.find(query)
      .select('name slug category seri uploadDate dailyMotionServer voiceOverLink thumnail isApproved view')
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 })
      .populate({
        path: "category",
        select: "lang quality name vs",
      })
      .exec();

    const totalCount = await Products.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      adminData: {
        includePending,
        canViewAll: true
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Admin: Approve product
 */
export const approveProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (updatedProduct) {
      return res.status(200).json({
        success: true,
        message: "Product approved successfully",
        data: updatedProduct
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to approve product",
      error: error.message
    });
  }
};

/**
 * Admin: Delete product
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deletedProduct = await Products.findByIdAndDelete(id);
    
    if (deletedProduct) {
      // Remove from category
      if (deletedProduct.category) {
        await Category.findByIdAndUpdate(
          deletedProduct.category,
          { $pull: { products: deletedProduct._id } }
        );
      }

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: deletedProduct
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to delete product",
      error: error.message
    });
  }
};
