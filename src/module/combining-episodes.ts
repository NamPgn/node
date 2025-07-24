import mongoose from "mongoose";

const combiningEpisodesSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		slug: { type: String, required: true },
		episodesName: { type: String, required: true },
		link1: { type: String, required: false },
		link2: { type: String, required: false },
		link3: { type: String, required: false },
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
		}
	},
	{ timestamps: true }
);

export default mongoose.model("combiningEpisodes", combiningEpisodesSchema);
