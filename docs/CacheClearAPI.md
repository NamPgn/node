# Cache Clear API Documentation

## Tổng quan
API `clearCacheProducts` cho phép xóa cache Redis theo nhiều pattern khác nhau, giúp quản lý cache hiệu quả và linh hoạt.

## Endpoint
```
DELETE /api/products/clear-cache
```

## Query Parameters

### 1. Xóa tất cả cache products
```http
DELETE /api/products/clear-cache?type=all
```
**Mô tả:** Xóa tất cả keys cache có pattern `products*`

**Response:**
```json
{
  "success": true,
  "message": "Cleared all products cache (15 keys)",
  "data": {
    "deletedKeys": ["products_page_1_no-cat_no-seri", "products_page_2_category_123_no-seri", ...],
    "count": 15
  }
}
```

### 2. Xóa cache theo page cụ thể
```http
DELETE /api/products/clear-cache?type=page&page=1
```
**Mô tả:** Xóa tất cả cache của page 1 (pattern: `products_page_1*`)

**Response:**
```json
{
  "success": true,
  "message": "Cleared cache for page 1 (3 keys)",
  "data": {
    "deletedKeys": ["products_page_1_no-cat_no-seri", "products_page_1_category_123_no-seri", "products_page_1_no-cat_seri_abc"],
    "count": 3
  }
}
```

### 3. Xóa cache theo nhiều pages
```http
DELETE /api/products/clear-cache?type=pages&page=1,2,3
```
**Mô tả:** Xóa cache của page 1, 2, và 3

**Response:**
```json
{
  "success": true,
  "message": "Cleared cache for pages 1, 2, 3 (9 keys)",
  "data": {
    "deletedKeys": ["products_page_1_no-cat_no-seri", "products_page_2_category_123_no-seri", ...],
    "count": 9
  }
}
```

### 4. Xóa cache theo range pages
```http
DELETE /api/products/clear-cache?type=range&startPage=1&endPage=5
```
**Mô tả:** Xóa cache từ page 1 đến page 5

**Response:**
```json
{
  "success": true,
  "message": "Cleared cache for pages 1-5 (15 keys)",
  "data": {
    "deletedKeys": ["products_page_1_no-cat_no-seri", "products_page_2_category_123_no-seri", ...],
    "count": 15
  }
}
```

### 5. Xóa cache theo category
```http
DELETE /api/products/clear-cache?type=category&categoryId=507f1f77bcf86cd799439011
```
**Mô tả:** Xóa tất cả cache có chứa category ID này (pattern: `*category_507f1f77bcf86cd799439011*`)

**Response:**
```json
{
  "success": true,
  "message": "Cleared cache for category 507f1f77bcf86cd799439011 (4 keys)",
  "data": {
    "deletedKeys": ["products_page_1_category_507f1f77bcf86cd799439011_no-seri", "products_page_2_category_507f1f77bcf86cd799439011_seri_abc"],
    "count": 4
  }
}
```

### 6. Xóa cache theo seri
```http
DELETE /api/products/clear-cache?type=seri&seri=abc
```
**Mô tả:** Xóa tất cả cache có chứa seri này (pattern: `*seri_abc*`)

**Response:**
```json
{
  "success": true,
  "message": "Cleared cache for seri abc (2 keys)",
  "data": {
    "deletedKeys": ["products_page_1_category_123_seri_abc", "products_page_2_no-cat_seri_abc"],
    "count": 2
  }
}
```

### 7. Xóa cache theo pattern tùy chỉnh
```http
DELETE /api/products/clear-cache?type=pattern&pattern=products_page_*_category_123_*
```
**Mô tả:** Xóa cache theo pattern tùy chỉnh (hỗ trợ wildcard `*`)

**Response:**
```json
{
  "success": true,
  "message": "Cleared cache matching pattern \"products_page_*_category_123_*\" (3 keys)",
  "data": {
    "deletedKeys": ["products_page_1_category_123_no-seri", "products_page_2_category_123_seri_abc"],
    "count": 3
  }
}
```

