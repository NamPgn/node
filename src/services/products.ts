import Products from "../module/products";

export const getProductCount = async (categoryId?: string, seri?: string) => {
  let query: any = {};
  
  if (categoryId) {
    query.category = categoryId;
  }
  
  if (seri) {
    query.seri = { $regex: seri, $options: 'i' };
  }
  
  return await Products.countDocuments(query);
};

export const getAll = async (page: number, limit: number, categoryId?: string, seri?: string) => {
  const skip = (page - 1) * limit;

  // Xây dựng query filter
  let query: any = {};

  if (categoryId) {
    query.category = categoryId;
  }

  if (seri) {
    query.seri = { $regex: seri, $options: 'i' }; // Tìm kiếm seri không phân biệt hoa thường
  }

  return await Products.find(query)
    .select('name slug category seri uploadDate dailyMotionServer ')
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 })
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
