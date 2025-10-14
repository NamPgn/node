# 🚀 DEBUG NHANH - Tại sao không nhận notification?

## 🎯 TL;DR - Làm ngay 3 bước này:

### **1. CHECK: Database có token không?**
```bash
cd node
npx ts-node src/scripts/check-push-tokens.ts
```

**Nếu thấy:** `❌ KHÔNG CÓ THIẾT BỊ NÀO ĐĂNG KÝ!`  
➡️ **ĐÂY LÀ VẤN ĐỀ!** Mobile app chưa register token

---

### **2. FIX: Test register token ngay**
```bash
# Test API endpoint có hoạt động không
curl -X POST http://localhost:8080/api/push-token/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[test123456789abcdefghijklmnop]",
    "platform": "android",
    "deviceName": "Test Device",
    "appVersion": "1.0.0"
  }'
```

**Backend sẽ log:**
```
📱 [registerPushToken] Received request
   Body: {...}
✅ Token format valid: ExponentPushToken[test123456...
📝 Creating new token...
✅ New token registered successfully!
   Total active tokens: 1
```

**Response:**
```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

---

### **3. TEST: Gửi notification**
```bash
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key-from-env",
    "title": "Test 🔔",
    "body": "Test notification"
  }'
```

**Backend sẽ log:**
```
🔍 [sendNotificationToAll] Starting...
   Found 1 active device(s) in database
📤 Sending notification to 1 device(s)...
✅ Push notification sent: {...}
```

---

## 🔧 Mobile App - Check API endpoint

Trong mobile app của bạn, tìm file định nghĩa `API_ENDPOINTS`:

**Nếu chưa có, tạo file này:**

```typescript
// lib/config/api.ts hoặc constants/api.ts
export const API_BASE_URL = "http://localhost:8080/api";

export const API_ENDPOINTS = {
  // ... các endpoints khác
  
  // Push Notification
  PUSH_TOKEN_REGISTER: "/push-token/register",
  PUSH_TOKEN_UNREGISTER: "/push-token/unregister",
};
```

**Hoặc sửa code register thành:**

```typescript
// Thay vì:
await api.post(API_ENDPOINTS.PUSH_TOKEN_REGISTER, {...});

// Dùng trực tiếp:
await axios.post('http://localhost:8080/api/push-token/register', {
  token,
  platform: Device.osName?.toLowerCase() || 'unknown',
  deviceName: Device.deviceName || 'Unknown Device',
  appVersion: Constants.expoConfig?.version || '1.0.0',
});
```

---

## 📊 Debug Flow

```
Mobile App Start
    ↓
Call registerForPushNotificationsAsync()
    ↓
Get Expo Push Token
    ↓
POST /api/push-token/register
    ↓ [Backend logs]
📱 [registerPushToken] Received request
✅ Token format valid: ExponentPushToken[...]
📝 Creating new token...
✅ New token registered!
    ↓
Save vào MongoDB
    ↓
✅ SUCCESS
```

---

## 🐛 Common Issues

### Issue: Backend không log gì khi mobile app start

**Nguyên nhân:**
1. API endpoint sai (mobile app gọi sai URL)
2. Network không kết nối được
3. CORS issue

**Fix:**
```typescript
// Trong mobile app, log URL đang gọi:
console.log('Calling API:', `${API_BASE_URL}/push-token/register`);

// Check response:
const response = await axios.post(...);
console.log('Register response:', response.data);
```

---

### Issue: Mobile app throw error khi register

**Check console logs:**
```
❌ Lỗi khi đăng ký token với backend: Network Error
```

➡️ Backend chưa chạy hoặc URL sai

```
❌ Lỗi khi đăng ký token với backend: 404 Not Found
```

➡️ Route chưa được config trong backend

```
❌ Lỗi khi đăng ký token với backend: 400 Invalid token format
```

➡️ Token không đúng format (check Expo project ID)

---

## ✅ Verification Checklist

- [ ] Backend đang chạy (`npm run dev`)
- [ ] MongoDB đang chạy
- [ ] Mobile app đã call `registerForPushNotificationsAsync()`
- [ ] Backend log thấy `[registerPushToken] Received request`
- [ ] Database có ít nhất 1 token active
- [ ] Edit episode + BẬT toggle notification
- [ ] Backend log thấy `[notifyNewEpisode] Triggered!`
- [ ] Backend log thấy `Found X active device(s)`
- [ ] Backend log thấy `✅ Push notification sent`

---

## 🚀 Test thử ngay:

```bash
# 1. Register token test
curl -X POST http://localhost:8080/api/push-token/register \
  -H "Content-Type: application/json" \
  -d '{"token":"ExponentPushToken[test123]","platform":"android","deviceName":"Test","appVersion":"1.0.0"}'

# 2. Check tokens
npx ts-node src/scripts/check-push-tokens.ts

# 3. Send test notification
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{"secretKey":"your-secret-key","title":"Test","body":"Hello"}'

# 4. Edit episode trong admin panel
# → BẬT toggle
# → Click submit
# → Check backend logs
```

---

## 📞 Next Steps

**Nếu step 1-2 PASS:**
- Backend API hoạt động tốt ✅
- Vấn đề: Mobile app chưa gọi API hoặc URL sai

**Nếu step 3 PASS:**
- Backend gửi notification OK ✅
- Vấn đề: Mobile app chưa nhận (check permissions/device)

**Nếu tất cả PASS:**
- System hoạt động hoàn hảo! 🎉
- Edit episode + BẬT toggle = Notification gửi thành công

---

**RUN `check-push-tokens.ts` NGAY ĐỂ XEM CÓ TOKEN NÀO CHƯA!** 🔍

