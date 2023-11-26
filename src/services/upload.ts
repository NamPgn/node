import multer from "multer";
import User from "../module/auth";
import Product from "../module/products";
import { storage, storageProductImage, storageXlxs, storageXlxsProduct } from "../storage/storage";
import XLSX from 'xlsx';

//upload code logic
//user
export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => { //kiểm tra cái ảnh đấy pải là mấy cái dạng kia không
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else { //không thì cút
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
}).single('image');

//product
export const uploadProduct = multer({
  storage: storageProductImage,
  fileFilter: (req, file, cb) => { //kiểm tra cái ảnh đấy pải là mấy cái dạng kia không
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else { //không thì cút
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
}).single('image');


// upload excel user
export const uploadXlxs = async (req, res, next) => {
  try {
    let path = req.file.path;
    var workBok = XLSX.readFile(path);
    var sheet_name_list = workBok.SheetNames; //lấy ra cái tên
    let jsonData:any = XLSX.utils.sheet_to_json( //về dạng json
      workBok.Sheets[sheet_name_list[0]] //lấy cái bảng đầu tiên
    );
    if (jsonData.lenght == 0) { //kiểm tra neus không có gì thì cút
      res.json({
        message: "Not data"
      })
    }
    let saveData = await User.create(jsonData);
    res.json({
      suscess: true,
      message: "data" + saveData
    })
  } catch (error) {
  }
}

export const uploadStorageUser = multer({ storage: storageXlxs });



//upload excel product
export const uploadXlxsProducts = async (req, res, next) => {
  try {
    let path = req.file.path;
    var workBok = XLSX.readFile(path);
    var sheet_name_list = workBok.SheetNames; //lấy ra cái tên
    let jsonData:any = XLSX.utils.sheet_to_json( //về dạng json
      workBok.Sheets[sheet_name_list[0]] //lấy cái bảng đầu tiên
    );
    if (jsonData.lenght == 0) { //kiểm tra neus không có gì thì cút
      res.json({
        message: "Not data"
      })
    }
    let saveData = await Product.create(jsonData);
    res.json({
      suscess: true,
      message: "data" + saveData
    })
  } catch (error) {
  }
}
export const uploadStorageProduct = multer({ storage: storageXlxsProduct });


//video - upload


const storageVideosProducts = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/video-upload');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const uploadVideoProducts = multer({ storage: storageVideosProducts }); //upload video to local 




export const uploadvideoandimage = multer({
  storage: multer.memoryStorage(),
}).fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]);

export const uploadTrailer = multer({
  storage: multer.memoryStorage(),
})

export const uploadCategory = multer({
  storage: multer.memoryStorage(),
})

export const uploadServer = multer({
  dest: 'upload/'
})

export const uploadDinary = multer({
  storage: multer.memoryStorage(),
});