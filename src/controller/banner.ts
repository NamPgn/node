import cloudinary from "../config/cloudinary";
import Banner from "../module/banner";

export const uploadBanner = async (req, res) => {
  try {
    const { title, position, width, height, link } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn một ảnh!" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "banners",
      public_id: req.file.originalname,
      overwrite: true,
      crop: "fill",
      format: "webp",
    });

    const newBanner = await Banner.create({
      title,
      imageUrl: result.url,
      position,
      width,
      height,
      link,
    });

    return res.status(201).json({
      data: newBanner,
      message: "Banner đã được tải lên thành công!",
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find();
    return res.status(200).json({ data: banners });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner)
      return res.status(404).json({ message: "Không tìm thấy banner!" });

    const publicId = `banners/${
      banner.imageUrl.split("/").pop().split(".")[0]
    }`;
    await cloudinary.uploader.destroy(publicId);

    await Banner.findByIdAndDelete(id);

    return res.status(200).json({ message: "Banner đã được xóa thành công!" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, position, link, width, height } = req.body;

    const banner = await Banner.findById(id);
    if (!banner)
      return res.status(404).json({ message: "Không tìm thấy banner!" });

    banner.title = title || banner.title;
    banner.position = position || banner.position;
    banner.link = link || banner.link;
    banner.width = width || banner.width;
    banner.height = height || banner.height;
    await banner.save();

    return res
      .status(200)
      .json({ message: "Banner đã được cập nhật!", banner });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error });
  }
};
