import Category from "../../module/category";

export const getCategoryAdmin = async (id) => {
	const category = await Category.findOne({ slug: id })
		.select(
			"name linkImg sumSeri type year time lang quality slug country des up isMovie hour anotherName relatedSeasons "
		)
		.populate({
			path: "week",
			model: "Week",
			select: "name",
		})
		.populate({
			path: "tags",
			model: "Tags",
			select: "name slug -_id",
		})
	return category;
};