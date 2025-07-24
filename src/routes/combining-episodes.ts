import express from "express";
import { ROUTES } from "../constants/routes.constant";
import {
  createCombiningEpisodesController,
  deleteCombiningEpisodesController,
  getCombiningEpisodesByIdController,
  getCombiningEpisodesByCategorySlugController,
  getListCombiningEpisodesController,
  updateCombiningEpisodesController,
} from "../controller/combining-episodes";

const router = express.Router();

// Get all combining episodes
router.get(
  ROUTES.COMBINING_EPISODES.GET_ALL,
  getListCombiningEpisodesController
);

// Get combining episodes by ID
router.get(
  ROUTES.COMBINING_EPISODES.GET_BY_ID,
  getCombiningEpisodesByIdController
);

// Get combining episodes by category slug
router.get(
  ROUTES.COMBINING_EPISODES.GET_BY_CATEGORY_SLUG,
  getCombiningEpisodesByCategorySlugController
);

// Create new combining episodes
router.post(
  ROUTES.COMBINING_EPISODES.CREATE,

  createCombiningEpisodesController
);

// Update combining episodes
router.put(
  ROUTES.COMBINING_EPISODES.UPDATE,

  updateCombiningEpisodesController
);

// Delete combining episodes
router.delete(
  ROUTES.COMBINING_EPISODES.DELETE,
  deleteCombiningEpisodesController
);

export default router;
