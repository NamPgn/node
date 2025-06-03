import { Request, Response } from "express";
import Tags from "../module/tags.module";
import Category from "../module/category";
import slugify from "slugify";

export const createTag = async (req: Request, res: Response) => {
    try {
        const { name, categories } = req.body;

        // Kiểm tra categories có tồn tại không
        const categoryIds = Array.isArray(categories) ? categories : [categories];
        const categoriesExist = await Category.find({ _id: { $in: categoryIds } });

        if (categoriesExist.length !== categoryIds.length) {
            return res.status(404).json({
                success: false,
                message: "One or more categories not found"
            });
        }

        // Tạo slug từ name
        const slug = slugify(name, { lower: true });

        // Kiểm tra tag đã tồn tại chưa
        const existingTag = await Tags.findOne({ slug });
        if (existingTag) {
            return res.status(400).json({
                success: false,
                message: "Tag with this name already exists"
            });
        }

        const newTag = new Tags({
            name,
            slug,
            categories: categoryIds
        });

        const savedTag = await newTag.save();

        // Cập nhật tất cả categories với tag mới
        await Category.updateMany(
            { _id: { $in: categoryIds } },
            { $addToSet: { tags: savedTag._id } }
        );

        return res.status(201).json({
            success: true,
            message: "Tag created successfully",
            data: savedTag
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getTags = async (req: Request, res: Response) => {
    try {
        const tags = await Tags.find().populate("categories", 'slug');
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTagById = async (req: Request, res: Response) => {
    try {
        const tag = await Tags.findById(req.params.id).populate("categories", 'slug');
        if (!tag) {
            return res.status(404).json({ message: "Tag not found" });
        }
        res.status(200).json(tag);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTag = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, categories } = req.body;

        const tag = await Tags.findById(id);
        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found"
            });
        }

        // Kiểm tra categories mới có tồn tại không
        const categoryIds = Array.isArray(categories) ? categories : [categories];
        if (categoryIds.length > 0) {
            const categoriesExist = await Category.find({ _id: { $in: categoryIds } });
            if (categoriesExist.length !== categoryIds.length) {
                return res.status(404).json({
                    success: false,
                    message: "One or more categories not found"
                });
            }
        }

        // Tạo slug mới nếu name thay đổi
        const slug = name ? slugify(name, { lower: true }) : tag.slug;

        // Kiểm tra slug mới có bị trùng không
        if (name && slug !== tag.slug) {
            const existingTag = await Tags.findOne({ slug });
            if (existingTag) {
                return res.status(400).json({
                    success: false,
                    message: "Tag with this name already exists"
                });
            }
        }

        // Cập nhật tag
        const updatedTag = await Tags.findByIdAndUpdate(
            id,
            {
                name: name || tag.name,
                slug,
                categories: categoryIds.length > 0 ? categoryIds : tag.categories
            },
            { new: true }
        );

        // Cập nhật categories nếu có thay đổi
        if (categoryIds.length > 0) {
            // Xóa tag khỏi categories cũ
            await Category.updateMany(
                { _id: { $in: tag.categories } },
                { $pull: { tags: tag._id } }
            );
            // Thêm tag vào categories mới
            await Category.updateMany(
                { _id: { $in: categoryIds } },
                { $addToSet: { tags: updatedTag._id } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Tag updated successfully",
            data: updatedTag
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteTag = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const tag = await Tags.findById(id);
        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found"
            });
        }

        // Xóa tag khỏi tất cả categories
        await Category.updateMany(
            { _id: { $in: tag.categories } },
            { $pull: { tags: tag._id } }
        );

        // Xóa tag
        await Tags.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Tag deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
