import category from "./module/category";

const updateDocuments = async () => {
  try {
    // Cập nhật tất cả các tài liệu trong bộ sưu tập
    const result = await category.updateMany(
      {},
      {
        $set: {
          year: "2023",
          isActive: 0,
          time: "15-20 Phút",
        },
      }
    );

  } catch (error) {
    console.error("Error updating documents:", error);
  }
};