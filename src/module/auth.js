import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
const authSchema = mongoose.Schema({
	username: {
		type: String
	},
	isActive: {
		type: Number,
		default: 0
	},
	image: {
		type: String
	},
	password: {
		type: String
	},
	cart: [
		{
			product: { type: ObjectId, ref: "Products" },
			date: { type: Date, default: Date.now() }
		}
	],
	role: {
		type: Number,
		default: 0
	}

}, { collection: "user" }, { timestamps: true });

export default mongoose.model("User", authSchema)