import Types from "../module/types";
import Products from "../module/products";
import category from "../module/category";
import categorymain from "../module/categorymain";

export const GetAllTypeCategorys = async (req, res) => {
  try {
    const data = await Types.find()
      .sort({ path: 1 })
      .populate("categorymain.cates")
      .populate("products")
      .populate("category");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const GetOneTypeCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const page = parseInt(req.query.page || "1");
    const pageSize = parseInt(req.query.pageSize || "10");
    const skipCount = (page - 1) * pageSize;
    const data = await Types.findById(id)
      .populate("categorymain.cates")
      .populate({
        path: "products",
        options: {
          skip: skipCount,
          limit: pageSize,
        },
      })
      .populate("category");
    return res.status(200).json({
      data: data,
      length: (await Types.findById(id).populate("products")).products.length,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const CreateType = async (req, res) => {
  try {
    const body = req.body;
    const data = await new Types(body).save();
    return res.json({
      message: "Success",
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const DeleteType = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const data = await Types.findByIdAndDelete(id);
    // const s = await Types.findByIdAndUpdate(body.TypeId, {
    //   //tìm thằng categorymain
    //   $pull: { categorymain: { cates: { $in: [id] } } },
    // });
    // const d = await Products.findByIdAndDelete(id);
    // const e = await Types.findByIdAndUpdate(body.TypeId, {
    //   //tìm thằng categorymain
    //   $pull: { products: { $in: [id] } },
    // });
    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const UpdatedType = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const data = await Types.findByIdAndUpdate(id, body);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const pushCategory = async (req, res) => {
  try {
    const typeId = req.params.id;
    const body = req.body;
    const data = await category.findById(body.categoryId); //id của thằng category
    const findById = await Types.findById(typeId);
    let newData: any;
    if (findById) {
      newData = await Types.findByIdAndUpdate(typeId, {
        $addToSet: { category: data },
      });
    } else {
      newData = await categorymain.findByIdAndUpdate(typeId, {
        $addToSet: { categorys: data },
      });
    }

    return res.json({
      success: true,
      data: newData,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getPhim = async (req, res) => {
  try {
    const key = req.query.key;
    const data = await Types.findOne({ name: key })
      .populate("categorymain.cates")
      .populate("products")
      .populate("category");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
