import Comments from "../module/comments"
import Products from "../module/products";

export const getAllCommentsControllers = async (req, res) => {
  try {
    const data = await Comments.find().populate('user', 'username role image').populate('product', 'name seri category');
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
    const data = await new Comments(dataAdd).save();
    await Products.findByIdAndUpdate(_id, {
      $push: { comments: data },
    }, { new: true });
    res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message
    })
  }
}


export const deleteComment = async (req, res) => {
  try {
    const { productId, commentId } = req.body;

    const deletedComment = await Comments.findOneAndDelete({ '_id': commentId });
    if (!deletedComment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const updatedProduct = await Products.findByIdAndUpdate(productId, {
      $pull: { comments: { _id: commentId } }
    }, { new: true });
    if (updatedProduct) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
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