### 8. Xóa cache mặc định (không có type)
```http
DELETE /api/products/clear-cache
```
**Mô tả:** Xóa key cache cũ `products` (backward compatibility)

**Response:**
```json
{
  "success": true,
  "message": "Cleared default products cache",
  "data": {
    "deletedKeys": ["products"],
    "count": 1
  }
}
```

## Cache Key Patterns

### Cấu trúc key cache:
```
products_page_{pageNumber}_{category}_{seri}
```

### Ví dụ các key thực tế:
- `products_page_1_no-cat_no-seri` - Page 1, không filter category, không filter seri
- `products_page_2_category_507f1f77bcf86cd799439011_no-seri` - Page 2, category cụ thể, không filter seri
- `products_page_1_no-cat_seri_abc` - Page 1, không filter category, seri cụ thể
- `products_page_3_category_507f1f77bcf86cd799439011_seri_abc` - Page 3, cả category và seri cụ thể

## Các trường hợp sử dụng thực tế

### 1. Khi thêm/sửa/xóa sản phẩm
```bash
# Xóa cache của tất cả pages để đảm bảo dữ liệu mới nhất
curl -X DELETE "http://localhost:3000/api/products/clear-cache?type=all"
```

### 2. Khi thay đổi category
```bash
# Xóa cache của category cụ thể
curl -X DELETE "http://localhost:3000/api/products/clear-cache?type=category&categoryId=507f1f77bcf86cd799439011"
```

### 3. Khi cần xóa cache của pages đầu tiên
```bash
# Xóa cache page 1-3 (thường là pages được xem nhiều nhất)
curl -X DELETE "http://localhost:3000/api/products/clear-cache?type=range&startPage=1&endPage=3"
```

### 4. Khi có vấn đề với cache cụ thể
```bash
# Xóa cache theo pattern cụ thể
curl -X DELETE "http://localhost:3000/api/products/clear-cache?type=pattern&pattern=products_page_*_category_*_seri_abc"
```

## Error Handling

### 1. Missing required parameters
```json
{
  "success": false,
  "message": "Page parameter is required for page-based clearing"
}
```

### 2. No cache found
```json
{
  "success": true,
  "message": "No cache found for page 10",
  "data": {
    "deletedKeys": [],
    "count": 0
  }
}
```

### 3. Server error
```json
{
  "success": false,
  "message": "Error clearing cache",
  "error": "Redis connection failed"
}
```

## Performance Notes

1. **Bulk Operations:** Sử dụng `redisDel(...keys)` để xóa nhiều keys cùng lúc
2. **Pattern Matching:** Redis `KEYS` command có thể chậm với database lớn, nên sử dụng cẩn thận
3. **Memory Usage:** Xóa cache thường xuyên để tránh memory leak
4. **Monitoring:** Theo dõi số lượng keys được xóa để đảm bảo hiệu quả

## Best Practices

1. **Selective Clearing:** Thay vì xóa tất cả, hãy xóa cache cụ thể
2. **Scheduled Clearing:** Có thể schedule clear cache theo thời gian
3. **Event-driven Clearing:** Clear cache khi có thay đổi dữ liệu
4. **Monitoring:** Log các hoạt động clear cache để debug

## Integration với Frontend

```javascript
// Clear all cache
const clearAllCache = async () => {
  const response = await fetch('/api/products/clear-cache?type=all', {
    method: 'DELETE'
  });
  const result = await response.json();
  console.log(result.message); // "Cleared all products cache (15 keys)"
};

// Clear specific pages
const clearPagesCache = async (pages) => {
  const response = await fetch(`/api/products/clear-cache?type=pages&page=${pages.join(',')}`, {
    method: 'DELETE'
  });
  const result = await response.json();
  return result;
};
```
