# Interview Practice Backend

FastAPI backend for the Interview Practice web application with AI-powered email parsing, interview question generation, and behavioral analysis.

## Features

- **Email Parsing**: Extract interview details from forwarded emails using AI
- **Interview Generation**: Generate personalized practice questions based on parsed email data
- **Behavioral Analysis**: Analyze video recordings for eye contact, posture, and confidence
- **RESTful API**: Clean API endpoints for frontend integration

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

3. **Required Environment Variables**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   BACKEND_URL=http://localhost:8000
   ```

4. **Run the Server**
   ```bash
   python start.py
   # or
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Email Parsing
- `POST /parse-email` - Parse interview details from email content

### Interview Generation
- `POST /generate-interview` - Generate practice questions from parsed data

### Behavioral Analysis
- `POST /analyze-behavioral` - Analyze video for behavioral feedback

### Health Check
- `GET /health` - Check API health status

## Development

The backend uses:
- **FastAPI** for the web framework
- **OpenAI API** for AI-powered features
- **OpenCV** for video analysis
- **Pydantic** for data validation

## Testing

Test the API endpoints using the interactive docs at `http://localhost:8000/docs` when the server is running.
