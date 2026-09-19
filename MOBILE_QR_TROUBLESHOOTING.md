# 📱 Mobile QR Scanner Troubleshooting Guide

## 🔧 Quick Fixes for Mobile QR Scanner Issues

### Problem: QR Scanner not showing anything on mobile

#### ✅ **Solution 1: Check Camera Permissions**
1. Open your mobile browser settings
2. Find "Site Settings" or "Permissions"
3. Look for your website (192.168.164.137:5176)
4. Enable "Camera" permissions
5. Refresh the page

#### ✅ **Solution 2: Use HTTPS or Localhost**
Modern browsers require HTTPS for camera access on mobile devices.

**Option A: Use localhost (if testing locally)**
- Access via: `http://localhost:5176/qr-scanner`

**Option B: Enable HTTPS (recommended for production)**
```bash
# Update vite.config.ts to use HTTPS
server: {
  https: true,
  host: '0.0.0.0',
  port: 5176
}
```

#### ✅ **Solution 3: Test with Simple QR Scanner**
Visit: `http://192.168.164.137:5176/mobile-qr-test.html`

This is a simplified QR scanner that works better on mobile devices.

#### ✅ **Solution 4: Browser Compatibility**
**Recommended Mobile Browsers:**
- ✅ Chrome (Android/iOS)
- ✅ Safari (iOS)
- ✅ Firefox (Android)
- ❌ Avoid older browsers

#### ✅ **Solution 5: Network Configuration**
Make sure your mobile device is on the same network as the server:
```bash
# Check if server is accessible
ping 192.168.164.137

# Start server with correct settings
npm run dev:mobile
```

## 🚀 Quick Start Commands

```bash
# Start development server for mobile
npm run dev:mobile

# Or manually with correct settings
npm run dev -- --port 5176 --host 0.0.0.0
```

## 📋 Testing Checklist

- [ ] Camera permissions enabled
- [ ] Using supported browser (Chrome/Safari)
- [ ] Good lighting conditions
- [ ] Stable internet connection
- [ ] Server running on correct port (5176)
- [ ] Mobile device on same network

## 🧪 Test QR Codes

Use these test QR codes if camera scanning fails:
- `WW1763010183078LZMDR`
- `WW1763010598780RTB94` 
- `WW1763024677420D7L3T`

## 🔍 Debug Steps

1. **Check Console Errors:**
   - Open browser dev tools on mobile
   - Look for camera/permission errors

2. **Test Simple Scanner:**
   - Visit `/mobile-qr-test.html`
   - Try basic camera functionality

3. **Verify Network:**
   - Ensure mobile and server on same WiFi
   - Test with `http://localhost:5176` if possible

4. **Browser Settings:**
   - Clear browser cache
   - Reset site permissions
   - Try incognito/private mode

## 📞 Still Having Issues?

If the QR scanner still doesn't work:
1. Use the manual entry option
2. Use the test buttons provided
3. Check if your device supports WebRTC
4. Try a different mobile browser

## 🔧 Technical Details

The QR scanner uses:
- `html5-qrcode` library
- WebRTC for camera access
- Requires camera permissions
- Works best with HTTPS on mobile

**Port Configuration:**
- Development: `5176`
- Host: `0.0.0.0` (allows external access)
- CORS enabled for mobile compatibility