import WeekCategory from "../module/week.category";

export const all = async (req, res) => {
  try {
    const data = await WeekCategory.find().populate('category').populate('products').sort({ name: 1 }); //123
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({
      error: error.message
    })
  }
}

export const one = async (req, res) => {
  try {
    const data = await WeekCategory.findById(req.params.id).populate('category').populate('products');
    res.json(data);
  } catch (error) {
    return res.status(404).json({
      error: error.message
    })
  }
}

export const create = async (req, res) => {
  try {
    const newData = await new WeekCategory(req.body).save();
    return res.json({
      data: newData,
      success: true
    });
  } catch (error) {
    return res.status(404).json({
      error: error.message
    })
  }
}

export const del = async (req, res) => {
  try {
    const data = await WeekCategory.findByIdAndDelete(req.params.id);
    res.json({
      data: data,
      message: "Successfully deleted",

    });
  } catch (error) {
    return res.status(404).json({
      error: error.message
    })
  }
};

export const edit = async (req, res) => {
  try {
    const data = await WeekCategory.findByIdAndUpdate(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    return res.status(404).json({
      error: error.message
    })
  }
}