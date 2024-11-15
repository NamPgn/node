import cloudinary from "../config/cloudinary";
import Auth from "../module/auth";
import imageBackground from "../module/image.background";
import imageUser from "../module/image.user";

export const uploadUserImageToCloudDinary = async (req, res) => {
  try {
    const id = req.params.userId;
 
    // Nếu có file tải lên (ảnh)
    if (req.file) {
      cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "user",
          public_id: req.file.originalname,
          overwrite: true,
          width: 350,
          height: 200,
          crop: "fill",
          format: "webp",
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json(error);
          }

          const newImage = await new imageUser({
            url: result.url,
            user_id: id,
          }).save();

          const updateData:any = { $set: { image: newImage.url } };

          if (req.body.username) {
            updateData.$set.username = req.body.username;
          }

          const updatedUser = await Auth.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
          ).exec();

          return res.status(200).json({
            data: updatedUser,
            code: 200,
            success: true,
          });
        }
      );
    } else if (req.body.username) {
      // Nếu không có file tải lên nhưng có username, chỉ cập nhật username
      const updatedUser = await Auth.findByIdAndUpdate(
        id,
        { $set: { username: req.body.username } },
        { new: true }
      ).exec();

      return res.status(200).json({
        data: updatedUser,
        code: 200,
        success: true,
      });
    } else {
      return res.status(200).json({
        message: "Cần có file ảnh hoặc username để cập nhật.",
        code: 400,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      code: 500,
    });
  }
};


export const getImage = async (req, res) => {
  try {
    const data = await imageBackground.findOne();
    return res.status(200).json({
      data,
      code: 200,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      code: 500,
    });
  }
};

export const editBackground = (req, res) => {
  try {
    const id = req.params.id;
    cloudinary.uploader.upload(
      req.file.path,
      {
        folder: "background",
        public_id: req.file.originalname,
        overwrite: true,
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json(error);
        }
        const updatedUser = await imageBackground
          .findByIdAndUpdate(
            id,
            {
              $set: { url: result.url },
            },
            { new: true }
          )
          .exec();
        return res.status(200).json({
          data: updatedUser,
          code: 200,
          success: true,
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      code: 500,
    });
  }
};
