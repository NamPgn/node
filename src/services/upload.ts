import multer from "multer";
import User from "../module/auth";
import Product from "../module/products";
import {
  storageXlxs,
  storageXlxsProduct,
} from "../storage/storage";
import XLSX from "xlsx";

// upload excel user
export const uploadXlxs = async (req, res, next) => {
  try {
    let path = req.file.path;
    var workBok = XLSX.readFile(path);
    var sheet_name_list = workBok.SheetNames; //lấy ra cái tên
    let jsonData: any = XLSX.utils.sheet_to_json(
      //về dạng json
      workBok.Sheets[sheet_name_list[0]], //lấy cái bảng đầu tiên
    );
    if (jsonData.lenght == 0) {
      //kiểm tra neus không có gì thì cút
      res.json({
        message: "Not data",
      });
    }
    let saveData = await User.create(jsonData);
    res.json({
      suscess: true,
      message: "data" + saveData,
    });
  } catch (error) {}
};

export const uploadStorageUser = multer({ storage: storageXlxs });

//upload excel product

export const uploadStorageProduct = multer({ storage: storageXlxsProduct });

//video - upload

export const uploadvideoandimage = multer({
  storage: multer.memoryStorage(),
}).fields([
  { name: "file", maxCount: 1 },
  { name: "image", maxCount: 1 },
]);

export const uploadTrailer = multer({
  storage: multer.memoryStorage(),
});

export const uploadServer = multer({
  dest: "upload/",
});
