# Hướng dẫn cấu hình Server cho React Native qua mạng LAN

## Những thay đổi đã thực hiện

### 1. Server Configuration (`app.ts`)
- Server bây giờ lắng nghe trên `0.0.0.0` thay vì `localhost`
- Cho phép truy cập từ tất cả các thiết bị trong mạng LAN

### 2. CORS Configuration (`src/config/express.ts`)
- Tự động chấp nhận các request từ:
  - Tất cả các IP trong mạng LAN (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  - Localhost và 127.0.0.1
  - Mobile apps không có origin header
  - Tất cả các domain trong ALLOWED_ORIGINS

## Cách sử dụng

### Bước 1: Tìm địa chỉ IP của máy tính (Server)

**Windows:**
```bash
ipconfig
```
Tìm dòng `IPv4 Address` trong phần `Wireless LAN adapter Wi-Fi` hoặc `Ethernet adapter`

**macOS/Linux:**
```bash
ifconfig
# hoặc
ip addr show
```

Ví dụ: `192.168.1.100`

### Bước 2: Khởi động Server

```bash
cd node
npm run dev
```

Server sẽ chạy trên: `http://0.0.0.0:8080`

### Bước 3: Cấu hình React Native App

Trong React Native app của bạn, sử dụng địa chỉ IP của máy tính thay vì `localhost`:

```javascript
// Thay vì:
const API_URL = 'http://localhost:8080';

// Sử dụng IP của máy tính:
const API_URL = 'http://192.168.1.100:8080';
```

### Bước 4: Đảm bảo cùng mạng WiFi
- Máy tính (chạy server) và điện thoại/máy ảo phải kết nối cùng mạng WiFi

## Test API

Từ điện thoại/máy ảo, mở browser hoặc sử dụng app và truy cập:
```
http://192.168.1.100:8080
```

Bạn sẽ thấy: `API is running 🚀`

## Các IP Pattern được hỗ trợ

- `http://192.168.x.x:port` - Mạng LAN thông thường
- `http://10.x.x.x:port` - Mạng doanh nghiệp
- `http://172.16-31.x.x:port` - Mạng Docker/VPN
- `http://localhost:port` - Local development
- `http://127.0.0.1:port` - Loopback

## Lưu ý bảo mật

⚠️ **Cấu hình này chỉ dành cho môi trường development!**

- Server đang mở cho tất cả IP trong mạng LAN
- Không sử dụng cấu hình này cho production
- Đảm bảo firewall của bạn được cấu hình đúng

## Troubleshooting

### Không kết nối được từ điện thoại?

1. **Kiểm tra Firewall:**
   - Windows: Cho phép port 8080 qua Windows Firewall
   - macOS: System Preferences > Security & Privacy > Firewall
   
2. **Kiểm tra cùng mạng WiFi:**
   ```bash
   # Trên điện thoại, kiểm tra IP gateway phải giống máy tính
   ```

3. **Kiểm tra server đang chạy:**
   ```bash
   # Trên máy tính
   netstat -an | findstr :8080    # Windows
   # hoặc
   lsof -i :8080                   # macOS/Linux
   ```

4. **Test bằng Postman/Browser trên máy tính trước:**
   ```
   http://192.168.1.100:8080
   ```

### React Native không gọi được API?

1. **Kiểm tra URL trong app:**
   ```javascript
   console.log('API_URL:', API_URL);
   ```

2. **Kiểm tra CORS error trong console:**
   - Nếu có lỗi CORS, kiểm tra pattern IP trong `express.ts`

3. **Sử dụng adb reverse (chỉ Android):**
   ```bash
   adb reverse tcp:8080 tcp:8080
   # Sau đó có thể dùng localhost:8080 trong app
   ```

## Environment Variables

Nếu muốn đổi port, cập nhật file `.env`:
```env
PORT_LOCAL=8080
```

## Performance Note

Rate limiting hiện tại: **2000 requests/15 phút**

Nếu cần tăng cho development, chỉnh trong `app.ts`:
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // Tăng lên nếu cần
  // ...
});
```

