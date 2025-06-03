import Tags from "../module/tags.module";
import Category from "../module/category";
import slugify from "slugify";

export const createTagService = async (data: { name: string; categories: string[] }) => {
  const { name, categories } = data;
  
  // Kiểm tra categories có tồn tại không
  const categoryIds = Array.isArray(categories) ? categories : [categories];
  const categoriesExist = await Category.find({ _id: { $in: categoryIds } });
  
  if (categoriesExist.length !== categoryIds.length) {
    throw new Error("One or more categories not found");
  }

  // Tạo slug từ name
  const slug = slugify(name, { lower: true });

  // Kiểm tra tag đã tồn tại chưa
  const existingTag = await Tags.findOne({ slug });
  if (existingTag) {
    throw new Error("Tag with this name already exists");
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

  return savedTag;
};

export const updateTagService = async (id: string, data: { name?: string; categories?: string[] }) => {
  const { name, categories } = data;

  const tag = await Tags.findById(id);
  if (!tag) {
    throw new Error("Tag not found");
  }

  // Kiểm tra categories mới có tồn tại không
  const categoryIds = Array.isArray(categories) ? categories : [categories];
  if (categoryIds.length > 0) {
    const categoriesExist = await Category.find({ _id: { $in: categoryIds } });
    if (categoriesExist.length !== categoryIds.length) {
      throw new Error("One or more categories not found");
    }
  }

  // Tạo slug mới nếu name thay đổi
  const slug = name ? slugify(name, { lower: true }) : tag.slug;

  // Kiểm tra slug mới có bị trùng không
  if (name && slug !== tag.slug) {
    const existingTag = await Tags.findOne({ slug });
    if (existingTag) {
      throw new Error("Tag with this name already exists");
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

  return updatedTag;
};

export const deleteTagService = async (id: string) => {
  const tag = await Tags.findById(id);
  if (!tag) {
    throw new Error("Tag not found");
  }

  // Xóa tag khỏi tất cả categories
  await Category.updateMany(
    { _id: { $in: tag.categories } },
    { $pull: { tags: tag._id } }
  );

  // Xóa tag
  await Tags.findByIdAndDelete(id);

  return { message: "Tag deleted successfully" };
};

export const getTagsService = async () => {
  return await Tags.find().populate("categories", 'slug');
};

export const getTagByIdService = async (id: string) => {
  const tag = await Tags.findById(id).populate("categories", 'slug');
  if (!tag) {
    throw new Error("Tag not found");
  }
  return tag;
};
