import Products from "../../module/products";

export const getProduct = async (id) => {
  const episode: any = await Products.findOne({ slug: id })
.select('-LinkCopyright -trailer -rating -comments -updatedAt -__v -select')
.populate({
  path: "category",
  select: "-__v -createdAt -comment -searchCount -week -tags -rating -ratingCount -country -upcomingReleases -relatedSeasons -isDeleted -season -hour",
  populate: [
    {
      path: "combiningEpisodes",
      model: "combiningEpisodes",
      select: "link1 link2 link3 name slug episodesName",
    }
  ]
});
episode?.category?.combiningEpisodes?.sort((a, b) => {
const getStartEp = (ep) => parseInt(ep.episodesName?.split("-")[0]);
return getStartEp(b) - getStartEp(a);
});
return episode;
};
