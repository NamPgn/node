# 🐛 Debug Push Notification - Tại sao không nhận được thông báo?

## 🔍 Checklist Debug

### ✅ Bước 1: Kiểm tra có push tokens trong database không?

```bash
cd node
npx ts-node src/scripts/check-push-tokens.ts
```

**Kết quả mong đợi:**
```
✅ Active tokens (1):
   1. ANDROID - Pixel 6
      Token: ExponentPushToken[xxxxxx]...
      User: admin
      Last used: 2024-01-15
```

**Nếu thấy:**
```
❌ KHÔNG CÓ THIẾT BỊ NÀO ĐĂNG KÝ!
```

➡️ **Nguyên nhân:** Mobile app chưa register push token  
➡️ **Giải pháp:** Xem Bước 2

---

### ✅ Bước 2: Mobile app đã register token chưa?

#### Option A: Nếu đã có mobile app

Mở mobile app và check console logs:
```javascript
// Trong app, khi start sẽ thấy:
✅ Push token registered: ExponentPushToken[xxxxxx...]
```

Nếu **KHÔNG** thấy log này → App chưa register token!

**Fix:**
```typescript
// Thêm vào app/_layout.tsx hoặc App.tsx
import { registerForPushNotificationsAsync } from '@/lib/notifications/push-notification';

useEffect(() => {
  registerForPushNotificationsAsync();
}, []);
```

#### Option B: Chưa có mobile app / Testing nhanh

**Manual register token để test:**

```bash
# Chạy script này
npx ts-node src/scripts/manual-register-token.ts

# Nhập token mẫu (cho testing):
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

Hoặc gọi API trực tiếp:
```bash
curl -X POST http://localhost:8080/api/push-token/register \
  -H "Content-Type: application/json" \
  -d '{
    "token": "ExponentPushToken[your-test-token-here]",
    "platform": "android",
    "deviceName": "Test Device",
    "appVersion": "1.0.0"
  }'
```

---

### ✅ Bước 3: Kiểm tra backend logs khi edit episode

Khi bạn edit episode và BẬT toggle notification, backend phải show:

```
🎬 [notifyNewEpisode] Triggered!
   Category: Hoàn Mỹ Thế Giới
   Episode: 15
   Slug: hoan-my-the-gioi

🔍 [sendNotificationToAll] Starting...
   Payload: {...}
   Found 3 active device(s) in database

📤 Sending notification to 3 device(s)...
✅ Push notification sent: {...}
```

**Nếu thấy:**
```
❌ No active push tokens found!
💡 Cần register push token từ mobile app trước
   Run: npx ts-node src/scripts/check-push-tokens.ts
```

➡️ **Nguyên nhân:** Database không có tokens  
➡️ **Giải pháp:** Quay lại Bước 2

**Nếu thấy:**
```
ℹ️ Push notification skipped (admin disabled)
```

➡️ **Nguyên nhân:** Toggle notification bị TẮT  
➡️ **Giải pháp:** BẬT toggle trong admin panel trước khi submit

---

### ✅ Bước 4: Kiểm tra flag sendPushNotification

Thêm log vào controller để debug:

```typescript
// Trong node/src/controller/products.ts
console.log("📝 Request body:", req.body);
console.log("🔔 sendPushNotification flag:", sendPushNotification);
console.log("✅ shouldSendNotification:", shouldSendNotification);
```

**Kết quả mong đợi:**
```
📝 Request body: { ..., sendPushNotification: 'true', ... }
🔔 sendPushNotification flag: true
✅ shouldSendNotification: true
```

**Nếu thấy:**
```
🔔 sendPushNotification flag: undefined
✅ shouldSendNotification: false
```

➡️ **Nguyên nhân:** Frontend không gửi flag  
➡️ **Giải pháp:** Check EditProductModal.tsx đã thêm code chưa

---

## 🔧 Quick Test Flow

### Test 1: Kiểm tra database
```bash
npx ts-node src/scripts/check-push-tokens.ts
```

### Test 2: Gửi test notification
```bash
npx ts-node src/scripts/test-notification.ts
```

Hoặc gọi API:
```bash
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key-from-env",
    "title": "Test 🔔",
    "body": "Testing push notification"
  }'
