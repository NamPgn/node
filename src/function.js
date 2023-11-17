const updateDocuments = async () => {
  try {
    // Cập nhật tất cả các tài liệu trong bộ sưu tập
    const result = await Category.updateMany(
      {},
      {
        $set: {
          year: "2023",
          isActive: 0,
          time: "15-20 Phút",
        },
      }
    );

    console.log(`${result} documents updated successfully.`);
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};