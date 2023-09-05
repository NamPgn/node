import Comments from "../module/comments"
import Products from "../module/products";
import Auth from "../module/auth";
import mongoose from "mongoose";

export const getAllCommentsControllers = async (req, res) => {
  try {
    const data = await Comments.find().populate('user', 'username role image' ).populate('product', 'name seri');
    res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
}


// export const getCommentsUserId = async (req, res) => {
//   try {
//     // const userId = req.params.userId;
//     // const movieId = req.params.movieId;
//     // console.log(userId, movieId);
//     const comments = await Comments.find().populate('users', "username")
//     console.log(comments);
//   } catch (err) {
//     console.error(err);
//   }
// }

export const getCommentsUserId = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 8;
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    const userId = req.params.userId;
    const productsId = req.params.productsId;

    const space = await Comments.find({ product: productsId });
    // const ar = [];
    // space.map((item) => {
    //   var data = item;
    //   const user = Auth.findOne({ _id: item.user })
    //   ar.push(user);
    // })
    // res.status(200).json(ar);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
};

export const addCommentController = async (req, res) => {
  try {
    const dataAdd = req.body;
    const _id = req.params.id;
    await Products.findByIdAndUpdate(_id, {
      $push: { comments: { commentContent: dataAdd.commentContent, user: dataAdd.user } },
    })
    const data = await new Comments(dataAdd).save();
    res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
}


export const deleteComment = async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await Comments.findOneAndDelete({ '_id': _id });
    res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
}


export const updateCommentController = async (req, res) => {
  try {
    const _id = req.params.id;
    const dataud = req.body
    const data = await Comments.findByIdAndUpdate(_id, dataud)
    res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
}