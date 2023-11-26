import { getAll, editUser, deleteUser } from "../services/auth";
import Auth from "../module/auth";
import cloudinary from "../config/cloudinary";
export const getAlluser = async (req, res) => {
  try {
    const data = await getAll();
    return res.json(data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const edit = async (req, res) => {
  try {
    const body = req.body;
    const _id = req.params.id;
    const data = await editUser(_id, body);
    res.status(200).json({
      success: true,
      message: "Thành công",
      data: data,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await deleteUser(id);
    cloudinary.uploader.destroy(data.image);
    return res.status(200).json({
      message: "Thành công",
      success: true,
      data:data
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getone = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await Auth.findById(id)
      .populate("cart.product", "name seri image category")
      .exec();
    user.password = undefined;
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const findCartByUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const data = await Auth.findById(_id).populate(
      "cart.product",
      "name seri image category"
    );
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
