import WeekCategory from "../module/week.category";

export const all = async (req, res) => {
  try {
    const data: any = await WeekCategory.find()
      .populate({
        path: "category",
        populate: {
          path: "products",
          model: "Products",
        },
      })
      .populate("products")
      .sort({ name: 1 }); //123

    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
};

export const one = async (req, res) => {
  try {
    const { w } = req.query;
    const data = await WeekCategory.find({ name: w }).populate({
      path: "category",
      populate: {
        path: "products",
        model: "Products",
      },
    });
    let categorys: any = {
      name: "",
      content: [],
    };
    data.map((items) => {
      categorys.name = items.name;
      categorys.content = items.category;
    });
    return res.json(categorys);
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const newData = await new WeekCategory(req.body).save();
    return res.json({
      data: newData,
      success: true,
    });
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
};

export const del = async (req, res) => {
  try {
    const data = await WeekCategory.findByIdAndDelete(req.params.id);
    return res.json({
      data: data,
      message: "Successfully deleted",
    });
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
};

export const edit = async (req, res) => {
  try {
    const data = await WeekCategory.findByIdAndUpdate(req.params.id, req.body);
    return res.json(data);
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
};
