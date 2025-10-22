# Feature Banner API Documentation

## Tổng quan
API Feature Banner cho phép quản lý danh sách các category nổi bật hiển thị trên trang chủ. Mỗi feature banner sẽ reference đến một category và có thể sắp xếp thứ tự hiển thị.

## Base URL
```
http://your-domain.com/api
```

## Authentication
Các endpoint tạo, sửa, xóa yêu cầu:
- Bearer Token trong header
- Role: Admin hoặc Super Admin

---

## Endpoints

### 1. Lấy danh sách Feature Banners
**GET** `/feature-banners`

**Query Parameters:**
- `isActive` (optional): `true` | `false` - Lọc theo trạng thái

**Response:**
```json
{
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "category": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
        "name": "Đấu Phá Thương Khung",
        "slug": "dau-pha-thuong-khung",
        "linkImg": "https://example.com/image.jpg",
        "des": "Mô tả phim...",
        "rating": [5, 4, 5, 5],
        "ratingCount": 4,
        "status": "pending",
        "year": "2024",
        "country": "Trung Quốc",
        "quality": "FHD",
        "lang": "Vietsub",
        "newMovie": true,
        "products": ["id1", "id2"],
        "sumSeri": "50"
      },
      "title": "Đấu Phá Thương Khung",
      "description": "Mô tả...",
      "order": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 5
}
```

---

### 2. Lấy chi tiết Feature Banner theo ID
**GET** `/feature-banner/:id`

**Response:**
```json
{
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "category": { /* category object */ },
    "title": "Đấu Phá Thương Khung",
    "description": "Mô tả...",
    "order": 1,
    "isActive": true
  }
}
```

---

### 3. Tạo Feature Banner mới (Admin)
**POST** `/feature-banner`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "categoryId": "64a1b2c3d4e5f6g7h8i9j0k2",
  "title": "Đấu Phá Thương Khung",
  "description": "Mô tả tùy chỉnh (optional)",
  "order": 1,
  "isActive": true
}
```

**Response:**
```json
{
  "data": { /* created feature banner */ },
  "message": "Feature banner đã được tạo thành công!"
}
```

**Errors:**
- `400`: Category ID bắt buộc / Category đã tồn tại trong danh sách
- `404`: Không tìm thấy category
- `401`: Unauthorized
- `403`: Forbidden (không có quyền admin)

---

### 4. Cập nhật Feature Banner (Admin)
**PUT** `/feature-banner/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "categoryId": "64a1b2c3d4e5f6g7h8i9j0k3",
  "title": "Tiêu đề mới",
  "description": "Mô tả mới",
  "order": 2,
  "isActive": false
}
```

**Response:**
```json
{
  "message": "Feature banner đã được cập nhật!",
  "data": { /* updated feature banner */ }
}
```

---

### 5. Xóa Feature Banner (Admin)
**DELETE** `/feature-banner/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Feature banner đã được xóa thành công!"
}
```

---

### 6. Cập nhật thứ tự hiển thị (Admin)
**PUT** `/feature-banners/update-order`

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "orders": [
    { "id": "64a1b2c3d4e5f6g7h8i9j0k1", "order": 1 },
    { "id": "64a1b2c3d4e5f6g7h8i9j0k2", "order": 2 },
    { "id": "64a1b2c3d4e5f6g7h8i9j0k3", "order": 3 }
  ]
}
```

**Response:**
```json
{
  "message": "Cập nhật thứ tự thành công!",
  "data": [ /* sorted feature banners */ ]
}
```

---

### 7. Bật/Tắt trạng thái Feature Banner (Admin)
**PATCH** `/feature-banner/:id/toggle-status`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Feature banner đã được kích hoạt!",
  "data": { /* updated feature banner */ }
}
```

---

## Model Schema

### FeatureBanner
```typescript
{
  _id: ObjectId,
  category: ObjectId (ref: Category) - required,
  title: String - optional (mặc định lấy từ category.name),
  description: String - optional (mặc định lấy từ category.des),
  order: Number - default: 0 (sắp xếp hiển thị),
  isActive: Boolean - default: true,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Business Rules

1. **Unique Category**: Mỗi category chỉ có thể tồn tại trong 1 feature banner
2. **Auto Populate**: Khi tạo mới, nếu không cung cấp title/description, sẽ tự động lấy từ category
3. **Sorting**: Feature banners được sắp xếp theo `order` ASC, sau đó `createdAt` DESC
4. **Indexing**: Có index trên `order`, `isActive`, và `category` để tăng tốc query

---

## Use Cases

### Frontend - Hiển thị categories nổi bật trên trang chủ
```javascript
const response = await fetch('/api/feature-banners?isActive=true');
const { data } = await response.json();

// Render featured categories
data.forEach(feature => {
  const { category, title, description } = feature;
  // Display category with custom title/description
});
```

### Admin - Quản lý danh sách nổi bật
```javascript
// Thêm category vào danh sách nổi bật
await fetch('/api/feature-banner', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    categoryId: '64a1b2c3d4e5f6g7h8i9j0k2',
    order: 1
  })
});

// Sắp xếp lại thứ tự
await fetch('/api/feature-banners/update-order', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orders: [
      { id: 'id1', order: 1 },
      { id: 'id2', order: 2 }
    ]
  })
});
```

---

## Notes
- Khi xóa category, nên xóa feature banner tương ứng (có thể implement cascade delete)
- Frontend nên cache kết quả `/feature-banners?isActive=true` vì dữ liệu ít thay đổi
- Recommend giới hạn số lượng feature banners (5-10) để tối ưu UX


