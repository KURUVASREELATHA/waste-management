# Municipality Model Update for Location Tracking

## Changes Made

### 1. Municipality Model Updated
- Added location tracking fields to `backend/models/Municipality.js`:
  - `currentLocation: { lat, lng, lastUpdated }`
  - `isLocationActive: Boolean`
  - `vehicleId, route, vehicleCapacity, currentLoad`
  - `status: ['available', 'collecting', 'en_route', 'offline']`

### 2. Workers Routes Updated
- Updated `backend/routes/workers.js` to use `Municipality` model instead of `User` model
- All location tracking now uses municipalities collection

### 3. Test Script Updated
- Modified `test-location-tracking.js` to check municipalities instead of users

## Database Structure

Workers are now stored in the `municipalities` collection with these fields:
```javascript
{
  name: String,
  email: String,
  role: 'worker',
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  },
  isLocationActive: Boolean,
  status: String,
  vehicleId: String,
  route: String,
  vehicleCapacity: Number,
  currentLoad: Number
}
```

## API Endpoints (Unchanged)
- `GET /api/workers/active` - Returns active workers from municipalities
- `PATCH /api/workers/location` - Updates location in municipalities
- `PATCH /api/workers/status` - Updates status in municipalities

The frontend LocationTracker and VehicleMap components work unchanged - only the backend data source changed from users to municipalities.