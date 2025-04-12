import express from 'express';
import {
  getAllSeasons,
  getSeasonById,
  createSeason,
  updateSeason,
  deleteSeason,
  addCategoriesToSeries,
  getSeriesCategories,
  removeCategoriesFromSeries,
  getSeriesByCategories,
  getAllSeasonsHeader
} from '../controller/season';

const router = express.Router();

// Get all series
router.get('/series', getAllSeasons);
  
router.get('/series/header', getAllSeasonsHeader);

// Get a single series by ID
router.get('/series/:slug', getSeasonById);

// Get series by categories
router.get('/series/:id/categories', getSeriesByCategories);

// Create a new series
router.post('/series', createSeason);

// Update a series
router.put('/series/:id', updateSeason);

// Delete a series
router.delete('/series/:id', deleteSeason);

// Add categories to a series
router.post('/series/:seriesId/categories', addCategoriesToSeries);

// Remove categories from a series
router.delete('/series/:seriesId/categories', removeCategoriesFromSeries);

// Get categories (with or without seriesId)
router.get('/categories/nominated', getSeriesCategories);

export default router;
