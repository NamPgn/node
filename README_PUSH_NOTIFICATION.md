# 🔔 Push Notification Setup - Quick Start

## ✅ Backend đã setup xong!

### 📦 Files đã tạo:

1. **Model**: `src/module/push.token.ts` - Lưu push tokens
2. **Service**: `src/services/push-notification.service.ts` - Logic gửi notification
3. **Controller**: `src/controller/push-notification.ts` - API handlers
4. **Routes**: `src/routes/push-notification.ts` - API endpoints
5. **Integration**: 
   - `src/controller/products.ts` - Auto gửi khi add/edit episode
   - ~~`src/controller/category.ts` - Auto gửi khi add category mới~~ (đã remove)

### 🚀 API Endpoints đã có:

```
POST   /api/push-token/register        - Register device token (public)
POST   /api/push-token/unregister      - Unregister token (public)

🔥 POST   /api/notification/send        - GỬI NOTIFICATION KHÔNG CẦN LOGIN (chỉ cần SECRET_KEY)

POST   /api/push-notification/test     - Send test notification (admin, cần JWT)
GET    /api/push-tokens                - Get all tokens (admin, cần JWT)
DELETE /api/push-tokens/cleanup        - Cleanup old tokens (admin, cần JWT)
```

### 🔥 NEW: Gửi notification KHÔNG CẦN ĐĂNG NHẬP!

**Endpoint mới:** `POST /api/notification/send`

**Chỉ cần SECRET_KEY trong body, không cần JWT token!**

```bash
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key",
    "title": "Test Notification",
    "body": "Gửi từ bất kỳ đâu mà không cần login!"
  }'
```

📖 **Chi tiết:** Xem file `docs/SendNotificationWithoutLogin.md`

## 📱 Bước tiếp theo (Mobile App):

### 1. Install packages trong mobile app:

```bash
cd mobile-app
npx expo install expo-notifications expo-device expo-constants
```

### 2. Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ff4757"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

### 3. Tạo `lib/notifications/push-notification.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import axios from 'axios';

const API_URL = 'https://your-backend-url.com/api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(userId?: string) {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push notification permissions');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;

    // Register token with backend
    try {
      await axios.post(`${API_URL}/push-token/register`, {
        token,
        platform: Device.osName?.toLowerCase(),
        deviceName: Device.deviceName,
        appVersion: Constants.expoConfig?.version,
        userId,
      });
      console.log('✅ Push token registered:', token);
    } catch (error) {
      console.error('❌ Failed to register push token:', error);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

export async function unregisterPushToken(token: string) {
  try {
    await axios.post(`${API_URL}/push-token/unregister`, { token });
    console.log('✅ Push token unregistered');
  } catch (error) {
    console.error('❌ Failed to unregister push token:', error);
  }
}
```

### 4. Integrate vào `app/_layout.tsx`:

```typescript
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { registerForPushNotificationsAsync } from '@/lib/notifications/push-notification';

export default function RootLayout() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📬 Notification received:', notification);
    });

    // Handle notification tap
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      if (data.type === 'new_episode' && data.categorySlug) {
        router.push(`/series/${data.categorySlug}`);
      } else if (data.type === 'new_category' && data.categorySlug) {
        router.push(`/series/${data.categorySlug}`);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    // Your app layout
  );
}
```

### 5. Android Configuration (`app.json`):

```json
{
  "android": {
    "permissions": [
      "NOTIFICATIONS",
      "RECEIVE_BOOT_COMPLETED"
    ],
    "googleServicesFile": "./google-services.json"
  }
}
```

## ⚙️ Setup SECRET_KEY (QUAN TRỌNG!)

### Tạo file `.env` và thêm:

```env
NOTIFICATION_SECRET_KEY=your-super-secret-random-key-here
```

**Tạo random key:**
```bash
# Linux/Mac
openssl rand -hex 32

# Hoặc dùng online: https://randomkeygen.com/
```

**Restart server sau khi thêm:**
```bash
npm run dev
```

---

## 🧪 Testing:

### 0. Test GỬI NOTIFICATION mà KHÔNG CẦN LOGIN:

```bash
# Gửi custom notification đến tất cả devices
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key-from-env",
    "title": "🎬 Phim mới cập nhật",
    "body": "Hôm nay có 5 phim mới, xem ngay!"
  }'

# Gửi notification khi có tập mới
curl -X POST http://localhost:8080/api/notification/send \
  -H "Content-Type: application/json" \
  -d '{
    "secretKey": "your-secret-key",
    "type": "new_episode",
    "categoryName": "Hoàn Mỹ Thế Giới",
    "categorySlug": "hoan-my-the-gioi",
    "episode": "15"
  }'
```

**✅ Không cần JWT, không cần login, gửi từ bất kỳ đâu!**

### 1. Test từ Mobile App (development):

```bash
cd mobile-app
npx expo start
# Scan QR code với Expo Go app
```

Khi app start, check console logs:
```
✅ Push token registered: ExponentPushToken[xxxxxx]
```

### 2. Test từ Backend:

```bash
cd node
npx ts-node src/scripts/test-notification.ts
```

Hoặc gọi API:
```bash
curl -X POST http://localhost:8080/api/push-notification/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "body": "Hello from backend!"
  }'
```

### 3. Test tự động khi add/edit episode:

1. Vào admin panel
2. **Thêm episode mới** (seri > 1) HOẶC **Edit episode** (seri > 1)
3. Mobile app sẽ nhận notification: "Tập X mới đã ra! 🎬"

**Lưu ý:** Notification chỉ gửi khi episode > 1 (không gửi cho tập 1)

## 📊 Check Push Tokens (Admin):

```bash
# Get all active tokens
curl -X GET "http://localhost:8080/api/push-tokens?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 🐛 Troubleshooting:

**Không nhận notification?**
1. Kiểm tra physical device (không work trên simulator)
2. Check permissions: Settings > App > Notifications
3. Verify Expo project ID trong `app.json`
4. Check backend logs: `✅ Push notification sent` hoặc `❌ Failed to send`

**Token không register được?**
1. Check API URL trong mobile app
2. Verify backend đã chạy
3. Check network connection
4. Xem logs trong Expo app

## 📚 Chi tiết hơn:

Xem file: `node/docs/PushNotificationGuide.md`

---

**🎉 Setup xong! Giờ bạn có thể gửi notification đến mobile app!**

