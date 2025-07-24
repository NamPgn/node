import CombiningEpisodes from "../module/combining-episodes";
import Category from "../module/category";
import mongoose from "mongoose";
import slugify from "slugify";

export const createCombiningEpisodes = async (data) => {
	if (!data.category || !mongoose.Types.ObjectId.isValid(data.category)) {
		throw new Error("Invalid category ID");
	}

	// Find category by ID
	const category = await Category.findById(data.category);
	if (!category) {
		throw new Error("Category not found");
	}

	// Generate slug from name
	const slug = slugify(data.name, {
		lower: true,
		strict: true,
		locale: "vi"
	});

	// Create combining episodes
	const combiningEpisode = await CombiningEpisodes.create({
		...data,
		slug
	});

	// Update category with the new combining episodes reference
	await Category.findByIdAndUpdate(
		category._id,
		{
			$addToSet: { combiningEpisodes: combiningEpisode._id },
		},
		{ new: true }
	);

	return combiningEpisode;
};

export const getListCombiningEpisodes = async () => {
	return await CombiningEpisodes.find();
};

export const getCombiningEpisodesById = async (id) => {
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw new Error("Invalid combining episodes ID");
	}
	return await CombiningEpisodes.findById(id).populate({
		path: "category",
		model: "Category",
		select: "_id"
	});
};

export const getCombiningEpisodesByCategoryId = async (categoryId) => {
	if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
		throw new Error("Invalid category ID");
	}
	const category = await Category.findById(categoryId).populate("combiningEpisodes");
	if (!category) {
		throw new Error("Category not found");
	}
	return category;
};

export const updateCombiningEpisodes = async (id, data) => {
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw new Error("Invalid combining episodes ID");
	}

	// If name is being updated, regenerate slug
	if (data.name) {
		data.slug = slugify(data.name, {
			lower: true,
			strict: true,
			locale: "vi"
		});
	}

	// If category is being updated, validate and handle the reference updates
	if (data.category) {
		if (!mongoose.Types.ObjectId.isValid(data.category)) {
			throw new Error("Invalid new category ID");
		}

		const category = await Category.findById(data.category);
		if (!category) {
			throw new Error("New category not found");
		}

		// Add reference to new category
		await Category.findByIdAndUpdate(
			category._id,
			{ $addToSet: { combiningEpisodes: id } }
		);

	}

	return await CombiningEpisodes.findByIdAndUpdate(id, data, { new: true });
};

export const deleteCombiningEpisodes = async (id) => {
	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw new Error("Invalid combining episodes ID");
	}

	// Get the combining episode to remove category reference
	const combiningEpisode = await CombiningEpisodes.findById(id);
	if (!combiningEpisode) {
		throw new Error("Combining episodes not found");
	}

	// Remove reference from category
	await Category.findByIdAndUpdate(
		combiningEpisode.category,
		{ $unset: { combiningEpisodes: "" } }
	);

	return await CombiningEpisodes.findByIdAndDelete(id);
};