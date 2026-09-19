# QR Code Implementation for Citizen Dashboard

## Overview
This implementation adds QR code functionality to the WasteWise system, allowing citizens to generate QR codes that can be scanned with Google Lens or any QR scanner to display their details, house ID, and waste collection data along with IoT sensor information.

## Features Implemented

### 1. QR Code Generation
- **Location**: Citizen Dashboard → "My QR Code" tab
- **Functionality**: Generates unique QR codes for each citizen
- **Data Stored**: Citizen details, house ID, waste collection stats, IoT sensor data

### 2. QR Code Scanning
- **Location**: `/qr-scanner` route (accessible to all users)
- **Functionality**: Scan QR codes using camera or manual entry
- **Google Lens Compatible**: QR codes work with Google Lens and camera apps

### 3. Citizen Information Display
When QR code is scanned, displays:
- **Citizen Details**: Name, email, phone, address, house ID
- **Waste Collection Data**: Total collected, last collection date, recent entries
- **IoT Sensor Status**: Sensor ID, current weight, battery level, connection status

### 4. IoT Integration
- **Mock IoT Data**: Simulated sensor readings for demonstration
- **Real-time Updates**: IoT data updates when QR code is scanned
- **Battery Monitoring**: Shows battery level and status indicators

## Files Created/Modified

### Backend Files
1. **`backend/models/QRCode.js`** - QR code data model
2. **`backend/routes/qrcode.js`** - QR code API routes
3. **`backend/server.js`** - Added QR code routes
4. **`backend/initializeQRCodes.js`** - Script to create QR codes for existing citizens

### Frontend Files
1. **`src/components/qr/QRDisplay.tsx`** - QR code display component
2. **`src/components/qr/QRScanResult.tsx`** - Scan result display component
3. **`src/pages/QRScannerPage.tsx`** - Standalone QR scanner page
4. **`src/pages/CitizenDashboard.tsx`** - Added QR code tab
5. **`src/components/layout/Navbar.tsx`** - Added QR scanner navigation
6. **`src/App.tsx`** - Added QR scanner route

### Utility Files
1. **`test-qr-functionality.js`** - Test script for QR functionality
2. **`QR_CODE_IMPLEMENTATION.md`** - This documentation

## API Endpoints

### 1. Generate QR Code
```
POST /api/qrcode/generate
Authorization: Bearer <token>
```
Creates QR code for authenticated citizen.

### 2. Scan QR Code
```
GET /api/qrcode/scan/:qrCode
```
Returns citizen details and waste data for scanned QR code.

### 3. Get My QR Code
```
GET /api/qrcode/my-qr
Authorization: Bearer <token>
```
Returns QR code data for authenticated citizen.

### 4. Update IoT Data
```
PATCH /api/qrcode/iot-update/:qrCode
Content-Type: application/json
{
  "currentWeight": 25.5,
  "batteryLevel": 85,
  "status": "active"
}
```
Updates IoT sensor data for a QR code.

## Setup Instructions

### 1. Initialize QR Codes for Existing Citizens
```bash
cd backend
node initializeQRCodes.js
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

### 3. Start Frontend
```bash
npm run dev
```

### 4. Test QR Functionality
```bash
node test-qr-functionality.js
```

## Usage Guide

### For Citizens
1. Login to citizen dashboard
2. Go to "My QR Code" tab
3. Click "Generate QR Code" if not exists
4. Download or share QR code
5. QR code contains: `https://wastewise.app/scan/{qrCode}`

### For Municipal Workers/Scanners
1. Visit `/qr-scanner` route
2. Use camera to scan QR code OR enter code manually
3. View citizen details, house ID, and waste collection data
4. See real-time IoT sensor information

### Google Lens Compatibility
- QR codes generate URLs in format: `https://wastewise.app/scan/{qrCode}`
- Compatible with Google Lens, camera apps, and QR scanners
- Automatically redirects to scan result page

## Database Schema

### QRCode Collection
```javascript
{
  citizenId: ObjectId,           // Reference to Citizen
  qrCode: String,               // Unique QR code
  houseId: String,              // House identification
  citizenName: String,          // Citizen name
  citizenEmail: String,         // Citizen email
  citizenPhone: String,         // Citizen phone
  citizenAddress: String,       // Citizen address
  totalWasteCollected: Number,  // Total waste in kg
  lastCollectionDate: Date,     // Last collection date
  iotData: {
    sensorId: String,           // IoT sensor ID
    currentWeight: Number,      // Current weight reading
    lastReading: Date,          // Last sensor reading
    batteryLevel: Number,       // Battery percentage
    status: String              // active/inactive/maintenance
  },
  isActive: Boolean,            // QR code status
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features
- QR codes are unique and non-guessable
- Citizen authentication required for generation
- Public scanning for transparency
- IoT data validation and sanitization

## Future Enhancements
1. **Real IoT Integration**: Connect to actual IoT sensors
2. **QR Code Expiry**: Add expiration dates for security
3. **Batch QR Generation**: Generate QR codes for multiple citizens
4. **Analytics**: Track QR code scan statistics
5. **Offline Support**: Cache QR data for offline scanning

## Troubleshooting

### Common Issues
1. **QR Code Not Generating**: Check citizen authentication and database connection
2. **Scan Not Working**: Verify QR code format and API endpoints
3. **IoT Data Not Updating**: Check network connectivity and sensor status
4. **Google Lens Issues**: Ensure QR code URL format is correct

### Debug Steps
1. Check browser console for errors
2. Verify API endpoints are responding
3. Test with manual QR code entry
4. Check database for QR code records

## Testing
Run the test script to verify functionality:
```bash
node test-qr-functionality.js
```

This tests:
- QR code scanning endpoint
- IoT data update endpoint
- Error handling for invalid codes

## Conclusion
The QR code implementation provides a seamless way for citizens to share their waste collection information and for municipal workers to access citizen data quickly. The system is designed to be compatible with Google Lens and standard QR scanners, making it accessible and user-friendly.