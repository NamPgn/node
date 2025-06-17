import Products from "../module/products";

export const getAll = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return await Products.find().select('name slug category seri uploadDate dailyMotionServer ')
    .skip(skip)
    .limit(limit)
    .sort({
      _id: -1,
    })
    .populate("category", "lang quality name")
    .exec();
};

export const get = async (id) => {
  return await Products.findOne({ _id: id });
};

export const addProduct_ = async (data) => {
  return new Products(data).save();
};

export const deleteProduct = async (id) => {
  return await Products.findOneAndDelete({ _id: id });
};

export const editProductSevices = async (id, data) => {
  return await Products.findOneAndUpdate({ _id: id }, data);
};
