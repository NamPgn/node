import moment from "moment-timezone";
import Category from "../module/category";
import Comments from "../module/comments";
import { resizeImageUrl } from "../utills/resizeImage";
import Auth from "../module/auth";
import dayjs from "dayjs";
export const getAllCommentsControllers = async (req, res) => {
  try {
    const data = await Comments.find()
      .populate("user", "username role image")
      .populate("category", "name slug");
    return res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const addCommentController = async (req, res) => {
  try {
    const dataAdd = req.body;
    const _id = req.params.id;
    const userId = req.params.userId;
    const userById = await Auth.findById(userId).lean();
    const newData = {
      ...dataAdd,
      user: userId,
    };
    const today = dayjs().startOf("day");
    const commentCount = await Comments.countDocuments({
      user: userId,
      createdAt: {
        $gte: today.toDate(),
        $lt: dayjs(today).endOf("day").toDate(),
      },
    });
    if (commentCount >= 22) {
      return res.status(201).json({
        message: "Bạn chỉ được gửi tối đa 22 bình luận trong một ngày!",
        code: 400,
      });
    }
    const data = await new Comments(newData).save();

    await Category.findByIdAndUpdate(
      _id,
      {
        $push: { comment: data._id },
      },
      { new: true }
    );
    const convertData = {
      ...data.toObject(),
      user: {
        username: userById.username,
        image: resizeImageUrl(userById.image, 30, 30),
      },
      timeAgo: "New",
    };
    return res.json({
      data: convertData,
      message: "Đăng bình luận thành công",
      code: 200,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { categoryId, commentId } = req.body;

    const deletedComment = await Comments.findOneAndDelete({ _id: commentId });
    if (!deletedComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const updatedProduct = await Category.findByIdAndUpdate(
      categoryId,
      {
        $pull: { comment: { _id: commentId } },
      },
      { new: true }
    );
    if (updatedProduct) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};
export const findCommentByIdCategory = async (req, res) => {
  try {
    const id = { _id: req.params.id };

    const data: any = await Comments.find({ category: id })
      .populate("user", "username image")
      .lean()
      .sort({ date: "desc" });

    const convertData = data?.map((item: any) => {
      return {
        ...item,
        user: {
          ...item.user,
          image: resizeImageUrl(item?.user?.image, 50, 50),
        },
        timeAgo: moment(item.date).fromNow(),
      };
    });

    return res.json({
      data: convertData,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const updateCommentController = async (req, res) => {
  try {
    const _id = req.params.id;
    const dataud = req.body;
    const data = await Comments.findByIdAndUpdate(_id, dataud);
    res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteMultipleComments = async (req, res) => {
  try {
    const ids = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No comment IDs provided. Please provide an array of IDs.",
      });
    }

    const existingComments = await Comments.find({ _id: { $in: ids } });
    if (existingComments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No comments found for the provided IDs.",
      });
    }

    await Comments.deleteMany({
      _id: { $in: ids },
    });

    await Category.updateMany(
      { comment: { $in: ids } },
      { $pull: { comment: { $in: ids } } }
    );

    const remainingComments = await Comments.find();
    return res.status(200).json({
      success: true,
      message: "Success",
      data: remainingComments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
