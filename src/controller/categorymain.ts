import Categorymain from "../module/categorymain";
import Products from "../module/products";

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
    const data = await Categorymain.findById(id);
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
    return res.status(200).json(cate);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteCategoryType = async (req, res) => {
  try {
    const { id } = req.params;
    await Categorymain.findByIdAndDelete(id);
    return res.json({
      success: true,
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
    const dataEdit = await Categorymain.findByIdAndUpdate(id, data);
    return res.json(dataEdit);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
