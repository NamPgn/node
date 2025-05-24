import express from 'express';
import {
  createSlider,
  getAllSliders,
  getSliderById,
  updateSlider,
  deleteSlider,
} from '../controller/slider.controller';

const router = express.Router();

// Create new slider
router.post('/poster', createSlider);

// Get all sliders
router.get('/poster', getAllSliders);

// Get single slider
router.get('/poster/:id', getSliderById);

// Update slider
router.put('/poster/:id',  updateSlider);

// Delete slider
router.delete('/poster/:id', deleteSlider);

export default router; 