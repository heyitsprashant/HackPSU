# Enhanced LLM-Powered Behavioral Metrics System

## Overview

The behavioral metrics system now uses **Google Gemini 2.0 Flash** AI to analyze live camera feeds during mock interviews, providing real-time, intelligent feedback on candidate performance.

---

## How It Works

### 1. Live Camera Capture
- Every 2 seconds, the system captures:
  - **Video Frame**: Current camera snapshot (640x360)
  - **Audio Chunk**: 2-second audio recording (if available)
  - **Transcript Context**: Previous responses for context

### 2. LLM Analysis Pipeline

```
Camera Feed → Frame Capture → Base64 Encoding → Gemini AI Analysis → Metrics
     ↓              ↓                ↓                    ↓              ↓
  Audio       Audio Chunk      Audio Encoding      Detailed Analysis  JSON Response
```

### 3. AI Analysis Process

The LLM evaluates **6 core metrics** in real-time:

#### Metrics Analyzed:

1. **Speech Clarity (0-100)**
   - Articulation and pronunciation
   - Speaking pace (not too fast/slow)
   - Volume and projection
   - Uses audio if available, otherwise estimates from visual cues

2. **Tone Confidence (0-100)**
   - Vocal strength and assertiveness
   - Steady delivery without hesitation
   - Confidence in voice
   - Estimated from body language if no audio

3. **Emotional Stability (0-100)**
   - Composure under pressure
   - Controlled facial expressions
   - Minimal visible anxiety or stress
   - Steady breathing and movements

4. **Eye Contact (0-100)**
   - Looking directly at camera (simulates interviewer eye contact)
   - Consistency of gaze
   - Minimal looking away or down

5. **Facial Expressions (0-100)**
   - Natural, appropriate expressions
   - Genuine smiles and engagement
   - Professional demeanor
   - No signs of excessive nervousness

6. **Engagement (0-100)**
   - Body posture and positioning
   - Centered in frame
   - Upright, professional posture
   - Active listening cues

---

## LLM Prompt Engineering

### Detailed Analysis Instructions

The system provides the LLM with:

1. **Clear Scoring Guidelines**:
   - 90-100: Exceptional, professional
   - 70-89: Good, minor improvements
   - 50-69: Average, noticeable areas to work on
   - 30-49: Below average
   - 0-29: Major issues

2. **Specific Evaluation Criteria** for each metric

3. **Context Awareness**:
   - Previous transcript (last 300 characters)
   - Audio presence detection
   - Visual-only fallback strategies

### Sample Prompt Structure:
```
You are an expert behavioral interview coach...

ANALYZE THE LIVE VIDEO FRAME:

1. EYE CONTACT (0-100):
   - Is the person looking directly at the camera?
   - Measure: Consistent gaze, no excessive looking away
   [detailed criteria...]

2. FACIAL EXPRESSIONS (0-100):
   [detailed criteria...]

[... 6 metrics total ...]

Return ONLY valid JSON:
{
  "metrics": {
    "speechClarity": <number>,
    "toneConfidence": <number>,
    ...
  },
  "transcript": "what you hear",
  "observations": "2-3 sentence summary",
  "topStrength": "key strength",
  "topWeakness": "area to improve"
}
```

---

## Response Structure

### API Response Format:
```typescript
{
  ok: true,
  data: {
    metrics: {
      speechClarity: 75,      // 0-100
      toneConfidence: 68,     // 0-100
      emotionalStability: 82, // 0-100
      eyeContact: 71,         // 0-100
      expressions: 78,        // 0-100
      engagement: 73          // 0-100
    },
    transcript: "I believe my experience in...",
    observations: "Candidate maintains good posture and eye contact. Speaking pace is appropriate. Could benefit from more expressive gestures.",
    topStrength: "Strong eye contact and steady voice",
    topWeakness: "Could use more hand gestures to emphasize points"
  },
  sessionId: "abc123"
}
```

---

## UI Display

### Real-Time Feedback Components:

1. **Performance Metrics** (Progress Bars)
   - 6 live-updating progress bars
   - Color-coded: Green (80+), Yellow (50-79), Red (<50)
   - Smooth animations with exponential moving average

2. **AI Coach Insights** (NEW!)
   - **Observations**: Blue card with 2-3 sentence summary
   - **Strength**: Green card highlighting what's working well
   - **Area to Improve**: Amber card with constructive feedback

3. **Live Transcript**
   - Real-time transcription of responses
   - Scrollable text area
   - Context for question answering

4. **Recent History**
   - Last 6 metric samples
   - Shows trending performance
   - Helps identify patterns

---

## Technical Implementation

### Files Modified:

1. **`app/api/behavioral/stream/route.ts`**
   - Enhanced LLM prompt (60+ lines of detailed criteria)
   - Metric normalization (ensure 0-100 range)
   - Response validation and parsing
   - Error handling with fallback values

2. **`components/interview/BehavioralLive.tsx`**
   - Added `liveInsights` state
   - Display AI observations in real-time
   - Strength/weakness cards with emoji icons
   - Responsive grid layout

### Data Flow:

```
BehavioralLive Component
    ↓
Capture video frame (canvas) + audio blob
    ↓
FormData → /api/behavioral/stream (POST)
    ↓
Gemini AI Analysis (with detailed prompt)
    ↓
JSON Response with metrics + insights
    ↓
Update UI: Metrics bars + Insight cards
    ↓
Smooth animation (exponential moving average, α=0.4)
```

---

## Metric Smoothing

To prevent erratic jumps, metrics use **exponential smoothing**:

