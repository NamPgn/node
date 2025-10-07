# Debug React Native Network Error - Hướng dẫn chi tiết

## 🔴 Lỗi bạn đang gặp:
```
AxiosError: Network Error
```

## ✅ Giải pháp từng bước:

### 1. **Android: Cho phép HTTP (Cleartext Traffic)**

Android mặc định chặn HTTP (chỉ cho phép HTTPS). Bạn cần cấu hình:

#### Cách 1: Cho phép tất cả HTTP (Development only)

Mở file `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Thêm quyền Internet và Network State -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:name=".MainApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">  <!-- ⭐ THÊM DÒNG NÀY -->
        
        <activity
            android:name=".MainActivity"
            ...
        </activity>
    </application>
</manifest>
```

#### Cách 2: Chỉ cho phép domain cụ thể (Recommended)

**Bước 1:** Tạo file `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Cho phép cleartext cho IP cục bộ -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.0.102</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

**Bước 2:** Cập nhật `AndroidManifest.xml`:

```xml
<application
    ...
    android:networkSecurityConfig="@xml/network_security_config">
    ...
</application>
```

### 2. **iOS: Cho phép HTTP (App Transport Security)**

Mở file `ios/[ProjectName]/Info.plist`:

```xml
<dict>
    ...
    <key>NSAppTransportSecurity</key>
    <dict>
        <key>NSAllowsArbitraryLoads</key>
        <true/>
        <!-- Hoặc chỉ cho phép domain cụ thể -->
        <key>NSExceptionDomains</key>
        <dict>
            <key>192.168.0.102</key>
            <dict>
                <key>NSExceptionAllowsInsecureHTTPLoads</key>
                <true/>
                <key>NSIncludesSubdomains</key>
                <true/>
            </dict>
        </dict>
    </dict>
    ...
</dict>
```

### 3. **Kiểm tra Windows Firewall**

#### Option 1: Tạm tắt Firewall để test (Development only)
1. Nhấn `Windows + R`
2. Gõ `firewall.cpl`
3. Click "Turn Windows Defender Firewall on or off"
4. Tắt cho Private networks (test xem có work không)

#### Option 2: Cho phép port 8080 qua Firewall
```powershell
# Chạy PowerShell với quyền Administrator
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=8080

# Hoặc cho phép Node.js hoàn toàn
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

### 4. **Verify Server đang chạy đúng**

#### Test 1: Kiểm tra server bind đúng address
```bash
# Chạy server
cd node
npm run dev

# Mở terminal khác, kiểm tra port đang listen
netstat -ano | findstr :8080
```

Kết quả phải có: `0.0.0.0:8080` hoặc `[::]:8080`

#### Test 2: Test từ máy tính trước
```bash
# Mở browser hoặc PowerShell
curl http://192.168.0.102:8080
# hoặc
curl http://localhost:8080
```

#### Test 3: Test từ điện thoại (browser)
Mở browser trên điện thoại, vào:
```
http://192.168.0.102:8080
```

Phải thấy: "API is running 🚀"

### 5. **Rebuild React Native App**

Sau khi sửa AndroidManifest hoặc Info.plist, phải rebuild:

```bash
# Android
cd android
./gradlew clean
cd ..
npx react-native run-android

# iOS
cd ios
pod install
cd ..
npx react-native run-ios
```

### 6. **Clear Cache React Native**

```bash
# Clear Metro bundler cache
npx react-native start --reset-cache

# Clear npm cache
npm cache clean --force

# Xóa node_modules và reinstall
rm -rf node_modules
npm install
```

### 7. **Kiểm tra API URL trong code**

Đảm bảo bạn đang dùng đúng IP:

```javascript
// ❌ SAI - Không dùng localhost
const API_URL = 'http://localhost:8080';

// ✅ ĐÚNG - Dùng IP của máy tính
const API_URL = 'http://192.168.0.102:8080';

// Hoặc với Android Emulator, có thể dùng:
const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080'  // Android Emulator
  : 'http://192.168.0.102:8080'; // Real device
```

### 8. **Test với curl từ điện thoại**

Nếu có Termux trên Android:

```bash
# Install termux từ Play Store
pkg install curl
curl http://192.168.0.102:8080
```

### 9. **Kiểm tra cùng WiFi**

```javascript
// Trong React Native, log ra IP để check
import NetInfo from '@react-native-community/netinfo';

NetInfo.fetch().then(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
  console.log('IP Address:', state.details.ipAddress);
});
```

### 10. **Debug Axios Request**

Thêm logging để xem chi tiết lỗi:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.102:8080',
  timeout: 10000,
});

// Add request interceptor
api.interceptors.request.use(
  config => {
    console.log('🚀 Request:', config.method?.toUpperCase(), config.url);
    console.log('📝 Base URL:', config.baseURL);
    console.log('🔧 Full URL:', config.baseURL + config.url);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ Response Error:', error.message);
    console.error('📍 URL:', error.config?.url);
    console.error('🔍 Details:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    return Promise.reject(error);
  }
);

export default api;
```

## 🔥 Quick Fix cho Development:

Nếu vẫn không được, thử cách này:

### 1. Android Emulator: Dùng 10.0.2.2
```javascript
const API_URL = 'http://10.0.2.2:8080';
```

### 2. Android Real Device: Dùng adb reverse
```bash
# Kết nối điện thoại qua USB
adb devices
adb reverse tcp:8080 tcp:8080

# Sau đó trong app dùng localhost
const API_URL = 'http://localhost:8080';
```

### 3. Tạm tắt Firewall hoàn toàn (test)
```powershell
# PowerShell Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Sau khi test xong, bật lại
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

## 📋 Checklist đầy đủ:

```
✅ Server chạy trên 0.0.0.0:8080
✅ AndroidManifest.xml có usesCleartextTraffic="true"
✅ Windows Firewall cho phép port 8080
✅ Điện thoại và máy tính cùng WiFi
✅ Test http://192.168.0.102:8080 trên browser điện thoại OK
✅ API URL trong code là http://192.168.0.102:8080
✅ Đã rebuild app sau khi sửa manifest
✅ Clear cache và restart Metro bundler
```

## 🎯 Test nhanh:

1. **Test server có chạy không:**
   ```
   Browser máy tính: http://localhost:8080 ✅
   ```

2. **Test firewall có chặn không:**
   ```
   Browser điện thoại: http://192.168.0.102:8080 ✅
   ```

3. **Test React Native có call được không:**
   ```javascript
   fetch('http://192.168.0.102:8080')
     .then(r => r.text())
     .then(console.log)
     .catch(console.error);
   ```

Nếu bước 1 và 2 OK nhưng bước 3 fail → Vấn đề ở Android manifest!

## 🆘 Vẫn không được?

Share thêm thông tin:
1. Đang dùng Android Emulator hay Real Device?
2. Log đầy đủ từ axios interceptor
3. Kết quả test từ browser điện thoại
4. AndroidManifest.xml hiện tại

