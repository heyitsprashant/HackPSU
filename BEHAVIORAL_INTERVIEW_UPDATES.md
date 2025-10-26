# Behavioral Interview Updates

## Overview
Enhanced the behavioral interview component to include structured question-asking functionality along with the existing camera/audio capture and analysis features.

## New Features

### 1. **Question Queue System**
- Automatically loads and displays behavioral interview questions
- Supports 8 default STAR-method questions
- Can load custom questions from parsed email data

### 2. **Question Display**
- **Prominent Question Card**: Shows current question in large, readable text
- **Progress Tracking**: Visual progress bar showing question X of Y
- **Question Counter**: Badge display of current position
- **STAR Method Tip**: Helpful reminder about Situation, Task, Action, Result

### 3. **Timer Functionality**
- **Per-Question Timer**: 2 minutes (120 seconds) per question
- **Visual Countdown**: MM:SS format display
- **Warning State**: Timer turns red when under 30 seconds remaining
- **Auto-Advance**: Automatically moves to next question when time expires

### 4. **Question Navigation**
- **Next Question Button**: Manual skip to next question
- **Auto-Save Answers**: Each answer is saved with timestamp before advancing
- **Answer Storage**: Stores question, transcript answer, and duration for each response

### 5. **Enhanced UI/UX**
- **Section Headers**: Organized metrics, transcript, and history sections
- **Better Formatting**: Improved typography and spacing
- **Status Indicators**: Clear visual feedback for all states
- **Coaching Integration**: Real-time coaching button passes current question context

### 6. **Smart Question Loading**
- **Session-Specific Questions**: Loads behavioral questions from email parsing if available
- **Company-Specific**: Can filter questions by interview type from session data
- **Fallback to Defaults**: Uses 8 standard questions if no custom ones found

## Default Questions

1. Tell me about yourself and your background.
2. Describe a challenging project you worked on. What was your role?
3. Tell me about a time you disagreed with a teammate. How did you handle it?
4. Give me an example of when you had to learn something new quickly.
5. Describe a situation where you had to make a decision with incomplete information.
6. Tell me about a time you failed. What did you learn from it?
7. How do you handle competing priorities and tight deadlines?
8. Describe a time when you had to persuade someone to see things your way.

## Technical Details

### State Management
```typescript
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null)
const [timeRemaining, setTimeRemaining] = useState(QUESTION_DURATION)
const [questionAnswers, setQuestionAnswers] = useState<Array<{
  question: string
  answer: string
  duration: number
}>>([])
```

### Question Loading Logic
- Checks session data for custom questions
- Filters by `type === 'behavioral'` or `category.includes('behavioral')`
- Falls back to default questions if none found

### Answer Storage
- Each answer includes:
  - Question text
  - Full transcript of answer
  - Time spent on question (in seconds)
- Stored in session rubric for later review

## Integration with Existing Features

### Camera/Audio Capture ✅
- Continues to work seamlessly
- Video feed displayed alongside questions
- Audio recording synchronized with question timing

### Real-time Analysis ✅
- Metrics still calculated every 2 seconds
- Speech clarity, tone, engagement tracked per question
- Eye contact and facial expression analysis ongoing

### Coaching Feature ✅
- Enhanced to include current question context
- Coach receives question + transcript + metrics
- Provides more relevant real-time feedback

### Session Storage ✅
- Question answers saved to session rubric
- Includes all metrics and transcript data
- Duration and scores properly calculated

## UI Components Used

- `Card` / `CardHeader` / `CardContent` - Structure
- `Badge` - Question counter and difficulty
- `Button` - Navigation and controls
- `Progress` - Timer and overall progress
- `AlertCircle` / `Clock` / `ChevronRight` - Icons

## Configuration

```typescript
const QUESTION_DURATION = 120 // 2 minutes per question (adjustable)
```

## Future Enhancements

- [ ] Voice commands to advance questions
- [ ] Pause/resume functionality
- [ ] Custom question import from file
- [ ] Question difficulty levels
- [ ] Post-interview question-by-question review
- [ ] AI-generated follow-up questions based on answers

## Testing Recommendations

1. Test with default questions
2. Test with session-specific questions from email parsing
3. Test timer expiration auto-advance
4. Test manual next question navigation
5. Test answer storage and retrieval
6. Test with all questions completed
7. Test early session termination
8. Test coaching with question context

## Files Modified

- `components/interview/BehavioralLive.tsx` - Main component
