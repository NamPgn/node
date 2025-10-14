# 🚀 Gửi Push Notification KHÔNG CẦN ĐĂNG NHẬP

## 🎯 Tổng quan

Endpoint này cho phép gửi push notification **mà không cần JWT token**, chỉ cần **SECRET_KEY**.  
Rất hữu ích khi bạn muốn gửi notification từ:
- ✅ Script/Cron job
- ✅ Webhook từ service khác
- ✅ Admin panel riêng
- ✅ Mobile app/Desktop app
- ✅ Postman/cURL/Thunder Client

## ⚙️ Setup

### 1. Thêm SECRET_KEY vào `.env`:

```env
NOTIFICATION_SECRET_KEY=your-super-secret-key-change-this-to-random-string
```

**Lưu ý:** Hãy dùng key ngẫu nhiên, dài và phức tạp để bảo mật!

Ví dụ generate key:
```bash
# Linux/Mac
openssl rand -hex 32

# Hoặc online
https://randomkeygen.com/
```

### 2. Restart server:

```bash
npm run dev
```

## 📡 API Endpoint

### **POST** `/api/notification/send`

**Không cần Authorization header!** Chỉ cần `secretKey` trong body.

---

## 🔥 Cách sử dụng

### 1️⃣ Gửi notification đơn giản (Custom message)

**Gửi đến TẤT CẢ devices:**

```bash
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-super-secret-key-change-this-to-random-string",
    "title": "Thông báo bảo trì",
    "body": "Hệ thống sẽ bảo trì từ 2h-4h sáng ngày mai",
    "data": {
      "type": "announcement",
      "customField": "any value"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "result": {
    "success": true,
    "data": { ... }
  }
}
```

---

**Gửi đến 1 device cụ thể:**

```bash
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key",
    "title": "Tài khoản VIP",
    "body": "Gói VIP của bạn sắp hết hạn!",
    "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
    "data": {
      "type": "account",
      "userId": "123"
    }
  }'
```

---

### 2️⃣ Gửi notification "Tập mới"

**Tự động format message phù hợp:**

```bash
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key",
    "type": "new_episode",
    "categoryName": "Hoàn Mỹ Thế Giới",
    "categorySlug": "hoan-my-the-gioi",
    "episode": "12"
  }'
```

**Notification sẽ gửi:**
```
Title: "Tập 12 mới đã ra! 🎬"
Body: "Hoàn Mỹ Thế Giới - Tập 12 vừa được cập nhật"
Data: {
  type: "new_episode",
  categorySlug: "hoan-my-the-gioi",
  episode: "12"
}
```

---

### 3️⃣ Gửi notification "Phim mới"

```bash
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key",
    "type": "new_category",
    "categoryName": "Thần Ấn Vương Tọa",
    "categorySlug": "than-an-vuong-toa"
  }'
```

**Notification sẽ gửi:**
```
Title: "Phim mới đã ra mắt! 🎉"
Body: "Thần Ấn Vương Tọa đã được thêm vào thư viện"
Data: {
  type: "new_category",
  categorySlug: "than-an-vuong-toa"
}
```

---

## 🖥️ Ví dụ từ JavaScript/TypeScript

### Node.js / Deno:

```typescript
import axios from 'axios';

async function sendNotification() {
  try {
    const response = await axios.post('http://localhost:8080/api/notification/send', {
      secretKey: process.env.NOTIFICATION_SECRET_KEY,
      title: 'Thông báo mới',
      body: 'Đây là notification từ script',
      data: {
        type: 'announcement'
      }
    });

    console.log('✅ Sent:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

sendNotification();
```

---

### Browser / Frontend:

```javascript
async function notifyUsers() {
  const response = await fetch('http://localhost:8080/api/notification/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      secretKey: 'your-secret-key', // ⚠️ KHÔNG hardcode trong production!
      title: 'Sự kiện đặc biệt',
      body: 'Xem phim miễn phí VIP cả tuần!'
    })
  });

  const data = await response.json();
  console.log(data);
}
```

**⚠️ Lưu ý bảo mật:** Không hardcode SECRET_KEY trong frontend code!  
Nên gọi từ backend của bạn thay vì frontend.

---

### Python:

```python
import requests

def send_notification():
    url = "http://localhost:8080/api/notification/send"
    payload = {
        "secretKey": "your-secret-key",
        "type": "new_episode",
        "categoryName": "Hoàn Mỹ Thế Giới",
        "categorySlug": "hoan-my-the-gioi",
        "episode": "15"
    }
    
    response = requests.post(url, json=payload)
    print(response.json())

send_notification()
```

---

## 🤖 Automation Examples

### 1. Cron Job (gửi notification hàng ngày)

**cron-notification.js:**
```javascript
const axios = require('axios');

async function sendDailyReminder() {
  await axios.post('http://localhost:8080/api/notification/send', {
    secretKey: process.env.NOTIFICATION_SECRET_KEY,
    title: '🎬 Phim mới hôm nay',
    body: 'Hãy check xem có phim gì mới nhé!',
    data: { type: 'daily_reminder' }
  });
}

// Chạy mỗi ngày 8h sáng
const cron = require('node-cron');
cron.schedule('0 8 * * *', sendDailyReminder);
```

