# Debugging LLM Behavioral Analysis

## Issue: Random Values Instead of AI Analysis

If you're seeing random or zero values instead of intelligent AI analysis, follow these steps:

---

## Quick Diagnostic

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Start a behavioral interview
4. Look for these logs:

**Good signs (LLM working):**
```
📡 [Client] API Response status: 200
✅ [Client] Received data: {ok: true, data: {...}}
```

**Bad signs (LLM failing):**
```
❌ [Client] API Response status: 500
📊 [Client] Metrics all showing 0
```

### Step 2: Check Server Logs

Look at your terminal where Next.js is running. You should see:

**Good flow:**
```
🎥 [Behavioral Stream] Starting analysis...
✅ [Behavioral Stream] API key found, initializing Gemini...
🤖 [Behavioral Stream] Calling Gemini AI...
✅ [Behavioral Stream] Gemini response received
📝 [Behavioral Stream] Raw response: {"metrics":{...
📊 [Behavioral Stream] Parsed metrics: {speechClarity: 75, ...}
✅ [Behavioral Stream] Analysis complete: {avgScore: 72, ...}
```

**Bad flow (API key missing):**
```
❌ [Behavioral Stream] GEMINI_API_KEY not configured
```

**Bad flow (AI error):**
```
❌ [Behavioral Stream] Error: [error message]
📋 [Behavioral Stream] Stack: [stack trace]
```

---

## Common Issues & Solutions

### Issue 1: API Key Not Found

**Symptoms:**
- Error: "GEMINI_API_KEY not configured"
- All metrics showing 0
- No observations

**Solution:**
```bash
# 1. Check if .env.local exists
ls -la .env.local

# 2. Verify the key is set
cat .env.local | grep GEMINI

# 3. Should see:
GEMINI_API_KEY=AIzaSy...

# 4. Restart Next.js server
# Press Ctrl+C to stop
npm run dev
```

### Issue 2: Invalid API Key

**Symptoms:**
- Error: "API key not valid"
- 403 or 401 status codes
- Gemini rejects requests

**Solution:**
1. Get a new API key: https://makersuite.google.com/app/apikey
2. Update `.env.local`:
   ```bash
   GEMINI_API_KEY=your_new_key_here
   ```
3. Restart the server

### Issue 3: Rate Limiting

**Symptoms:**
- Error: "Resource exhausted"
- Works sometimes, fails other times
- Error: "Too many requests"

**Solution:**
- Wait a few minutes
- Upgrade to paid Gemini tier
- Or reduce analysis frequency (currently every 2 seconds)

### Issue 4: Image Too Large

**Symptoms:**
- Error: "Request payload too large"
- Timeout errors
- Slow responses

**Solution:**
The image is already optimized to 640x360. If still having issues:
```typescript
// In BehavioralLive.tsx, reduce canvas size:
canvas.width = 320  // was 640
canvas.height = 180 // was 360
```

### Issue 5: Network/CORS Issues

**Symptoms:**
- Network errors in browser
- CORS errors
- Timeout

**Solution:**
```bash
# Check if running on correct ports
netstat -an | grep "3000\|8000"

# Should see:
# 0.0.0.0:3000  (frontend)
# 0.0.0.0:8000  (backend)
```

---

## Manual Testing

### Test the API Directly

Install dependencies:
```bash
npm install form-data
```

Run test script:
```bash
node test-behavioral-api.js
```

Expected output:
```
🧪 Testing Behavioral Analysis API...

📤 Sending request to http://localhost:3000/api/behavioral/stream
📥 Response status: 200

✅ API Response:
================
OK: true
Session ID: test-session-123

📊 Metrics:
  Speech Clarity: 65
  Tone Confidence: 70
  Emotional Stability: 75
  Eye Contact: 60
  Expressions: 68
  Engagement: 72

  Average Score: 68.33

💡 Observations: Candidate appears calm and centered...
💪 Strength: Good posture and steady presence
📈 Improvement: Increase eye contact with camera

================

✅ LLM is working correctly!
```

### Test in Browser Console

Open browser console and run:
```javascript
// Create test form
const form = new FormData()

// Create a small test image
const canvas = document.createElement('canvas')
canvas.width = 100
canvas.height = 100
const ctx = canvas.getContext('2d')
ctx.fillStyle = 'blue'
ctx.fillRect(0, 0, 100, 100)

canvas.toBlob(async (blob) => {
  form.append('frame', blob, 'test.jpg')
  form.append('sessionId', 'browser-test')
  
  const res = await fetch('/api/behavioral/stream', {
    method: 'POST',
    body: form
  })
  
  const data = await res.json()
  console.log('Response:', data)
  
  if (data.data?.metrics) {
    console.log('✅ Metrics received:', data.data.metrics)
    console.log('✅ Observations:', data.data.observations)
  } else {
    console.log('❌ No metrics in response')
  }
}, 'image/jpeg')
```

---

## Verify Changes Are Applied

### Check if logging is present:

```bash
# Search for new logging code
grep -r "Behavioral Stream" app/api/behavioral/
grep -r "Client.*API Response" components/interview/
```

Should find the new console.log statements.

### Restart the development server:

```bash
# Stop current server (Ctrl+C)
# Start fresh
npm run dev
```

---

## Expected Behavior

### When Working Correctly:

1. **Every 2 seconds:**
   - Camera captures frame
   - Audio chunk recorded
   - Both sent to API

2. **API Processing:**
   - ~1-2 second delay
   - Gemini analyzes frame + audio
   - Returns detailed JSON

3. **UI Updates:**
   - 6 progress bars animate smoothly
   - "AI Coach Insights" card appears
   - Blue box with observations
   - Green "Strength" card
   - Amber "Improve" card

4. **Metrics Range:**
   - Values between 40-90 (realistic)
   - Change gradually (smoothing applied)
   - Reflect actual performance

---

## Still Not Working?

### Collect Debug Info:

```bash
# 1. Check Node version
node --version  # Should be 18+

# 2. Check Next.js logs
# Look in terminal where npm run dev is running

# 3. Check environment
cat .env.local

# 4. Test API key directly
curl -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_KEY"

# Should return JSON with "candidates" array
```

### Enable Verbose Logging:

Add to `.env.local`:
```bash
DEBUG=*
NODE_ENV=development
```

---

## Contact Support

If still having issues, provide:

1. Browser console logs (full output)
2. Server terminal logs (full output)
3. Result of `node test-behavioral-api.js`
4. Screenshot of the behavioral interview UI
5. Your Next.js version: `npm list next`

---

## Summary

The LLM **IS** implemented and should be working. The most common issues are:

1. ❌ API key not configured → Add to `.env.local`
2. ❌ Server not restarted → Restart with `npm run dev`
3. ❌ Rate limiting → Wait or upgrade tier
4. ❌ Network issues → Check internet connection

With the new logging added, you can now see exactly what's happening at each step!
