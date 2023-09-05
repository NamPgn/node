import trailerHomePageModel from "../module/trailer.home";

export const getTrailerHomePageUrlSevices = async () => {
  return await trailerHomePageModel.find();
}

export const editTrailerHomePageUrlSevices = async (id, data) => {
  return await trailerHomePageModel.findByIdAndUpdate(id, data);
}

export const getTrailerUrlSevices = async (id) => await trailerHomePageModel.findOne();