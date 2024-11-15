export const resizeImagesUrl = (
  data: any,
  key: string,
  width: number,
  height: number,
  format: string = "webp"
) => {
  return data.map((item) => {
    const originalUrl = item[key]; // URL gốc từ database

    if (!originalUrl) return item; // Nếu không có URL thì giữ nguyên đối tượng ban đầu

    // Chuyển đổi URL theo kích thước và định dạng
    const transformedUrl = originalUrl.replace(
      /\/upload\/(.*?\/)?/, // Tìm đoạn `/upload/`
      `/upload/w_${width},h_${height},c_fill,f_${format}/` // Thay bằng tham số mới
    );

    // Trả về đối tượng với URL đã chuyển đổi
    return {
      ...item,
      [key]: transformedUrl, // Cập nhật URL cho key cần thay đổi
    };
  });
};

export const resizeImageUrl = (
  image: any,
  width: number,
  height: number,
  format: string = "webp"
) => {
  if (!image) return image;

  const transformedUrl = image.replace(
    /\/upload\/(.*?\/)?/, // Tìm đoạn `/upload/`
    `/upload/w_${width},h_${height},c_fill,f_${format}/`
  );

  return transformedUrl;
};
