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

// Hàm mới để resize ảnh Cloudinary - đơn giản và hiệu quả
export const resizeCloudinaryImage = (
  imageUrl: string,
  width: number,
  height: number,
  format: string = "webp"
): string => {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return imageUrl;
  }

  // Kiểm tra xem có phải URL Cloudinary không
  if (!imageUrl.includes('cloudinary.com') || !imageUrl.includes('/upload/')) {
    return imageUrl;
  }

  // Tách URL thành các phần
  const parts = imageUrl.split('/upload/');
  if (parts.length !== 2) {
    return imageUrl;
  }

  const baseUrl = parts[0] + '/upload/';
  const pathAfterUpload = parts[1];

  // Tạo transformation string
  const transformation = `w_${width},h_${height},c_fill,f_${format}`;
  
  // Ghép lại URL với transformation
  const resizedUrl = `${baseUrl}${transformation}/${pathAfterUpload}`;
  
  return resizedUrl;
};
