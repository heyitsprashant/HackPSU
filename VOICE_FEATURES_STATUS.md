# Voice/TTS Features Status

## ✅ Working Features

### 1. **AI Response Cards (Study/Interview Sessions)**
- **Location**: `components/AIResponseCard.tsx`
- **Functionality**: Volume button (🔊) in top-right of feedback cards
- **How it works**:
  - **Primary**: Uses OpenRouter API (`/api/tts`) for high-quality speech
  - **Fallback**: Browser's native Web Speech API if API fails
  - Supports play/pause functionality
  - Auto-cleans markdown formatting before speaking

### 2. **Settings Page Voice Configuration**
- **Location**: `app/dashboard/settings/page.tsx`
- **Settings Available**:
  - ✅ Voice Narration toggle (read questions/feedback aloud)
  - ✅ Sound Effects toggle
  - ✅ Voice Speed selection (Slow, Normal, Fast)
- **Storage**: Settings saved to `localStorage` as `accessibility-settings`
- **Status**: ⚠️ **Settings exist but NOT yet integrated with TTS system**

### 3. **TTS API Endpoint**
- **Location**: `app/api/tts/route.ts`
- **Provider**: OpenRouter (routes to OpenAI TTS)
- **Model**: `openai/tts-1`
- **Voice**: `alloy` (options: alloy, echo, fable, onyx, nova, shimmer)
- **Output**: MP3 audio stream
- **API Key**: Uses `OPENROUTER_API_KEY` from env

---

## ⚠️ Issues Identified

### Issue 1: Settings Not Applied
**Problem**: Voice settings in Settings page don't affect actual TTS behavior

**Current State**:
- Settings are saved to localStorage ✅
- Settings are NOT read by `useTextToSpeech` hook ❌

**Fix Needed**:
```typescript
// In useTextToSpeech.ts, read settings:
const settings = JSON.parse(localStorage.getItem('accessibility-settings') || '{}')
const voiceEnabled = settings.voiceNarration !== false
const voiceSpeed = settings.voiceSpeed || 'normal'

// Apply speed setting:
utterance.rate = voiceSpeed === 'slow' ? 0.75 : voiceSpeed === 'fast' ? 1.25 : 1.0
```

### Issue 2: Voice Selection Not Configurable
**Problem**: Voice is hardcoded to "alloy"

**Fix**: Add voice selection dropdown in Settings page:
- Options: alloy, echo, fable, onyx, nova, shimmer
- Pass selected voice to TTS API

---

## 🔧 Configuration Status

### Environment Variables
```bash
# Current in .env.local:
GEMINI_API_KEY=AIzaSyBwqZH56W6h_ep-BXIgBJWvKDIKAhTy5Gg  ✅ Updated
OPENROUTER_API_KEY=sk-or-v1-c83e777f...  ✅ Active (for TTS)
```

### API Endpoints
| Endpoint | Status | Provider |
|----------|--------|----------|
| `/api/tts` | ✅ Working | OpenRouter → OpenAI TTS |
| `/api/voice/speak` | ⚠️ Deprecated | Returns 410 error |
| `/api/chat` | ✅ Working | Gemini/OpenRouter fallback |

---

## 🎯 Current Functionality

### Where TTS Works:
1. **Study Sessions** - Feedback cards have 🔊 button
2. **Interview Sessions** - Feedback cards have 🔊 button
3. **Practice Sessions** - Feedback cards have 🔊 button

### Where TTS Settings Apply:
- ❌ Settings page exists but not integrated
- ❌ Voice speed not applied
- ❌ Voice selection not available
- ❌ Voice narration toggle not connected

---

## 📋 Recommended Fixes

### Priority 1: Connect Settings to TTS Hook
Modify `hooks/useTextToSpeech.ts` to read and apply user settings.

### Priority 2: Add Voice Selection
Add voice picker in Settings page and pass to TTS API.

### Priority 3: Auto-Narration
Implement auto-play when `voiceNarration` is enabled in settings.

---

## 🧪 Testing

### Test TTS Directly:
```bash
# In browser console:
fetch('/api/tts', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({text: 'Hello, this is a test'})
}).then(r => r.blob()).then(b => {
  const audio = new Audio(URL.createObjectURL(b))
  audio.play()
})
```

### Test Settings:
1. Go to `/settings` or `/dashboard/settings`
2. Enable "Voice Narration"
3. Select "Fast" voice speed
4. Click "Save Settings"
5. Check localStorage: `localStorage.getItem('accessibility-settings')`
6. ⚠️ Currently, these settings won't affect TTS until integrated

---

## Summary

**TTS/Voice Features Status**: ✅ **WORKING** (with limitations)

- ✅ TTS button works on feedback cards
- ✅ OpenRouter TTS API functional
- ✅ Browser fallback works
- ⚠️ Settings page NOT connected to TTS system
- ⚠️ Voice customization not implemented

**Why Settings Don't Work Yet**:
The settings UI exists and saves preferences, but the `useTextToSpeech` hook doesn't read these settings. This requires integration work to connect the two systems.

**Immediate Action Needed**:
Restart dev server for new Gemini API key to take effect.
