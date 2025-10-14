# 📱 Push Notification System - Hướng dẫn sử dụng

## 🎯 Tổng quan

Hệ thống Push Notification được thiết kế để gửi thông báo real-time đến mobile app (Android/iOS) khi có:
- ✨ **Episode mới** được thêm vào phim
- 🎬 **Phim/Series mới** được thêm vào hệ thống
- 📢 **Thông báo tùy chỉnh** từ admin

## 🏗️ Kiến trúc

```
Mobile App (Expo) ←→ Backend API ←→ Expo Push Service ←→ FCM/APNs
      ↓                   ↓
  Push Token       MongoDB (PushToken)
```

## 📦 Backend Setup

### 1. Models

**PushToken Model** (`src/module/push.token.ts`):
```typescript
{
  token: string (unique),           // ExponentPushToken[xxx]
  userId: ObjectId (optional),      // Link với user
  deviceInfo: {
    platform: "android" | "ios" | "web",
    deviceName: string,
    appVersion: string
  },
  isActive: boolean,
  lastUsed: Date
}
```

### 2. API Endpoints

#### 📌 Public Endpoints (không cần auth)

**Register Push Token**
```http
POST /api/push-token/register
Content-Type: application/json

{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "platform": "android",
  "deviceName": "Pixel 6",
  "appVersion": "1.0.0",
  "userId": "optional_user_id"
}

Response:
{
  "success": true,
  "message": "Push token registered successfully",
  "data": { ... }
}
```

**Unregister Push Token**
```http
POST /api/push-token/unregister
Content-Type: application/json

{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}

Response:
{
  "success": true,
  "message": "Push token unregistered successfully"
}
```

#### 🔐 Admin Endpoints (cần auth + isAdmin)

**Send Test Notification**
```http
POST /api/push-notification/test
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Test Notification",
  "body": "This is a test message",
  "token": "ExponentPushToken[xxx]",  // Optional: gửi đến 1 device
  "data": {
    "type": "announcement",
    "customField": "value"
  }
}

// Nếu không có "token" → gửi đến tất cả devices
```

**Get Active Tokens**
```http
GET /api/push-tokens?page=1&limit=20
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "data": [...],
  "totalCount": 150,
  "totalPages": 8,
  "currentPage": 1
}
```

**Cleanup Inactive Tokens**
```http
DELETE /api/push-tokens/cleanup?days=30
Authorization: Bearer {admin_token}

Response:
{
  "success": true,
  "message": "Cleaned up 25 inactive tokens",
  "deletedCount": 25
}
```

## 🔔 Auto Notifications

Hệ thống tự động gửi notification trong các trường hợp sau:

### 1. New Episode Added
**Trigger:** Khi thêm episode mới (seri > 1)  
**Controller:** `src/controller/products.ts` → `addProduct()`

```javascript
// Tự động gửi khi:
if (episodeNumber > 1) {
  notifyNewEpisode(categoryName, episodeNumber, categorySlug);
}
```

**Notification:**
```json
{
  "title": "Tập 5 mới đã ra! 🎬",
  "body": "Thánh Nhân Vương Đạo - Tập 5 vừa được cập nhật",
  "data": {
    "type": "new_episode",
    "categorySlug": "thanh-nhan-vuong-dao",
    "episode": "5"
  }
}
```

### 2. New Category/Series Added
**Trigger:** Khi thêm category/phim mới  
**Controller:** `src/controller/category.ts` → `addCt()`

```javascript
// Tự động gửi khi thêm category mới:
notifyNewCategory(categoryName, categorySlug);
```

**Notification:**
```json
{
  "title": "Phim mới đã ra mắt! 🎉",
  "body": "Hoàn Mỹ Thế Giới đã được thêm vào thư viện",
  "data": {
    "type": "new_category",
    "categorySlug": "hoan-my-the-gioi"
  }
}
```

## 🛠️ Service Functions

**File:** `src/services/push-notification.service.ts`

### sendPushNotification()
```typescript
sendPushNotification(
  tokens: string | string[],
  payload: {
    title: string,
    body: string,
    data?: object,
    sound?: "default" | null,
    badge?: number
  }
)
```

### sendNotificationToAll()
```typescript
// Gửi đến tất cả active devices
sendNotificationToAll({
  title: "Thông báo bảo trì",
  body: "Hệ thống sẽ bảo trì vào 2h sáng ngày mai",
  data: { type: "announcement" }
})
```

### sendNotificationToUser()
```typescript
// Gửi đến devices của 1 user cụ thể
sendNotificationToUser(userId, {
  title: "Tài khoản của bạn",
  body: "Gói VIP của bạn sắp hết hạn",
  data: { type: "account" }
})
```

