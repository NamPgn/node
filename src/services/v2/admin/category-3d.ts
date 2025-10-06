import Category from "../../../module/category";

export const getAllCategory3dService = async (page: number, limit: number, search?: string) => {
  let query = {};

  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { des: { $regex: search, $options: "i" } }
      ]
    };
  }

  // Chỉ select những field cần thiết
  const selectFields = {
    _id: 1,
    name: 1,
    slug: 1,
  };
  if (page === 0 && limit === 0) {
    return await Category.find(query)
      .select(selectFields)
      .sort({ up: -1 })
  } else {
    const skip = (page - 1) * limit;
    return await Category.find(query)
      .select(selectFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  }
}