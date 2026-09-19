# Penalties System Testing Guide

## Overview
The penalties system allows municipal workers to issue penalties to citizens for waste segregation violations and enables citizens to view and pay their penalties.

## Quick Setup & Testing

### 1. Start the Backend Server
```bash
cd backend
npm start
```

### 2. Create Test Users (Run once)
```bash
node create-admin-user.js
```
This creates:
- Admin: admin@wastewise.com / admin123
- Worker: worker@wastewise.com / worker123

### 3. Run Complete Test
```bash
node test-penalties-complete.js
```
This will:
- Create test citizen
- Test penalty issuance
- Test penalty payment
- Verify all API endpoints

### 4. Test in Frontend

#### For Municipal Workers:
1. Login at `/auth/worker` with:
   - Email: worker@wastewise.com
   - Password: worker123

2. Go to "Penalties" tab in dashboard
3. Click "Issue Penalty" to create new penalties
4. View all penalties and manage disputes

#### For Citizens:
1. Login at `/auth` with:
   - Email: citizen@test.com
   - Password: citizen123

2. Go to "Penalties" tab in dashboard
3. View your penalties
4. Pay or dispute penalties

## Features Implemented

### Municipal Worker Features:
- ✅ Issue penalties with evidence photos
- ✅ View all penalties in the system
- ✅ Manage penalty disputes (accept/reject)
- ✅ View penalty statistics and revenue
- ✅ Filter penalties by status

### Citizen Features:
- ✅ View personal penalties
- ✅ Pay penalties online
- ✅ Dispute penalties with reasons
- ✅ View penalty history and status
- ✅ See penalty statistics (total paid, pending)

### Backend API Endpoints:
- ✅ POST `/api/penalties/issue` - Issue new penalty
- ✅ GET `/api/penalties/all` - Get all penalties (workers only)
- ✅ GET `/api/penalties/my-penalties` - Get citizen's penalties
- ✅ PATCH `/api/penalties/:id/pay` - Pay penalty
- ✅ PATCH `/api/penalties/:id/dispute` - Dispute penalty
- ✅ PATCH `/api/penalties/:id/resolve-dispute` - Resolve dispute
- ✅ GET `/api/penalties/stats` - Get penalty statistics

## Database Models

### Penalty Schema:
```javascript
{
  citizenId: ObjectId (ref: Citizen),
  issuedBy: ObjectId (ref: Municipality),
  violationType: String (enum),
  description: String,
  amount: Number,
  evidenceImage: String,
  location: String,
  status: String (pending/paid/disputed/waived),
  paymentMethod: String,
  paymentDate: Date,
  disputeReason: String,
  disputeResolution: String,
  citizenName: String,
  citizenHouseId: String
}
```

## Troubleshooting

### Common Issues:

1. **"No citizens found"**
   - Run the complete test script to create test data
   - Or register a citizen through the frontend

2. **"Authentication failed"**
   - Make sure you're using the correct login credentials
   - Check that the backend server is running

3. **"Failed to issue penalty"**
   - Ensure you're logged in as a worker or admin
   - Check that the citizen ID is valid

4. **Frontend not loading penalties**
   - Check browser console for errors
   - Verify API endpoints are responding
   - Check network tab for failed requests

### Test Commands:
```bash
# Test basic functionality
node test-penalties-simple.js

# Test complete system
node test-penalties-complete.js

# Create admin user only
node create-admin-user.js
```

## System Status
✅ Backend API fully implemented
✅ Frontend components working
✅ Authentication integrated
✅ File upload for evidence
✅ Payment processing
✅ Dispute management
✅ Statistics and reporting

The penalties system is now fully functional and ready for use!