```typescript
newValue = (1 - α) × oldValue + α × llmValue
where α = 0.4 (smoothing factor)
```

This creates smooth transitions while still responding to real changes.

---

## Example Usage

### Start a Behavioral Interview:

1. Navigate to Mock Interviews → Behavioral
2. Click "Start Interview Session"
3. Answer the displayed question
4. Watch real-time metrics update every 2 seconds
5. Review AI insights for immediate feedback

### What You'll See:

```
┌─────────────────────────────────────────┐
│ Performance Metrics                     │
├─────────────────────────────────────────┤
│ Speech Clarity        ████████░░ 75%   │
│ Tone Confidence       ███████░░░ 68%   │
│ Emotional Stability   █████████░ 82%   │
│ Eye Contact           ████████░░ 71%   │
│ Expressions           ████████░░ 78%   │
│ Engagement            ████████░░ 73%   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ AI Coach Insights                       │
├─────────────────────────────────────────┤
│ 🔵 Good posture and steady eye contact.│
│    Speaking pace is appropriate. Could │
│    benefit from more expressive body   │
│    language to emphasize key points.   │
│                                         │
│ ┌──────────────┬───────────────────┐   │
│ │ 💪 Strength  │ 📈 Improve        │   │
│ ├──────────────┼───────────────────┤   │
│ │ Strong eye   │ Add hand gestures │   │
│ │ contact and  │ to emphasize      │   │
│ │ steady voice │ key points        │   │
│ └──────────────┴───────────────────┘   │
└─────────────────────────────────────────┘
```

---

## AI Model Configuration

### Gemini 2.0 Flash Exp

- **Model**: `gemini-2.0-flash-exp`
- **Input**: Video frame (base64 JPEG) + optional audio (WebM)
- **Max Input**: ~1MB per request
- **Response Time**: ~1-2 seconds
- **Cost**: Free tier available (rate limited)

### Why Gemini 2.0 Flash?

1. **Multimodal**: Analyzes both video and audio
2. **Fast**: ~1-2 second latency for real-time use
3. **Context-Aware**: Understands interview scenarios
4. **Detailed**: Can provide nuanced observations
5. **Cost-Effective**: Free tier suitable for development

---

## Scoring Interpretation

### Score Ranges:

| Range | Interpretation | Color | Action |
|-------|---------------|-------|--------|
| 90-100 | Exceptional | Green | Maintain this level |
| 80-89 | Very Good | Light Green | Minor polish |
| 70-79 | Good | Yellow | Small improvements |
| 60-69 | Average | Orange | Focus on feedback |
| 50-59 | Below Average | Light Red | Practice specific areas |
| 0-49 | Needs Work | Red | Major improvement needed |

---

## Best Practices

### For Accurate Analysis:

1. **Good Lighting**: Ensure face is well-lit
2. **Clear Audio**: Use good microphone if possible
3. **Stable Camera**: Keep camera steady, face centered
4. **Eye Contact**: Look directly at camera
5. **Professional Background**: Minimize distractions

### For Better Scores:

1. **Practice STAR Method**: Situation, Task, Action, Result
2. **Smile Naturally**: Engage with expressions
3. **Sit Upright**: Professional posture
4. **Speak Clearly**: Moderate pace, clear articulation
5. **Use Gestures**: Emphasize points with hand movements

---

## Troubleshooting

### Metrics Not Updating?

1. Check camera/microphone permissions
2. Verify Gemini API key is configured
3. Check browser console for errors
4. Ensure stable internet connection

### Low Scores Despite Good Performance?

1. Check lighting (face should be clearly visible)
2. Ensure looking at camera (not screen)
3. Verify audio is being captured
4. Wait for multiple samples (smoothing takes effect)

### API Errors?

1. Verify `GEMINI_API_KEY` in `.env`
2. Check API quota/rate limits
3. Review backend logs for details
4. Ensure video frame size is reasonable (<1MB)

---

## Future Enhancements

Potential improvements:

- [ ] Add STAR framework detection (Situation, Task, Action, Result)
- [ ] Detect filler words ("um", "uh", "like")
- [ ] Track hand gestures and body language
- [ ] Measure response timing and pacing
- [ ] Compare against ideal interview benchmarks
- [ ] Generate post-interview summary report
- [ ] Record and replay sessions for review
- [ ] Multi-language support

---

## API Endpoints

### POST `/api/behavioral/stream`

**Request**:
```typescript
FormData {
  frame: File (JPEG image),
  audio?: File (WebM audio),
  sessionId: string,
  transcript?: string
}
```

**Response**:
```typescript
{
  ok: boolean,
  data: {
    metrics: {
      speechClarity: number,
      toneConfidence: number,
      emotionalStability: number,
      eyeContact: number,
      expressions: number,
      engagement: number
    },
    transcript?: string,
    observations?: string,
    topStrength?: string,
    topWeakness?: string
  },
  sessionId: string
}
```

---

## Environment Setup

### Required Environment Variables:

```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

---

## Summary

The enhanced behavioral metrics system uses state-of-the-art AI to provide:

✅ **Real-time analysis** of 6 key interview metrics
✅ **Live feedback** with observations and actionable insights  
✅ **Intelligent scoring** based on professional interview standards
✅ **Smooth updates** with exponential smoothing
✅ **Context-aware** analysis using previous responses
✅ **Multimodal** evaluation (video + audio)

This creates a comprehensive, AI-powered interview coaching experience that helps candidates improve their behavioral interview skills with immediate, actionable feedback.
