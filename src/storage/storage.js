//tạo storage để lưu trữ
//storage user
import multer from "multer";

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-'); //lấy ra cái ảnh 
    cb(null, Date.now() + fileName)
  }
});
//storage product
export const storageProductImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/product");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-'); //lấy ra cái ảnh 
    cb(null, Date.now() + fileName)
  }
});

//storagexlxs
export const storageXlxs = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/xlxs");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})


//xlsx product
export const storageXlxsProduct = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/xlxsProduct");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})


//video-upload storage

export const storageVideoUpload = multer.diskStorage({ //upload video to local
  destination: function (req, file, cb) {
    cb(null, 'public/video-upload/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});


//video upload to server storage



