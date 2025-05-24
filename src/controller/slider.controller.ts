import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Slider from '../module/course.module';

// Extend Express Request type to include file
interface MulterRequest extends Request {
  file?: any;
}

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'sliders',
    allowed_formats: ['jpg', 'jpeg', 'png','webp'],
  } as any
});

// Configure multer upload
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('poster');

// Create new slider
export const createSlider = async (req: MulterRequest, res: Response) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: 'Unknown error occurred'
      });
    }

    try {

      const { name, anotherName, descriptions, type, quality, lang, isMovie, link } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'Poster image is required' 
        });
      }

      const poster = req.file.path;

      const slider = new Slider({
        name,
        anotherName,
        poster,
        descriptions,
        type,
        quality,
        lang,
        isMovie,
        link
      });

      const savedSlider = await slider.save();
      return res.status(201).json({ 
        success: true, 
        data: savedSlider 
      });
    } catch (error: any) {
      console.error('Error creating slider:', error);
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Internal server error'
      });
    }
  });
};

// Get all sliders
export const getAllSliders = async (req: Request, res: Response) => {
  try {
    const sliders = await Slider.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sliders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single slider
export const getSliderById = async (req: Request, res: Response) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ success: false, message: 'Slider not found' });
    }
    res.status(200).json({ success: true, data: slider });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update slider
export const updateSlider = async (req: MulterRequest, res: Response) => {
  upload(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Unknown error occurred'
      });
    }

    try {
      const { name, anotherName, descriptions, type, quality, lang, isMovie, link } = req.body;
      const updateData: any = {
        name,
        anotherName,
        descriptions,
        type,
        quality,
        lang,
        isMovie,
        link
      };

      if (req.file?.path) {
        // Delete old image from Cloudinary if exists
        const oldSlider = await Slider.findById(req.params.id);
        if (oldSlider?.poster) {
          const publicId = oldSlider.poster.split('/').pop()?.split('.')[0];
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
        updateData.poster = req.file.path;
      }

      const slider = await Slider.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!slider) {
        return res.status(404).json({ success: false, message: 'Slider not found' });
      }

      return res.status(200).json({ success: true, data: slider });
    } catch (error: any) {
      return res.status(500).json({ 
        success: false, 
        message: error.message || 'Internal server error'
      });
    }
  });
};

// Delete slider
export const deleteSlider = async (req: Request, res: Response) => {
  try {
    const slider = await Slider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({ success: false, message: 'Slider not found' });
    }

    // Delete image from Cloudinary if exists
    if (slider.poster) {
      const publicId = slider.poster.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await slider.deleteOne();
    res.status(200).json({ success: true, message: 'Slider deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { upload }; 