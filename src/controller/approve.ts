import Approve from "../module/approve";
import Products from "../module/products";

export const getApproves = async (req, res) => {
  try {
    const data = await Approve.find()
      .populate("user")
      .populate("products")
      .populate("typeId")
      .populate("categorymain");
    return res.status(200).json({
      suscess: true,
      message: "Done",
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      suscess: false,
      message: "None",
      error: error.message,
    });
  }
};

export const getApprove = async (req, res) => {
  try {
    const data = await Approve.findById(req.params.id)
      .populate("user")
      .populate("products")
      .populate("typeId")
      .populate("categorymain");
    return res.status(200).json({
      suscess: true,
      message: "Done",
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      suscess: false,
      message: "None",
      error: error.message,
    });
  }
};

export const deleteApprove = async (req, res) => {
  try {
    const data = await Approve.findByIdAndDelete(req.params.id, { new: true });
    return res.status(200).json({
      suscess: true,
      message: "Done",
      data: data._id,
    });
  } catch (error) {
    return res.status(400).json({
      suscess: false,
      message: "None",
      error: error.message,
    });
  }
};

export const sending = async (req, res) => {
  try {
    const role = 2;
    const { id } = req.params;
    if (role !== 2) {
      return res.status(403).json({ message: "Bạn không có quyền duyệt phim" });
    }
    const approve = await Approve.findById(id);
    if (!approve) {
      return res.status(404).json({ message: "Không tìm thấy phê duyệt phim" });
    }
    await Approve.findByIdAndUpdate(id, req.body, { new: true });
    if (approve.isApproved == true) {
      // Xóa bản ghi trong bảng Approve
      await Approve.findByIdAndDelete(id);
      // approve.user = _id;
      const { products } = approve;
      if (products) {
        await Products.create(products);
      }
    }
    return res.json({
      success: true,
      message: "Done",
    });
  } catch (error) {
    return res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
};
