import Products from "../module/products";

export const getProductCount = async (categoryId?: string, seri?: string) => {
  let query: any = {};

  if (categoryId) {
    query.category = categoryId;
  }

  if (seri) {
    query.seri = { $regex: seri, $options: 'i' };
  }

  return await Products.countDocuments(query);
};

export const getAll = async (page: number, limit: number, categoryId?: string, seri?: string) => {
  const skip = (page - 1) * limit;

  // Xây dựng query filter
  let query: any = {};

  if (categoryId) {
    query.category = categoryId;
  }

  if (seri) {
    query.seri = { $regex: seri, $options: 'i' }; // Tìm kiếm seri không phân biệt hoa thường
  }

  return await Products.find(query)
    .select('name slug category seri uploadDate dailyMotionServer voiceOverLink thumnail')
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 })
    .populate("category", "lang quality name")
    .exec();
};

export const getOneEpisode = async (id) => {
  const episode: any = await Products.findOne({ slug: id })
    .select('-LinkCopyright -trailer -rating -comments -updatedAt -__v -select')
    .populate({
      path: "category",
      select: "-__v -createdAt -comment -searchCount -week -rating -ratingCount -country -upcomingReleases -relatedSeasons -isDeleted -season -hour",
      populate: [
        {
          path: "products",
          model: "Products",
          select: "seri slug -_id thumnail",
        },
        {
          path: "combiningEpisodes",
          model: "combiningEpisodes",
          select: "link1 link2 link3 name slug episodesName",
        },
        {
          path: "tags",
          model: "Tags",
          select: "name",
        }
      ]
    });
  episode?.category?.combiningEpisodes?.sort((a, b) => {
    const getStartEp = (ep) => parseInt(ep.episodesName?.split("-")[0]);
    return getStartEp(b) - getStartEp(a);
  });
  return episode;
};


export const addProduct_ = async (data) => {
  return new Products(data).save();
};

export const deleteProduct = async (id) => {
  return await Products.findOneAndDelete({ _id: id });
};

export const editProductSevices = async (id, data) => {
  return await Products.findOneAndUpdate({ _id: id }, data);
};

export const addVoiceOverBySlug = async (slug, voiceOverLink, voiceOverLink2) => {
  return await Products.findOneAndUpdate({ slug }, { $set: { voiceOverLink, voiceOverLink2 } }, { new: true });
};

export const getVoiceOverBySlug = async (slug) => {
  return await Products.findOne({ slug }).select("voiceOverLink voiceOverLink2");
};

