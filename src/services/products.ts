import Products from "../module/products";

// Helper function để xây dựng query
const buildQuery = (categoryId?: string, seri?: string) => {
  let query: any = {};

  if (categoryId) {
    query.category = categoryId;
  }

  if (seri) {
    query.seri = { $regex: seri, $options: 'i' };
  }

  return query;
};

// Helper function để filter theo version
const filterByVersion = (episodes: any[], version: string) => {
  return episodes.filter((episode: any) => {
    if (!episode.category || !episode.category.vs) return false;
    return episode.category.vs === version;
  });
};

export const getProductCount = async (categoryId?: string, seri?: string, version?: string) => {
  const query = buildQuery(categoryId, seri);

  // Nếu có version, cần filter theo version của category
  if (version) {
    // Lấy tất cả episodes trước
    const episodes: any = await Products.find(query)
      .select('category')
      .populate({
        path: "category",
      })
      .exec();
    // Filter theo version của category
    const episodesFiltered = filterByVersion(episodes, version);
    return episodesFiltered.length;
  }

  return await Products.countDocuments(query);
};

export const getAll = async (page: number, limit: number, categoryId?: string, seri?: string, version?: string) => {
  const skip = (page - 1) * limit;
  const query = buildQuery(categoryId, seri);

  // Nếu có version, cần lấy tất cả episodes trước để filter đúng
  if (version) {
    // Lấy tất cả episodes của category/query
    const allEpisodes: any = await Products.find(query)
      .select('name slug category seri uploadDate dailyMotionServer voiceOverLink thumnail')
      .sort({ _id: -1 })
      .populate({
        path: "category",
        select: "lang quality name vs",
      })
      .exec();

    // Filter theo version
    const filteredEpisodes = filterByVersion(allEpisodes, version);
    
    // Thực hiện pagination trên kết quả đã filter
    const startIndex = skip;
    const endIndex = skip + limit;
    return filteredEpisodes.slice(startIndex, endIndex);
  }

  // Nếu không có version, sử dụng pagination bình thường
  const episodes: any = await Products.find(query)
    .select('name slug category seri uploadDate dailyMotionServer voiceOverLink thumnail')
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 })
    .populate({
      path: "category",
      select: "lang quality name vs",
    })
    .exec();

  return episodes;
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

// Lấy tất cả episodes theo category và version
export const getAllEpisodesByCategoryAndVersion = async (categoryId: string, version: string) => {
  const query = buildQuery(categoryId);

  // Lấy tất cả episodes của category
  const episodes: any = await Products.find(query)
    .select('name slug category seri uploadDate dailyMotionServer voiceOverLink thumnail')
    .sort({ seri: 1 }) // Sắp xếp theo số tập
    .populate({
      path: "category",
      select: "lang quality name vs",
    })
    .exec();

  // Filter theo version của category nếu có
  if (version) {
    return filterByVersion(episodes, version);
  }

  return episodes;
};

