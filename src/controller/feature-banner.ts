import FeatureBanner from "../module/feature-banner";
import Category from "../module/category";

// Tạo feature banner mới
export const createFeatureBanner = async (req, res) => {
  try {
    const { categoryId, title, description, order, isActive } = req.body;

    if (!categoryId) {
      return res.status(400).json({ message: "Category ID là bắt buộc!" });
    }

    // Kiểm tra category có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy category!" });
    }

    // Kiểm tra category đã được thêm vào feature banner chưa
    const existingFeature = await FeatureBanner.findOne({ category: categoryId });
    if (existingFeature) {
      return res.status(400).json({ 
        message: "Category này đã có trong danh sách nổi bật!" 
      });
    }

    const newFeatureBanner = await FeatureBanner.create({
      category: categoryId,
      title: title || category.name,
      description: description || category.des,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    const populatedFeature = await FeatureBanner.findById(newFeatureBanner._id)
      .populate({
        path: "category",
        select: "name slug linkImg des rating ratingCount status year country quality lang newMovie",
      });

    return res.status(201).json({
      data: populatedFeature,
      message: "Feature banner đã được tạo thành công!",
    });
  } catch (error) {
    console.error("Error creating feature banner:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy tất cả feature banners
export const getFeatureBanners = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const featureBanners = await FeatureBanner.find(filter)
      .populate({
        path: "category",
        select: "name anotherName slug linkImg quality lang sumSeri",
      })
      .sort({ order: 1, createdAt: -1 });

    return res.status(200).json({ 
      data: featureBanners,
      total: featureBanners.length 
    });
  } catch (error) {
    console.error("Error getting feature banners:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy một feature banner theo ID
export const getFeatureBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    const featureBanner = await FeatureBanner.findById(id)
      .populate({
        path: "category",
        select: "name anotherName slug linkImg des rating ratingCount status year country quality lang newMovie products sumSeri",
      });

    if (!featureBanner) {
      return res.status(404).json({ message: "Không tìm thấy feature banner!" });
    }

    return res.status(200).json({ data: featureBanner });
  } catch (error) {
    console.error("Error getting feature banner:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật feature banner
export const updateFeatureBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, title, description, order, isActive } = req.body;

    const featureBanner = await FeatureBanner.findById(id);
    if (!featureBanner) {
      return res.status(404).json({ message: "Không tìm thấy feature banner!" });
    }

    // Nếu thay đổi category, kiểm tra category mới
    if (categoryId && categoryId !== featureBanner.category.toString()) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Không tìm thấy category mới!" });
      }

      // Kiểm tra category mới đã tồn tại chưa
      const existingFeature = await FeatureBanner.findOne({ 
        category: categoryId,
        _id: { $ne: id } 
      });
      if (existingFeature) {
        return res.status(400).json({ 
          message: "Category này đã có trong danh sách nổi bật!" 
        });
      }

      featureBanner.category = categoryId;
    }

    if (title !== undefined) featureBanner.title = title;
    if (description !== undefined) featureBanner.description = description;
    if (order !== undefined) featureBanner.order = order;
    if (isActive !== undefined) featureBanner.isActive = isActive;

    await featureBanner.save();

    const updatedFeature = await FeatureBanner.findById(id)
      .populate({
        path: "category",
        select: "name anotherName slug linkImg des rating ratingCount status year country quality lang newMovie",
      });

    return res.status(200).json({
      message: "Feature banner đã được cập nhật!",
      data: updatedFeature,
    });
  } catch (error) {
    console.error("Error updating feature banner:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa feature banner
export const deleteFeatureBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const featureBanner = await FeatureBanner.findById(id);
    if (!featureBanner) {
      return res.status(404).json({ message: "Không tìm thấy feature banner!" });
    }

    await FeatureBanner.findByIdAndDelete(id);

    return res.status(200).json({ 
      message: "Feature banner đã được xóa thành công!" 
    });
  } catch (error) {
    console.error("Error deleting feature banner:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật thứ tự hiển thị
export const updateFeatureBannerOrder = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }

    if (!Array.isArray(orders)) {
      return res.status(400).json({ 
        message: "Dữ liệu phải là một mảng các object { id, order }!" 
      });
    }

    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } }
      }
    }));

    await FeatureBanner.bulkWrite(bulkOps);

    const updatedFeatures = await FeatureBanner.find()
      .populate({
        path: "category",
        select: "name slug linkImg des rating",
      })
      .sort({ order: 1 });

    return res.status(200).json({
      message: "Cập nhật thứ tự thành công!",
      data: updatedFeatures,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Toggle trạng thái active
export const toggleFeatureBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const featureBanner = await FeatureBanner.findById(id);
    if (!featureBanner) {
      return res.status(404).json({ message: "Không tìm thấy feature banner!" });
    }

    featureBanner.isActive = !featureBanner.isActive;
    await featureBanner.save();

    const updatedFeature = await FeatureBanner.findById(id)
      .populate({
        path: "category",
        select: "name slug linkImg des rating",
      });

    return res.status(200).json({
      message: `Feature banner đã được ${updatedFeature.isActive ? 'kích hoạt' : 'vô hiệu hóa'}!`,
      data: updatedFeature,
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

