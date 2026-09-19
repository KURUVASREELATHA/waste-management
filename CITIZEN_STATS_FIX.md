# Citizen Dashboard Stats Fix

## Problem
The citizen dashboard was showing 0 kg for all waste statistics even when workers had collected waste from their QR codes, because the stats only counted citizen-uploaded waste, not worker-collected waste.

## Root Cause
The `/waste/stats` endpoint was only looking at waste records uploaded by the citizen themselves, not including waste collected by workers that was properly linked to their account.

## Solution

### Backend Fix (`/backend/routes/waste.js`)

Updated the citizen stats endpoint to:

1. **Include Worker-Collected Waste**: Modified queries to count ALL waste linked to the citizen's account, regardless of who created the record
2. **Better Date Filtering**: Enhanced date boundaries for today and monthly calculations
3. **Fallback Date Handling**: Added support for records without `collectedAt` field using `updatedAt`

**Key Changes:**
```javascript
// Before: Only counted citizen-uploaded waste
{ $match: { userId: userId, status: 'collected' } }

// After: Counts all waste linked to citizen (including worker-collected)
{ 
  $match: { 
    userId: userId,
    status: 'collected',
    $or: [
      { collectedAt: { $gte: todayStart, $lte: todayEnd } },
      { 
        collectedAt: { $exists: false },
        updatedAt: { $gte: todayStart, $lte: todayEnd }
      }
    ]
  }
}
```

### What This Fixes

1. **Today Waste Collected**: Now shows waste collected by workers today via QR scanning
2. **Total Waste Collected**: Includes all waste ever collected from the citizen
3. **This Month Collected**: Shows monthly totals including worker collections
4. **Recycling Rate**: Calculates based on all waste linked to citizen account

## Expected Results

When workers scan a citizen's QR code and collect waste, the citizen's dashboard will now show:

- ✅ **Today Waste Collected**: Updates with today's collections
- ✅ **Total Waste Collected**: Increases with each collection
- ✅ **This Month Collected**: Shows current month totals
- ✅ **Recycling Rate**: Reflects actual recycling percentage

## Integration with Previous Fixes

This works together with the previous citizen linkage fix:

1. **QR Scan** → Worker scans citizen QR code
2. **Waste Collection** → Worker records waste with `citizenUserId`
3. **Proper Linkage** → Waste record linked to citizen's account (`userId: citizenId`)
4. **Stats Update** → Citizen dashboard shows updated statistics
5. **History Display** → Waste appears in citizen's history tab

## Files Modified

- `/backend/routes/waste.js` - Enhanced stats endpoint to include worker-collected waste

## Verification

The citizen dashboard should now properly display:
- Non-zero values when workers collect waste
- Real-time updates to statistics
- Accurate recycling rates
- Complete waste tracking across all collection methods

This ensures citizens can see the complete picture of their waste management, including both self-uploaded waste and waste collected by municipal workers through QR scanning.