# Gemini 2.5 Automation Setup

This project implements automated navigation using Gemini 2.5's computer vision capabilities to enhance the user experience in the study practice flow.

## Features

- **Automated Email Processing**: AI automatically detects when email content is entered
- **Smart Button Detection**: Computer vision identifies and clicks "Start Practice Session" buttons
- **Seamless Navigation**: Automatic transition from study practice to interview coach
- **Visual Feedback**: Shows when automation is active

## Setup Instructions

### 1. Install Required Dependencies

```bash
npm install @google/generative-ai html2canvas
```

### 2. Environment Variables

Add your Gemini API key to your `.env.local` file:

```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Browser Permissions

The automation requires screen capture permissions. Users will be prompted to allow screen sharing when automation is enabled.

## How It Works

### Automation Flow

1. **Email Input**: User enters interview email content
2. **AI Analysis**: Gemini 2.5 analyzes the screen to identify UI elements
3. **Auto-Click**: System automatically clicks "Start Practice Session"
4. **Navigation**: Seamlessly redirects to interview coach

### Key Components

- **GeminiAutomation**: Core class handling computer vision and screen interaction
- **StudyPracticeAutomation**: Workflow-specific automation logic
- **Screen Analysis**: AI-powered element detection and positioning
- **Auto-Navigation**: Programmatic page transitions

### Usage

1. Navigate to the Study Practice page (`/dashboard/study`)
2. Click "Enable Automation" button
3. Enter your interview email content
4. Click "Parse Email & Generate Questions"
5. The system will automatically:
   - Parse the email
   - Generate questions
   - Click "Start Practice Session"
   - Navigate to Interview Coach

## Technical Details

### Computer Vision
- Uses Gemini 2.5 Flash model for visual analysis
- Identifies buttons, inputs, and clickable elements
- Returns JSON with element positions and selectors

### Screen Capture
- Primary: `navigator.mediaDevices.getDisplayMedia()`
- Fallback: `html2canvas` library
- Requires user permission for screen access

### Element Interaction
- DOM selector-based clicking (preferred)
- Position-based clicking (fallback)
- Event simulation for user interactions

## Customization

### Modify Automation Triggers

Edit `lib/gemini-automation.ts` to customize when automation activates:

```typescript
// Look for different button text
const practiceButton = await this.geminiAutomation.findElement(
  screenshot,
  'your custom button text'
);
```

### Adjust Timing

Modify delays in the automation flow:

```typescript
// Change the delay before navigation
await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second
```

## Troubleshooting

### Common Issues

1. **Screen capture fails**: Ensure browser supports `getDisplayMedia`
2. **Element not found**: Check if UI elements have changed
3. **API key issues**: Verify environment variable is set correctly

### Debug Mode

Enable console logging to see automation steps:

```typescript
// Add to your automation code
console.log('Automation step:', stepName);
```

## Security Considerations

- API keys are exposed client-side (use with caution)
- Screen capture requires explicit user consent
- Automation can be disabled by users at any time

## Future Enhancements

- **Multi-step Workflows**: Extend to other pages
- **Smart Waiting**: Dynamic timing based on loading states
- **Error Recovery**: Automatic retry on failures
- **Accessibility**: Voice commands and keyboard navigation