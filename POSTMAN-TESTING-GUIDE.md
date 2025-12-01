# 🚀 Postman Testing Guide - API Service

## Step 1: Import the Collection into Postman

1. Open **Postman**
2. Click **"Import"** (top left)
3. Select **"Upload Files"**
4. Choose `Postman-Collection.json` from this project
5. Click **"Import"**

---

## Step 2: Test Health & Documentation

### 2.1 Check Server Health
- **Request:** `GET /health`
- **Expected Response:** 
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T...",
  "environment": "development"
}
```

### 2.2 View API Documentation
- **Request:** `GET /`
- **Expected Response:** All available endpoints with examples

---

## Step 3: Generate an API Key ⭐ (START HERE)

1. Go to **"API Keys" → "Generate New API Key"**
2. Click **"Send"**
3. You'll get a response like:
```json
{
  "message": "API Key generated successfully",
  "key": {
    "id": 1,
    "apikey": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "name": "My Test App",
    "total_calls": 100,
    "used_calls": 0,
    "is_active": true,
    "created_at": "2025-12-01T10:30:00Z"
  }
}
```
4. **Copy the `apikey` value** - you'll need this for the next steps!

---

## Step 4: Execute an API Call (Consumes Quota)

1. Go to **"API Calls & Execution" → "Execute API Call (Uses Quota)"**
2. Replace `YOUR_API_KEY_HERE` in the **X-API-Key header** with the key from Step 3
3. Edit the body if needed:
```json
{
  "endpoint": "/process-data",
  "action": "process_data"
}
```
4. Click **"Send"**
5. You'll see:
   - ✅ Response data
   - 📊 Quota information showing remaining calls
   - ⏱️ Execution time

---

## Step 5: View Your Logs

1. Go to **"API Calls & Execution" → "Get My API Call Logs"**
2. Replace `YOUR_API_KEY_HERE` with your API key
3. Click **"Send"**
4. See all your API calls logged with timestamps and details

---

## Step 6: Check API Key Statistics

1. Go to **"API Keys" → "Get API Key Statistics"**
2. Replace `1` in the URL with your API key ID (from Step 3)
3. Click **"Send"**
4. View usage stats:
   - Total calls made
   - Successful vs failed calls
   - Average execution time
   - Remaining quota

---

## Step 7: Admin Endpoints (No Auth Required)

### View All API Calls
- Go to **"API Calls & Execution" → "Admin - Get All API Calls"**
- See all API calls from all keys

### View Statistics
- Go to **"API Calls & Execution" → "Admin - Get Statistics"**
- See overall system stats for last 24 hours

---

## 🧪 Test Scenarios

### Test 1: Quota Exhaustion
1. Generate a key with `total_calls: 5`
2. Call the execute endpoint 6 times
3. On the 6th call, you should get `429 Quota exceeded`

### Test 2: Invalid API Key
1. Go to execute endpoint
2. Use a fake key: `X-API-Key: fake-key-123`
3. You should get `401 Invalid API Key`

### Test 3: Revoke Key & Test
1. Generate a key
2. Go to **"API Keys" → "Revoke API Key"**
3. Try to use that key in execute
4. You should get `403 API key is revoked`
5. Go to **"API Keys" → "Reactivate API Key"**
6. Now try to use the key again - it should work! ✅

---

## 📝 Additional Actions

### Get All Keys (with Pagination)
- Go to **"API Keys" → "Get All API Keys"**
- Shows all active keys with remaining quotas

### Get Specific Key Details
- Go to **"API Keys" → "Get Specific API Key Details"**
- Replace `1` with the ID you want to check

### Delete a Key
- Go to **"API Keys" → "Delete API Key"**
- Replace `1` with the ID to delete

---

## 🔗 Quick Reference

| Action | Method | Endpoint | Auth Required |
|--------|--------|----------|----------------|
| Generate Key | POST | `/api/keys/generate` | ❌ No |
| List Keys | GET | `/api/keys` | ❌ No |
| Get Key Details | GET | `/api/keys/:id` | ❌ No |
| Get Stats | GET | `/api/keys/:id/stats` | ❌ No |
| Revoke Key | PATCH | `/api/keys/:id/revoke` | ❌ No |
| Reactivate Key | PATCH | `/api/keys/:id/reactivate` | ❌ No |
| Delete Key | DELETE | `/api/keys/:id` | ❌ No |
| **Execute API** | **POST** | **/api/calls/execute** | **✅ Yes** |
| View My Logs | GET | `/api/calls/logs` | ✅ Yes |
| Admin - All Calls | GET | `/api/calls/admin/all-calls` | ❌ No |
| Admin - Stats | GET | `/api/calls/admin/statistics` | ❌ No |

---

## 💡 Tips

1. **Save your API keys** - Once generated, you won't see them again
2. **Use Postman Variables** - Store your API key in a variable for easy switching
3. **Monitor quotas** - Check stats to know when you're running low
4. **Test with different actions** - Try: `process_data`, `fetch_info`, `generate_report`

---

## 🆘 Troubleshooting

**Connection Refused?**
- Make sure the server is running: `npm start`
- Check it's on port 3001

**API Key not working?**
- Make sure you've set the `X-API-Key` header correctly
- Copy the key exactly from the generation response

**Quota exceeded?**
- Generate a new key with higher `total_calls` value
- Or revoke and delete the old key

---

Happy Testing! 🎉
