import Categorymain from "../module/categorymain";
import Products from "../module/products";
import Types from "../module/types";

export const getAllCategorymain = async (req, res) => {
  try {
    const data = await Categorymain.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getOneCategoryMain = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Categorymain.findById(id)
      .populate("products")
      .populate("categorys")
      .populate("typeId", "name");
    return res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const addCategorymain = async (req, res) => {
  try {
    const data = req.body;
    const cate = await new Categorymain(data).save();
    await Types.findByIdAndUpdate(data.typeId, {
      $push: { categorymain: { cates: cate._id } },
    });
    res.status(200).json(cate);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteCategorymainByproduct = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    // const data = await Categorymain.findByIdAndDelete(id);
    //thiếu phải nhảy sang thằng type tìm cái id nếu tông tại thì xóa khỏi thằng type
    const s = await Categorymain.findByIdAndUpdate(body.CatemainId, {
      //tìm thằng catemain
      $pull: { products: { $in: [id] } },
    });
    const d = await Products.findByIdAndDelete(id);
    return res.json({
      success: true,
      dataProduct: d,
      dataCateMain: s,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const updateCategorymain = async (req, res) => {
  try {
    const data = req.body;
    const { id } = req.params;
    const dataEdit = Categorymain.findByIdAndUpdate(id, data);
    //thiếu phải nhảy sang thằng type tìm cái id nếu tông tại thì update khỏi thằng type
    return res.json(dataEdit);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
