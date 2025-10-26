# Gemini 2.5 Computer Setup Guide

## 🚀 API Key Configuration

### Step 1: Create Environment File
Create a file named `.env` in the `backend` directory with the following content:

```env
# Google Gemini 2.5 Computer API Key
GEMINI_API_KEY=AIzaSyBd4Y3nqHEFeyo1IU-0Gnc_7rizi04s4XY

# Database Configuration
DATABASE_URL=sqlite:///./interview_practice.db

# Server Configuration
HOST=0.0.0.0
PORT=8000

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001
```

### Step 2: Restart Backend
After creating the `.env` file, restart the backend server:

```bash
cd backend
python start.py
```

## 🧠 Gemini 2.5 Computer Features

### Enhanced Capabilities
- **Advanced Context Understanding**: Better analysis of company culture and requirements
- **Company-Specific Questions**: Tailored to actual tech stacks and engineering practices
- **Real-World Scenarios**: Questions based on actual challenges at specific companies
- **Comprehensive Analysis**: More detailed extraction of interview requirements

### Model Configuration
- **Model ID**: `gemini-2.5-computer-use-preview-10-2025`
- **Enhanced Prompts**: Optimized for maximum question quality
- **Advanced Parsing**: Better extraction of technical requirements and skills

## 🎯 What You'll Get

### Email Parsing
- More accurate company and position extraction
- Better identification of technical requirements
- Enhanced skill and experience level detection
- Improved context awareness

### Question Generation
- Company-specific technical questions
- Real-world scenarios and challenges
- Difficulty-calibrated for experience level
- Comprehensive answer outlines and tips
- 5-7 actionable tips per question

## 🔧 Testing

Once the API key is set up, test the enhanced functionality:

1. Go to Study Practice page
2. Upload an interview email
3. Watch the enhanced AI parsing and question generation
4. Experience the improved quality and specificity

## 🚨 Important Notes

- The API key is already configured in the code
- Just create the `.env` file with the provided key
- Restart the backend after adding the environment file
- The system will automatically use Gemini 2.5 Computer once configured

## 🎉 Ready to Go!

Your interview practice platform is now powered by Gemini 2.5 Computer for the most advanced AI-generated questions possible!
