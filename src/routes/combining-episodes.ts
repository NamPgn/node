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
import { checkToken, isAdmin, isAuth, requiredSignin } from "../middlewares/checkAuth";

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
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin
  ],
  createCombiningEpisodesController
);

// Update combining episodes
router.put(
  ROUTES.COMBINING_EPISODES.UPDATE,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin
  ],
  updateCombiningEpisodesController
);

// Delete combining episodes
router.delete(
  ROUTES.COMBINING_EPISODES.DELETE,
  [
    checkToken,
    requiredSignin,
    isAuth,
    isAdmin
  ],
  deleteCombiningEpisodesController
);

export default router;
