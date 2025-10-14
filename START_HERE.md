# 🚀 PUSH NOTIFICATION - BẮT ĐẦU TẠI ĐÂY

## ⚡ Quick Start - 5 phút setup

### **BƯỚC 1: Start Backend**

```bash
cd node

# Install dependencies (nếu chưa)
npm install

# Start server
npm run dev
```

**Phải thấy:**
```
✅ MongoDB connected successfully
✅ Redis connected in development mode
🚀 Server is running!
🔉 Listening on port 8080
```

---

### **BƯỚC 2: Setup Environment Variables**

Tạo/edit file `.env`:

```env
# ... các biến khác ...

# 🔔 Push Notification Secret Key
NOTIFICATION_SECRET_KEY=abc123xyz456-your-random-secret-key
```

**Generate random key:**
```bash
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})

# Hoặc online: https://randomkeygen.com/
```

Restart server sau khi thêm!

---

### **BƯỚC 3: Test Backend API**

```bash
# Test 1: Register một token
node test-full-flow.js
```

**Phải thấy:**
```
✅ Token registered
✅ Notification sent successfully!
🎉 TEST COMPLETED SUCCESSFULLY!
```

**Nếu FAIL:**
- Check backend có chạy không
- Check NOTIFICATION_SECRET_KEY trong .env
- Check MongoDB đã connect chưa

---

### **BƯỚC 4: Check Database**

```bash
npx ts-node src/scripts/check-push-tokens.ts
```

**Phải thấy:**
```
✅ Active tokens (1):
   1. ANDROID - Test Device
      Token: ExponentPushToken[test123...]
```

**Nếu thấy `❌ KHÔNG CÓ THIẾT BỊ NÀO`:**
- Run lại: `node test-full-flow.js`
- Hoặc: `npx ts-node src/scripts/manual-register-token.ts`

---

### **BƯỚC 5: Mobile App - Check API URL**

Trong mobile app, verify API endpoint:

**File:** `lib/config/api.ts` hoặc `constants/api.ts`

```typescript
export const API_BASE_URL = "http://localhost:8080/api"; // ← Check URL này

export const API_ENDPOINTS = {
  PUSH_TOKEN_REGISTER: "/push-token/register", // ← Thêm dòng này nếu chưa có
};
```

**Hoặc hardcode trong `registerForPushNotificationsAsync`:**

```typescript
// Thay
await api.post(API_ENDPOINTS.PUSH_TOKEN_REGISTER, {...});

// Thành
await axios.post('http://localhost:8080/api/push-token/register', {
  token,
  platform: Device.osName?.toLowerCase() || 'unknown',
  deviceName: Device.deviceName || 'Unknown Device',
  appVersion: Constants.expoConfig?.version || '1.0.0',
});
```

---

### **BƯỚC 6: Test Edit Episode**

1. Vào admin panel: `http://localhost:3000/dashboard/product`
2. Click edit episode bất kỳ
3. **BẬT toggle** "Gửi Push Notification"
4. Click "🔔 Cập nhật & Gửi Thông Báo"

**Backend console sẽ show:**
```
🎬 [notifyNewEpisode] Triggered!
   Category: Hoàn Mỹ Thế Giới
   Episode: 15

🔍 [sendNotificationToAll] Starting...
   Found 1 active device(s) in database

📤 Sending notification to 1 device(s)...
✅ Push notification sent: { success: true, ... }
```

---

## 🎯 TẠI SAO KHÔNG THẤY GÌ?

### **Lý do #1: Database trống (99% cases)**

```bash
# Check ngay:
npx ts-node src/scripts/check-push-tokens.ts

# Nếu thấy "KHÔNG CÓ THIẾT BỊ":
node test-full-flow.js  # ← Tự động register 1 token test
```

### **Lý do #2: Toggle bị TẮT**

Admin panel phải **BẬT** toggle trước khi submit!

```
┌──────────────────────────────┐
│ 🔔 Gửi Push Notification    │
│                       [BẬT] │ ← Phải BẬT cái này!
└──────────────────────────────┘
```

### **Lý do #3: Episode = 1**

Notification chỉ gửi cho **episode > 1** (không gửi tập đầu).

Backend log sẽ show:
```
⚠️ Skip notification: Episode 1 is first episode
```

---

## ✅ VERIFICATION

### **Backend logs khi THÀNH CÔNG:**

```
📱 [registerPushToken] Received request    ← Khi mobile app register
✅ New token registered!
   Total active tokens: 1

🎬 [notifyNewEpisode] Triggered!           ← Khi edit episode
   Category: Hoàn Mỹ Thế Giới
   Episode: 15

🔍 [sendNotificationToAll] Starting...
   Found 1 active device(s) in database

📤 Sending notification to 1 device(s)...
✅ Push notification sent
```

### **Backend logs khi THẤT BẠI:**

```
❌ No active push tokens found!            ← Database trống
💡 Cần register push token từ mobile app trước
```

hoặc

```
ℹ️ Push notification skipped (admin disabled)  ← Toggle TẮT
```

---

## 🛠️ Tools đã tạo

| Script | Mô tả | Command |
|--------|-------|---------|
| `test-full-flow.js` | Test toàn bộ flow | `node test-full-flow.js` |
| `check-push-tokens.ts` | Xem tokens trong DB | `npx ts-node src/scripts/check-push-tokens.ts` |
| `manual-register-token.ts` | Đăng ký token thủ công | `npx ts-node src/scripts/manual-register-token.ts` |
| `test-notification.ts` | Test gửi notification | `npx ts-node src/scripts/test-notification.ts` |
| `test-send-notification.js` | Test các loại notification | `node test-send-notification.js` |

---

## 📞 Troubleshooting

**Backend không start?**
```bash
# Check MongoDB running
# Check port 8080 available
netstat -ano | findstr :8080
```

**"Invalid SECRET_KEY"?**
```bash
# Check .env file
cat .env | findstr NOTIFICATION_SECRET_KEY

# Phải có:
NOTIFICATION_SECRET_KEY=abc123...
```

**"ECONNREFUSED"?**
```bash
# Backend chưa chạy
cd node
npm run dev
```

---

## 🎉 TEST NGAY

```bash
# 1. Start backend
cd node
npm run dev

# 2. Trong terminal khác, test:
node test-full-flow.js

# 3. Nếu PASS → Xem backend logs
# 4. Edit episode + BẬT toggle → Done!
```

---

**LƯU Ý QUAN TRỌNG:**

1. ✅ Backend PHẢI đang chạy
2. ✅ MongoDB PHẢI connect được
3. ✅ `.env` phải có NOTIFICATION_SECRET_KEY
4. ✅ Database phải có ít nhất 1 token
5. ✅ Toggle phải BẬT trong admin panel

**Run `node test-full-flow.js` ngay để verify!** 🚀

