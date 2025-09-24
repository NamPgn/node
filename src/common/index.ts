import cloudinary from "../config/cloudinary";
import multer from "multer";

export interface CloudinaryUploadInfo {
    url: string;
    publicId: string;
}

export const uploadImageToCloudinaryWithInfo = (
    file: Express.Multer.File,
    folderName: string,
    options?: {
        width?: number;
        height?: number;
        quality?: string;
    }
): Promise<CloudinaryUploadInfo> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            file.path,
            {
                folder: folderName,
                public_id: file.originalname.split(".")[0],
                overwrite: true,
                resource_type: "image",
                transformation: [
                    {
                        width: options?.width || 1920,
                        height: options?.height || 1080,
                        crop: "limit",
                        quality: options?.quality || "auto:good",
                        format: "webp",
                        flags: "progressive",
                    },
                ],
                eager: [
                    { width: 400, height: 300, crop: "fill", format: "webp" },
                    { width: 800, height: 600, crop: "fill", format: "webp" },
                ],
                eager_async: true,
            },
            (error, result: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ url: result.secure_url, publicId: result.public_id });
                }
            }
        );
    });
};

export const deleteImageFromCloudinary = (publicId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, { resource_type: "image" }, (error: any) => {
            if (error) return reject(error);
            resolve();
        });
    });
};