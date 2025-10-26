# Interview Practice Platform - Setup Guide

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file in the `backend` directory:
```env
# Google Gemini API Key for AI-powered features
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
HOST=0.0.0.0
PORT=8000

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
```

### 3. Get Your Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" 
4. Create a new API key
5. Copy the key and replace `your_gemini_api_key_here` in the `.env` file

### 4. Start the Application

#### Option 1: Use the startup scripts
```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh
```

#### Option 2: Manual start
```bash
# Terminal 1 - Backend
cd backend
python start.py

# Terminal 2 - Frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:3000 (or 3001 if 3000 is busy)
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🎯 Features Ready to Use

### ✅ Completed Features
- **Email Upload & Parsing**: Upload interview invitation emails and extract details
- **AI-Powered Question Generation**: Generate personalized practice questions
- **Behavioral Interview Practice**: Camera-based practice with real-time feedback
- **Interview Coach Interface**: Renamed from "AI Mentor" with improved design
- **Tabbed Interface**: Overview, Email Upload, Practice, and Behavioral sections

### 🔧 How to Use

1. **Upload Email**: Go to "Interview Coach" → "Email Upload" tab
2. **Paste Email**: Copy and paste your interview invitation email
3. **Parse Details**: Click "Parse Email" to extract company, position, etc.
4. **Generate Questions**: Click "Generate Practice Questions"
5. **Practice**: Use the "Practice" tab for technical questions
6. **Behavioral Practice**: Use the "Behavioral" tab for camera-based practice

## 🛠️ Technical Details

### Backend (FastAPI)
- **Port**: 8000
- **AI Model**: Google Gemini 2.0 Flash Experimental
- **Features**: Email parsing, question generation, behavioral analysis

### Frontend (Next.js)
- **Port**: 3000 (or 3001 if 3000 is busy)
- **Framework**: Next.js 16 with TypeScript
- **UI**: Tailwind CSS + Radix UI components

## 🐛 Troubleshooting

### Backend Issues
- Make sure you have Python 3.8+ installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify your Gemini API key is correct in the `.env` file

### Frontend Issues
- Make sure Node.js 18+ is installed
- Install dependencies: `npm install`
- Check if port 3000 is available, or use port 3001

### API Connection Issues
- Ensure backend is running on port 8000
- Check CORS settings in backend configuration
- Verify the `BACKEND_URL` environment variable

## 📝 Next Steps

1. Add your Gemini API key to the `.env` file
2. Test the email upload functionality
3. Try the behavioral camera practice
4. Customize the question generation prompts as needed

## 🎉 You're Ready!

Your interview practice platform is now set up and ready to help users prepare for their interviews with AI-powered features!
