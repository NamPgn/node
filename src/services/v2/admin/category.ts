import Category from "../../../module/category";

export const getAllCategoryByVersionAdmin = async (page: number, search?: string, version?: string) => {
  let query: any = {};
  
  // Filter by version if provided
  if (version && version.trim()) {
    query.vs = version.trim();
  }
  
  // Filter by search if provided
  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { slug: { $regex: search.trim(), $options: "i" } },
      { des: { $regex: search.trim(), $options: "i" } }
    ];
  }

  const limit = 20;
  const skip = (page - 1) * limit;

  const data = await Category.find(query)
    .select('name slug vs _id')
    .skip(skip)
    .sort({ createdAt: -1 })
    .exec();

  const totalCount = await Category.countDocuments(query);

  return {
    data,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    version
  };
};