```

**Nếu test này PASS** → Backend OK, vấn đề ở mobile app registration  
**Nếu test này FAIL** → Check:
1. SECRET_KEY trong .env
2. Database connection
3. Backend logs

---

## 🎯 Common Issues & Solutions

### Issue 1: "No active push tokens found"

**Nguyên nhân:** Chưa có device nào register token

**Giải pháp:**
```bash
# Option 1: Register từ mobile app (production way)
cd mobile-app
npx expo start
# → App tự động register khi start

# Option 2: Manual register cho test (development)
npx ts-node src/scripts/manual-register-token.ts
# → Nhập token thủ công
```

---

### Issue 2: "Push notification skipped (admin disabled)"

**Nguyên nhân:** Toggle notification bị TẮT trong admin panel

**Giải pháp:**
1. Mở trang Edit Episode
2. **BẬT toggle** "Gửi Push Notification"
3. Xem preview notification
4. Click "🔔 Cập nhật & Gửi Thông Báo"

---

### Issue 3: Backend không log gì cả

**Nguyên nhân:** Controller không được gọi hoặc code không chạy đến phần notification

**Debug:**
```typescript
// Thêm vào editProduct controller
console.log("=== EDIT PRODUCT DEBUG ===");
console.log("1. Product ID:", id);
console.log("2. sendPushNotification flag:", sendPushNotification);
console.log("3. shouldSendNotification:", shouldSendNotification);
console.log("4. Category:", findById.category);
console.log("5. Seri:", findById.seri);
console.log("========================");
```

---

### Issue 4: "Invalid Expo push token format"

**Nguyên nhân:** Token không đúng format

**Format đúng:**
```
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

**Format SAI:**
```
xxxxxxxxxxxxxxxxxxxxxx (thiếu prefix)
expoPushToken[xxx] (sai case)
```

---

### Issue 5: Mobile app không nhận notification

**Check list:**
1. ✅ Physical device (KHÔNG work trên simulator)
2. ✅ Permissions granted
3. ✅ App đang chạy hoặc background
4. ✅ Internet connection
5. ✅ Expo Go app (development) hoặc Standalone build (production)

**Test:**
```javascript
// Trong mobile app
import * as Notifications from 'expo-notifications';

// Test local notification
Notifications.scheduleNotificationAsync({
  content: {
    title: "Test Local",
    body: "This is a local notification",
  },
  trigger: null, // Gửi ngay lập tức
});
```

Nếu local notification WORK → Push token đúng  
Nếu local notification KHÔNG WORK → Check permissions

---

## 📊 Debug Workflow

```
1. Check database tokens
   ↓
   [YES] → Test gửi notification
   [NO]  → Register token từ mobile app
   
2. Test gửi notification
   ↓
   [SUCCESS] → Backend OK
   [FAIL]    → Check logs & network
   
3. Edit episode & BẬT toggle
   ↓
   Check backend logs:
   - "notifyNewEpisode Triggered!" → ✅
   - "No active tokens" → Quay lại step 1
   - "skipped (admin disabled)" → Toggle chưa BẬT
   
4. Mobile app nhận notification?
   ↓
   [YES] → 🎉 SUCCESS!
   [NO]  → Check mobile app permissions & network
```

---

## 🚀 Quick Start (Nếu chưa có token nào)

### Cách nhanh nhất để test:

**1. Fake register một token:**
```bash
# Run script
npx ts-node src/scripts/manual-register-token.ts

# Nhập token giả (để test flow):
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

**2. Test gửi notification:**
```bash
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key",
    "title": "Test",
    "body": "Testing notification"
  }'
```

**3. Check logs:**
```
📤 Sending notification to 1 device(s)...
✅ Push notification sent: {...}
```

Nếu thấy logs này → Backend đang hoạt động đúng!

---

## 🔑 Environment Variables Checklist

Trong file `.env`:
```env
# MongoDB
URI=mongodb://localhost:27017/movie-db

# Push Notification Secret
NOTIFICATION_SECRET_KEY=your-random-secret-key-here

# Expo Push URL (optional, có default)
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send
```

---

## 📞 Cần trợ giúp?

**Run các script debug:**
```bash
# Check tokens
npx ts-node src/scripts/check-push-tokens.ts

# Test send
npx ts-node src/scripts/test-notification.ts

# Manual register
npx ts-node src/scripts/manual-register-token.ts
```

**Check logs pattern:**
- ✅ `📤 Sending notification...` → Đang gửi
- ✅ `✅ Push notification sent` → Gửi thành công
- ❌ `No active push tokens` → Không có device
- ℹ️ `skipped (admin disabled)` → Toggle TẮT

---

**Made with ❤️ - Happy Debugging!**

