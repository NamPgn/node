import cloudinary from "../config/cloudinary";
import { Multer } from "multer";
export const uploadImageToCloudinary = (file: Multer.File, folderName: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload(
			file.path,
			{
				folder: folderName,
				public_id: file.originalname,
				overwrite: true,
				crop: "fill",
				format: "webp",
			},
			(error, result: any) => {
				if (error) {
					reject(error);
				} else {
					const secureUrl = result.url.replace("http://", "https://");
					resolve(secureUrl);
				}
			}
		);
	});
};