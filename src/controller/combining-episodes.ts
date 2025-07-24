import { createCombiningEpisodes, getCombiningEpisodesById, getListCombiningEpisodes, updateCombiningEpisodes, deleteCombiningEpisodes, getCombiningEpisodesByCategoryId } from "../services/combining-episodes";

export const createCombiningEpisodesController = async (req, res) => {
	try {
		// Validate required fields
		const { name, episodesName, category } = req.body;
		if (!name || !episodesName || !category) {
			return res.status(400).json({
				success: false,
				message: "Missing required fields: name, episodesName, link1, link2, link3, category"
			});
		}

		const data = await createCombiningEpisodes(req.body);
		return res.status(200).json({
			success: true,
			message: "Combining episodes created successfully",
			data
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};

export const getListCombiningEpisodesController = async (req, res) => {
	try {
		const data = await getListCombiningEpisodes();
		return res.status(200).json({
			success: true,
			message: "Combining episodes fetched successfully",
			data
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};

export const getCombiningEpisodesByIdController = async (req, res) => {
	try {
		const data = await getCombiningEpisodesById(req.params.id);
		return res.status(200).json({
			success: true,
			message: "Combining episodes fetched successfully",
			data
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};

export const getCombiningEpisodesByCategorySlugController = async (req, res) => {
	try {
		const data = await getCombiningEpisodesByCategoryId(req.params.slug);
		return res.status(200).json({
			success: true,
			message: "Combining episodes fetched successfully",
			data
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};

export const updateCombiningEpisodesController = async (req, res) => {
	try {
		const data = await updateCombiningEpisodes(req.params.id, req.body);
		return res.status(200).json({
			success: true,
			message: "Combining episodes updated successfully",
			data
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};

export const deleteCombiningEpisodesController = async (req, res) => {
	try {
		const data = await deleteCombiningEpisodes(req.params.id);
		return res.status(200).json({
			success: true,
			message: "Combining episodes deleted successfully",
			data
		});
	} catch (error) {
		return res.status(400).json({ success: false, message: error.message });
	}
};