---

### 2. Webhook từ service khác

**webhook-handler.js:**
```javascript
// Express route nhận webhook
app.post('/webhook/new-content', async (req, res) => {
  const { contentType, title, slug } = req.body;
  
  // Gửi notification khi có content mới
  await axios.post('http://localhost:8080/api/notification/send', {
    secretKey: process.env.NOTIFICATION_SECRET_KEY,
    type: contentType === 'episode' ? 'new_episode' : 'new_category',
    categoryName: title,
    categorySlug: slug,
    episode: contentType === 'episode' ? req.body.episode : undefined
  });
  
  res.json({ success: true });
});
```

---

### 3. Admin Dashboard (không cần JWT)

```typescript
// Admin panel - Send custom notification
async function sendCustomNotification(formData) {
  const response = await fetch('https://api.yoursite.com/api/notification/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secretKey: getSecretKeyFromSecureStorage(), // Lưu trong env/secure storage
      title: formData.title,
      body: formData.body,
      data: formData.customData
    })
  });
  
  return response.json();
}
```

---

## 🔐 Bảo mật

### ✅ Best Practices:

1. **SECRET_KEY phải:**
   - Dài tối thiểu 32 ký tự
   - Random và phức tạp
   - Khác hoàn toàn với JWT secret
   - Lưu trong `.env`, KHÔNG commit vào Git

2. **Sử dụng:**
   - Chỉ từ backend/server của bạn
   - Qua HTTPS trong production
   - Rate limiting để tránh spam

3. **Không nên:**
   - Hardcode trong frontend code
   - Share công khai
   - Dùng chung với các service khác

---

## ❌ Error Handling

### Invalid Secret Key:
```json
{
  "success": false,
  "message": "Invalid secret key"
}
// HTTP 401
```

### Missing Fields:
```json
{
  "success": false,
  "message": "Title and body are required"
}
// HTTP 400
```

### No Active Tokens:
```json
{
  "success": false,
  "message": "No active tokens",
  "result": {
    "success": false,
    "message": "No active tokens"
  }
}
// HTTP 200 (vẫn success nhưng không gửi được vì không có device)
```

---

## 📊 Request Body Options

### Tất cả fields có thể dùng:

```typescript
{
  // REQUIRED
  secretKey: string;         // Secret key từ .env
  
  // Option 1: Custom notification
  title: string;             // Tiêu đề notification
  body: string;              // Nội dung notification
  token?: string;            // (Optional) Gửi đến 1 device cụ thể
  data?: object;             // (Optional) Custom data
  
  // Option 2: New Episode (tự động format)
  type: "new_episode";
  categoryName: string;      // Tên phim
  categorySlug: string;      // Slug để navigate
  episode: string | number;  // Số tập
  
  // Option 3: New Category (tự động format)
  type: "new_category";
  categoryName: string;      // Tên phim
  categorySlug: string;      // Slug để navigate
}
```

---

## 🧪 Testing với Postman/Thunder Client

### Import vào Postman:

```json
{
  "name": "Send Push Notification (No Auth)",
  "request": {
    "method": "POST",
    "header": [
      {
        "key": "Content-Type",
        "value": "application/json"
      }
    ],
    "body": {
      "mode": "raw",
      "raw": "{\n  \"secretKey\": \"{{NOTIFICATION_SECRET}}\",\n  \"title\": \"Test Notification\",\n  \"body\": \"This is a test\"\n}"
    },
    "url": {
      "raw": "{{BASE_URL}}/api/notification/send",
      "host": ["{{BASE_URL}}"],
      "path": ["api", "notification", "send"]
    }
  }
}
```

**Environment Variables:**
```
BASE_URL: http://localhost:8080
NOTIFICATION_SECRET: your-secret-key-here
```

---

## 🚀 Production Deployment

### Environment variables cần set:

```bash
NOTIFICATION_SECRET_KEY=your-production-secret-key
```

### Nginx config (nếu dùng reverse proxy):

```nginx
location /api/notification/send {
    proxy_pass http://localhost:8080;
    
    # Rate limiting
    limit_req zone=notification burst=10 nodelay;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
}
```

---

## 📈 Monitoring

```javascript
// Log mỗi lần gửi notification
console.log(`📤 Notification sent via secret key at ${new Date().toISOString()}`);

// Track metrics
const metrics = {
  totalSent: 0,
  successCount: 0,
  failureCount: 0
};
```

---

## 🎯 Use Cases

1. **Scheduled notifications** - Cron jobs
2. **Webhook integrations** - Zapier, IFTTT, etc.
3. **Admin tools** - Custom admin panels
4. **Mobile apps** - iOS/Android native apps
5. **Desktop apps** - Electron apps
6. **IoT devices** - Raspberry Pi, Arduino
7. **CI/CD pipelines** - Notify when deploy success

---

**Made with ❤️ - Now you can send notifications from ANYWHERE!**