### notifyNewEpisode()
```typescript
// Helper function cho episode mới
notifyNewEpisode(categoryName, episodeNumber, categorySlug)
```

### notifyNewCategory()
```typescript
// Helper function cho category mới
notifyNewCategory(categoryName, categorySlug)
```

## 📱 Mobile App Integration

### 1. Register Push Token (khi app khởi động)

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
  }

  // Gửi token lên backend
  await fetch('https://your-api.com/api/push-token/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      platform: Device.osName?.toLowerCase(),
      deviceName: Device.deviceName,
      appVersion: Constants.expoConfig?.version,
      userId: user?.id // Optional
    })
  });

  return token;
}
```

### 2. Handle Notifications

```typescript
import { useEffect, useRef } from 'react';
import { router } from 'expo-router';

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Khi nhận notification (app đang mở)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    // Khi user tap vào notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data.type === 'new_episode') {
        router.push(\`/category/\${data.categorySlug}\`);
      } else if (data.type === 'new_category') {
        router.push(\`/category/\${data.categorySlug}\`);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return <YourApp />;
}
```

### 3. Notification Behavior

```typescript
// app/_layout.tsx (hoặc App.tsx)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
```

## 🔧 Testing

### Test từ Backend (API call)

```bash
# Gửi test notification đến tất cả
curl -X POST https://your-api.com/api/push-notification/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "body": "Hello from backend!",
    "data": {
      "type": "announcement"
    }
  }'
```

### Test từ Code

```typescript
// Trong controller bất kỳ
import { sendNotificationToAll } from '../services/push-notification.service';

// Gửi thông báo
await sendNotificationToAll({
  title: 'Test',
  body: 'This is a test',
  data: { customField: 'value' }
});
```

## 🐛 Troubleshooting

### Không nhận được notification?

1. **Kiểm tra token format:**
   ```javascript
   // Token phải có format: ExponentPushToken[xxxxxx]
   console.log('Token:', pushToken);
   ```

2. **Kiểm tra isActive:**
   ```bash
   # Check trong MongoDB
   db.pushtokens.find({ token: "ExponentPushToken[xxx]" })
   ```

3. **Kiểm tra permissions:**
   ```javascript
   const { status } = await Notifications.getPermissionsAsync();
   console.log('Permission status:', status); // phải là 'granted'
   ```

4. **Check backend logs:**
   ```
   ✅ Push notification sent: {...}
   ❌ Failed to send push notification: {...}
   ```

5. **Verify Expo project ID:**
   ```json
   // app.json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "your-project-id-here"
         }
       }
     }
   }
   ```

## 📊 Best Practices

### 1. Token Management
- ✅ Register token khi app start
- ✅ Unregister khi user logout
- ✅ Update token khi app update
- ✅ Cleanup inactive tokens định kỳ (30 days)

### 2. Notification Content
- ✅ Title ngắn gọn (< 50 chars)
- ✅ Body rõ ràng (< 150 chars)
- ✅ Luôn có `data` field để navigate
- ✅ Sound = "default" cho UX tốt hơn

### 3. Performance
- ✅ Gửi notification async (không block response)
- ✅ Batch send cho nhiều tokens
- ✅ Handle errors gracefully
- ✅ Log để debug

### 4. User Experience
- ✅ Không spam (tối đa 3-5 notifications/day)
- ✅ Allow users opt-out
- ✅ Meaningful notifications only
- ✅ Deep linking từ notification

## 🔒 Security

- Token được encrypt trong MongoDB
- Chỉ admin mới send test notifications
- Rate limiting trên API
- Validate token format trước khi lưu

## 📈 Monitoring

```javascript
// Get statistics
const activeTokens = await PushToken.countDocuments({ isActive: true });
const totalUsers = await PushToken.distinct('userId').length;
const androidDevices = await PushToken.countDocuments({ 
  'deviceInfo.platform': 'android' 
});

console.log(\`
  📊 Push Notification Stats:
  - Active Tokens: \${activeTokens}
  - Unique Users: \${totalUsers}
  - Android: \${androidDevices}
  - iOS: \${activeTokens - androidDevices}
\`);
```

## 🚀 Production Checklist

- [ ] Environment variables set (EXPO_PROJECT_ID)
- [ ] Push permissions requested in app
- [ ] Token registration on app start
- [ ] Notification handler configured
- [ ] Deep linking routes setup
- [ ] Error logging enabled
- [ ] Cleanup cron job scheduled
- [ ] Rate limiting configured
- [ ] Testing on real devices (Android + iOS)
- [ ] Analytics tracking setup

---

**Made with ❤️ for your Movie Streaming Platform**

