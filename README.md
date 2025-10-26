# Interview Practice Platform

A comprehensive AI-powered interview preparation platform that helps users practice for technical and behavioral interviews by parsing interview invitation emails and generating personalized practice sessions.

## 🚀 Features

### 📧 Email Parsing
- Upload or paste interview invitation emails
- AI-powered extraction of company, position, interview type, and requirements
- Automatic skill and experience level detection

### 🎯 Personalized Practice
- Generate custom interview questions based on parsed email data
- Support for technical, behavioral, and mixed interview types
- Difficulty levels tailored to experience level

### 📹 Behavioral Analysis
- Camera-based practice sessions for behavioral interviews
- Real-time analysis of eye contact, posture, and confidence
- Detailed feedback and improvement suggestions

### 💬 AI Coach
- Interactive chat interface for instant help
- Context-aware responses based on upcoming interviews
- Voice narration support

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Framer Motion** - Animations

### Backend
- **FastAPI** - Python web framework
- **OpenAI API** - AI-powered features
- **OpenCV** - Video analysis
- **Pydantic** - Data validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key

### 1. Clone and Install
```bash
git clone <repository-url>
cd interview-practice-platform
npm install
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp env.example .env
# Edit .env with your OpenAI API key
```

### 3. Environment Variables
Create `.env.local` in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
BACKEND_URL=http://localhost:8000
```

### 4. Start Development
```bash
# Option 1: Use the startup script
./start-dev.sh  # Linux/Mac
start-dev.bat   # Windows

# Option 2: Manual start
# Terminal 1 - Backend
cd backend && python start.py

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📱 Usage

### 1. Email Upload
1. Navigate to the "Interview Coach" page
2. Go to the "Email Upload" tab
3. Paste your interview invitation email
4. Click "Parse Email" to extract details
5. Generate personalized practice questions

### 2. Practice Sessions
1. Use the "Practice" tab to access generated questions
2. Practice technical questions with the AI coach
3. Use the "Behavioral" tab for camera-based practice

### 3. Behavioral Analysis
1. Click "Start Camera" to begin recording
2. Answer behavioral questions while being recorded
3. Stop recording to get detailed analysis
4. Review feedback and improvement suggestions

## 🏗️ Project Structure

```
interview-practice-platform/
├── app/                          # Next.js app directory
│   ├── api/                     # API routes
│   │   ├── parse-email/         # Email parsing endpoint
│   │   ├── generate-interview/  # Interview generation endpoint
│   │   └── analyze-behavioral/  # Behavioral analysis endpoint
│   ├── dashboard/               # Dashboard pages
│   │   ├── mentor/             # Interview Coach page
│   │   ├── interviews/         # Interview management
│   │   └── progress/           # Progress tracking
│   └── globals.css             # Global styles
├── components/                   # React components
│   ├── mentor/                 # Interview Coach components
│   │   ├── email-upload.tsx    # Email upload interface
│   │   ├── behavioral-camera.tsx # Camera analysis
│   │   ├── chat-interface.tsx  # AI chat
│   │   └── interview-manager.tsx # Interview management
│   └── ui/                     # Reusable UI components
├── backend/                     # FastAPI backend
│   ├── services/               # Business logic
│   │   ├── email_parser.py     # Email parsing service
│   │   ├── interview_generator.py # Question generation
│   │   └── behavioral_analyzer.py # Video analysis
│   ├── main.py                 # FastAPI app
│   ├── requirements.txt        # Python dependencies
│   └── start.py               # Startup script
└── README.md                   # This file
```

## 🔧 API Endpoints

### Email Parsing
- `POST /api/parse-email` - Parse interview details from email

### Interview Generation
- `POST /api/generate-interview` - Generate practice questions

### Behavioral Analysis
- `POST /api/analyze-behavioral` - Analyze video performance

## 🎨 Key Components

### EmailUpload
- Handles email content input and parsing
- Displays extracted interview details
- Generates practice questions

### BehavioralCamera
- Camera access and video recording
- Real-time behavioral analysis
- Performance feedback display

### ChatInterface
- AI-powered chat with context awareness
- Voice narration support
- Interview-specific suggestions

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Railway/Heroku)
```bash
cd backend
# Configure environment variables
# Deploy using your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Radix UI for component library
- FastAPI for backend framework
- Next.js team for the amazing framework
