import weekCategory from "../module/week.category";
import WeekCategory from "../module/week.category";

export const all = async (req, res) => {
  try {
    const data: any = await WeekCategory.find()
      .populate({
        path: "category",
        select: "name linkImg seri time type year sumSeri",
        populate: {
          path: "products",
          model: "Products",
          select: "seri",
        },
      })
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
      select: "name linkImg seri time type year sumSeri slug",
      populate: {
        path: "products",
        model: "Products",
        select: "seri",
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

export const deleteCategoryByWeek = async (req, res) => {
  try {
    const weekId = req.params.id;
    const body = req.body;
    await WeekCategory.findByIdAndUpdate(weekId, {
      $pull: { category: body.categoryId },
    });
    return res.json({
      success: true,
      message: "Delete category by week successfully",
    });
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
};

export const createManyCategory = async (req, res) => {
  try {
    const body = req.body;
    const { id } = req.params;
    const weekId: any = await weekCategory.findOne({ name: id });
    if (!weekId) {
      return res.status(404).json({
        success: false,
        message: "Week category not found",
      });
    }
    if (!Array.isArray(weekId?.category)) {
      return res.status(400).json({
        success: false,
        message: "Category is not defined as an array",
      });
    }
    weekId.category = body;
    await weekId.save();
    return res.json({
      data: weekId,
      success: true,
      message: "Category added successfully by week",
    });
  } catch (error) {
    return res.status(404).json({
      error: error.message,
    });
  }
};
