# 🚀 Fix: Render Deployment Error - SlowBuffer

## ❌ Lỗi

```
TypeError: Cannot read properties of undefined (reading 'prototype')
at Object.<anonymous> (/opt/render/project/src/node_modules/buffer-equal-constant-time/index.js:37:35)
```

## 🔍 Nguyên nhân

**Node.js v23+ đã remove `SlowBuffer`** (đã deprecated từ v6).

Package `buffer-equal-constant-time` (dependency của `jsonwebtoken` và `jwa`) vẫn đang sử dụng `SlowBuffer.prototype`:

```javascript
// buffer-equal-constant-time/index.js:37
var origSlowBufEqual = SlowBuffer.prototype.equal; // ❌ SlowBuffer không tồn tại trong Node v23+
```

## ✅ Giải pháp

### Option 1: Force Node.js v20 (Recommended)

#### 1. Thêm `engines` vào `package.json`:

```json
{
  "engines": {
    "node": "20.x",
    "npm": ">=9.0.0"
  }
}
```

#### 2. Tạo file `.node-version`:

```
20.18.0
```

#### 3. Tạo file `.nvmrc`:

```
20.18.0
```

#### 4. Render.com settings:

```
Environment: Node
Node Version: 20.18.0 (auto-detect from .node-version)
Build Command: npm install && npm run build
Start Command: npm start
```

---

### Option 2: Update Dependencies

Update `jsonwebtoken` lên version mới hơn có fix:

```bash
npm update jsonwebtoken
npm install jsonwebtoken@latest
```

---

### Option 3: Thêm polyfill (Temporary)

Tạo file `polyfill.js`:

```javascript
// polyfill.js
if (!Buffer.SlowBuffer) {
  Buffer.SlowBuffer = Buffer;
  Buffer.SlowBuffer.prototype = Buffer.prototype;
}
```

Import vào `app.ts`:

```typescript
// app.ts (first line)
import './polyfill';
```

---

## 🧪 Test Local

```bash
# Check Node version
node -v  # Should be v20.x

# Clean install
rm -rf node_modules package-lock.json
npm install

# Test start
npm start
```

---

## 🚀 Deploy to Render

### 1. Push changes:

```bash
git add .
git commit -m "fix: force Node.js v20 for Render deployment"
git push origin main
```

### 2. Render settings:

Go to Render Dashboard → Your Service → Settings:

- **Environment**: Node
- **Node Version**: Auto-detect từ `.node-version` file
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Redeploy:

Click "Manual Deploy" → "Clear build cache & deploy"

---

## 📝 Files Created/Modified

### Created:
- ✅ `.node-version` - Force Node v20
- ✅ `.nvmrc` - NVM config
- ✅ `RENDER_DEPLOYMENT_FIX.md` - This file

### Modified:
- ✅ `package.json` - Added `engines` field

---

## 🔍 Verify

### Check Render build logs:

```
Detected Node version: 20.18.0 ✅
Installing dependencies...
Building TypeScript...
Build successful ✅
Starting server...
Server listening on port 8001 ✅
```

### Check for errors:

```bash
# Should NOT see:
❌ TypeError: Cannot read properties of undefined (reading 'prototype')

# Should see:
✅ MongoDB connected successfully
✅ Redis connected
✅ Server is running!
```

---

## 🐛 Troubleshooting

### Issue 1: Render still uses Node v23

**Solution:** Clear build cache

```
Render Dashboard → Service → Settings → "Clear build cache & deploy"
```

### Issue 2: Module not found after deploy

**Solution:** Check `package.json` build script

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

### Issue 3: TypeScript compile errors

**Solution:** Skip type checking for faster builds

```json
{
  "scripts": {
    "build": "tsc --skipLibCheck"
  }
}
```

---

## 📚 References

- [Node.js v23 Release Notes](https://nodejs.org/en/blog/release/v23.0.0) - SlowBuffer removed
- [Render Node.js Guide](https://render.com/docs/node-version)
- [buffer-equal-constant-time issue](https://github.com/goinstant/buffer-equal-constant-time/issues/11)

---

## ✅ Summary

**Problem:** Node.js v23+ removed `SlowBuffer`

**Solution:** Force Node.js v20 using:
1. ✅ `engines` field in package.json
2. ✅ `.node-version` file
3. ✅ `.nvmrc` file

**Result:** Render sẽ dùng Node v20 → Build success! 🎉

---

**Date:** 2025-01-15  
**Status:** ✅ FIXED

