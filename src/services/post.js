import Post from "../module/post";

export const getAllPostList = async () => {
  return await Post.find().exec();
}

export const addPostConten = async (data) => {
  return await new Post(data).save();
}

export const deletePost = async (id) => {
  return await Post.findOneAndDelete({ '_id': id });
}

export const updatePost = async (data, id) => {
  return await Post.findOneAndUpdate({ '_id': id }, data);
}