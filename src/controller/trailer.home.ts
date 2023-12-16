import trailerHomePageModel from "../module/trailer.home";
import {
  getTrailerUrlSevices,
} from "../services/trailer.home";
import admin from "firebase-admin";
const bucketName = process.env.BUCKET_NAME;
const folderName = "trailer";
export const getUrlTrailerControllers = async (req, res) => {
  try {
    const data = await trailerHomePageModel.findOne();
    res.status(200).json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const editTrailerHomePageUrlController = async (req, res) => {
  try {
    const { url, name } = req.body;
    const id = req.params.id;

    const findById = await trailerHomePageModel.findById(id);

    if (!findById) {
      return res.status(404).json({ message: "Product not found." });
    }
    findById.name = name;
    const newFile = req.file;
    if (newFile) {
      // Xóa tệp hình ảnh cũ từ Firebase Storage
      const oldImageFileName = findById.url
        .split(`/`)
        .pop()
        .split("?alt=media")[0]; //lấy sau thằng image vì nó qua folder name là image
      const decodedImage = decodeURIComponent(oldImageFileName).split("/")[1]; //
      const oldImageFile = admin
        .storage()
        .bucket(bucketName)
        .file(`${folderName}/${decodedImage}`); //còn thằng này không có folder mà là lấy chay nên phải lấy ra thằng cuối cùng .
      if (decodedImage) {
        await oldImageFile.delete();
      }

      const metadatavideo = {
        contentType: newFile.mimetype,
      };
      const fileNamevideo = `${folderName}/${Date.now()}-${
        newFile.originalname
      }`;
      const files = admin.storage().bucket(bucketName).file(fileNamevideo);
      const streamvideo = files.createWriteStream({
        metadata: metadatavideo,
        resumable: false,
      });

      streamvideo.on("error", (err) => {
        console.error(err);
        res.status(500).send({ message: "Failed to upload video." });
      });

      // Ghi dữ liệu video vào stream
      streamvideo.end(newFile.buffer);
      // Xử lý sự kiện khi stream ghi dữ liệu bị lỗi
      streamvideo.on("error", (err) => {
        console.error(err);
        res.status(500).send({ message: "Failed to upload video." });
      });
      const encodedFileName = encodeURIComponent(fileNamevideo);

      streamvideo.on("finish", async () => {
        const urlvideo = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFileName}?alt=media`;
        findById.name = name;
        findById.url = urlvideo;
        const data = await findById.save();
        return res.status(200).json({
          success: true,
          message: "Dữ liệu sản phẩm đã được cập nhật.",
          data: data,
        });
      });
    } else {
      findById.name = name;
      const data = await findById.save();
      return res.status(200).json({
        success: true,
        message: "Dữ liệu sản phẩm đã được cập nhật.",
        data: data,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getTrailerController = async (req, res) => {
  try {
    const data = await getTrailerUrlSevices();
    res.json(data);
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;
    if (!file) {
      res.json("Không có file tải lên");
    }

    const metadatavideo = {
      contentType: file.mimetype,
    };
    const fileNamevideo = `${folderName}/${Date.now()}-${file.originalname}`;
    const files = admin.storage().bucket(bucketName).file(fileNamevideo);
    const streamvideo = files.createWriteStream({
      metadata: metadatavideo,
      resumable: false,
    });

    streamvideo.on("error", (err) => {
      console.error(err);
      res.status(500).send({ message: "Failed to upload video." });
    });

    // Ghi dữ liệu video vào stream
    streamvideo.end(file.buffer);
    // Xử lý sự kiện khi stream ghi dữ liệu bị lỗi
    streamvideo.on("error", (err) => {
      console.error(err);
      res.status(500).send({ message: "Failed to upload video." });
    });
    const encodedFileName = encodeURIComponent(fileNamevideo);
    streamvideo.on("finish", async () => {
      const urlvideo = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedFileName}?alt=media`;
      const newDt = {
        name: name,
        url: urlvideo,
      };
      const data = await new trailerHomePageModel(newDt).save();
      return res.json(data);
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
