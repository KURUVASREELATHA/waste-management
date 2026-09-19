
# Delete Functionality Troubleshooting Guide

## Common Issues and Solutions:

### 1. Authentication Issues
- **Problem**: Delete requests fail with 401 Unauthorized
- **Solution**: Ensure user is logged in and token is valid
- **Check**: localStorage.getItem('token') should return a valid JWT token

### 2. Network Connectivity
- **Problem**: Delete requests fail with network errors
- **Solution**: Ensure backend server is running on http://localhost:3001
- **Check**: Visit http://localhost:3001/api/health in browser

### 3. CORS Issues
- **Problem**: Delete requests blocked by CORS policy
- **Solution**: Ensure CORS is properly configured in backend
- **Check**: Backend should have app.use(cors()) middleware

### 4. Route Configuration
- **Problem**: Delete endpoints return 404 Not Found
- **Solution**: Verify routes are properly registered in server.js
- **Check**: Routes should be mounted at /api/waste and /api/reports

### 5. Frontend Implementation
- **Problem**: Delete buttons don't trigger API calls
- **Solution**: Check event handlers and API service calls
- **Check**: Console should show DELETE requests being made

## Quick Fixes:

### Fix 1: Restart Backend Server
```bash
cd backend
npm start
```

### Fix 2: Clear Browser Cache and Tokens
```javascript
localStorage.clear();
// Then login again
```

### Fix 3: Check Network Tab in Browser DevTools
- Open DevTools (F12)
- Go to Network tab
- Try to delete an item
- Look for DELETE requests and their status codes

### Fix 4: Verify Authentication
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
```

## Testing Delete Functionality:

1. **Test Waste Delete**:
   - Go to Citizen Dashboard > Waste History
   - Click Delete button on any waste record
   - Check browser console for errors

2. **Test Report Delete**:
   - Go to Citizen Dashboard > My Reports
   - Click Delete button on any report
   - Check browser console for errors

3. **Test Product Delete**:
   - Go to Recycling Center Dashboard > My Products
   - Click Delete button on any product
   - Check browser console for errors

## Debug Commands:

### Check if server is running:
```bash
curl http://localhost:3001/api/health
```

### Test delete endpoint with curl:
```bash
curl -X DELETE http://localhost:3001/api/waste/WASTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

If none of these solutions work, please check:
1. Server logs for error messages
2. Browser console for JavaScript errors
3. Network tab for failed requests
4. Database connection status
