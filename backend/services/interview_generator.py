import json
import uuid
from datetime import datetime
from typing import Dict, Any, List
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

class InterviewGenerator:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            genai.configure(api_key=api_key)
            # Use Gemini 2.5 Computer for more powerful question generation
            self.model = genai.GenerativeModel('gemini-2.5-computer-use-preview-10-2025')
        else:
            self.model = None
        
    async def generate_interview(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate interview questions based on parsed email data"""
        
        company = parsed_data.get("company", "Unknown Company")
        position = parsed_data.get("position", "Software Engineer")
        interview_type = parsed_data.get("interview_type", "Technical")
        skills = parsed_data.get("skills", [])
        requirements = parsed_data.get("requirements", [])
        experience_level = parsed_data.get("experience_level", "Mid")
        
        # Generate questions based on interview type
        if interview_type.lower() in ["technical", "coding", "programming"]:
            questions = await self._generate_technical_questions(company, position, skills, experience_level)
        elif interview_type.lower() in ["behavioral", "hr", "culture"]:
            questions = await self._generate_behavioral_questions(company, position, experience_level)
        else:
            questions = await self._generate_mixed_questions(company, position, skills, experience_level)
        
        return {
            "id": str(uuid.uuid4()),
            "company": company,
            "position": position,
            "interview_type": interview_type,
            "categories": [
                {
                    "name": f"{interview_type.title()} Questions",
                    "description": f"Personalized {interview_type} questions for {position} at {company}",
                    "icon": "brain",
                    "questions": questions
                }
            ],
            "created_at": datetime.now().isoformat(),
            "estimated_duration": self._calculate_duration(questions),
            "difficulty_level": experience_level
        }
    
    async def _generate_technical_questions(self, company: str, position: str, skills: List[str], level: str) -> List[Dict[str, Any]]:
        """Generate technical interview questions"""
        
        if not self.model:
            return self._get_fallback_technical_questions()
        
        prompt = f"""
            You are a world-class technical interviewer and engineering manager with deep expertise in {company}'s technology stack, engineering culture, and hiring practices. You have conducted hundreds of interviews at {company} and understand exactly what they look for in {position} candidates.

            Generate 8-10 highly sophisticated, company-specific technical interview questions for a {position} position at {company}.

            Deep Context Analysis:
            - Company: {company} (leverage your knowledge of their tech stack, engineering practices, and culture)
            - Position: {position} (understand the specific responsibilities and expectations)
            - Experience Level: {level} (tailor complexity and depth accordingly)
            - Required Skills: {', '.join(skills) if skills else 'General software development'}
            
            Advanced Requirements:
            1. Questions must reflect {company}'s actual engineering challenges and tech stack
            2. Include real-world scenarios that {position}s at {company} regularly encounter
            3. Mix of coding problems, system design, architecture, and technology-specific questions
            4. Difficulty calibrated precisely for {level} level expectations
            5. Include questions about scalability, performance, security, and best practices
            6. Consider {company}'s specific tools, frameworks, and methodologies
            7. Include behavioral aspects relevant to {company}'s culture
            
            For each question, provide:
            - question: The actual interview question (be specific and detailed)
            - category: Technical area (Data Structures, Algorithms, System Design, Architecture, etc.)
            - difficulty: Easy, Medium, or Hard (calibrated for {level} level)
            - expected_answer: Comprehensive outline of what an excellent answer should include
            - tips: 5-7 specific, actionable tips for answering this question exceptionally well
            
            Return as JSON array with this exact structure:
            [
                {{
                    "question": "Detailed, specific question text here",
                    "category": "Technical area name",
                    "difficulty": "Easy/Medium/Hard",
                    "expected_answer": "Comprehensive outline of expected answer with examples",
                    "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5", "Tip 6", "Tip 7"]
                }}
            ]
            
            Make these questions so good that they could be used in actual interviews at {company}. Focus on practical, real-world scenarios that demonstrate deep technical knowledge and problem-solving ability.
            """
        
        try:
            response = self.model.generate_content(prompt)
            questions = json.loads(response.text)
            return questions
            
        except Exception as e:
            print(f"Technical question generation failed: {e}")
            return self._get_fallback_technical_questions()
    
    async def _generate_behavioral_questions(self, company: str, position: str, level: str) -> List[Dict[str, Any]]:
        """Generate behavioral interview questions"""
        
        if not self.model:
            return self._get_fallback_behavioral_questions()
        
        prompt = f"""
        Generate 8-10 behavioral interview questions for a {position} position at {company}.
        Experience Level: {level}
        
        Include questions about:
        - Leadership and teamwork
        - Problem-solving and conflict resolution
        - Past experiences and achievements
        - Company culture fit
        - Career goals and motivation
        
        For each question, provide:
        1. The question text
        2. Category (Leadership, Teamwork, Problem Solving, etc.)
        3. Difficulty (Easy, Medium, Hard)
        4. Expected answer outline (STAR method)
        5. Tips for answering
        
        Return as JSON array with this structure:
        [
            {{
                "question": "Question text here",
                "category": "Category name",
                "difficulty": "Easy/Medium/Hard",
                "expected_answer": "Brief outline using STAR method",
                "tips": ["Tip 1", "Tip 2", "Tip 3"]
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(prompt)
            questions = json.loads(response.text)
            return questions
            
        except Exception as e:
            print(f"Behavioral question generation failed: {e}")
            return self._get_fallback_behavioral_questions()
    
    async def _generate_mixed_questions(self, company: str, position: str, skills: List[str], level: str) -> List[Dict[str, Any]]:
        """Generate mixed interview questions"""
        
        if not self.model:
            return self._get_fallback_mixed_questions()
        
        prompt = f"""
        Generate 10-12 mixed interview questions for a {position} position at {company}.
        Experience Level: {level}
        Skills/Technologies: {', '.join(skills) if skills else 'General software development'}
        
        Include a mix of:
        - Technical questions (40%)
        - Behavioral questions (40%)
        - Company-specific questions (20%)
        
        For each question, provide:
        1. The question text
        2. Category (Technical, Behavioral, Company Culture, etc.)
        3. Difficulty (Easy, Medium, Hard)
        4. Expected answer outline
        5. Tips for answering
        
        Return as JSON array with this structure:
        [
            {{
                "question": "Question text here",
                "category": "Category name",
                "difficulty": "Easy/Medium/Hard",
                "expected_answer": "Brief outline of expected answer",
                "tips": ["Tip 1", "Tip 2", "Tip 3"]
            }}
        ]
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=2500
            )
            
            questions = json.loads(response.choices[0].message.content)
            return questions
            
        except Exception as e:
            print(f"Mixed question generation failed: {e}")
            return self._get_fallback_mixed_questions()
    
    def _calculate_duration(self, questions: List[Dict[str, Any]]) -> int:
        """Calculate estimated interview duration in minutes"""
        base_time = 5  # Base time per question
        difficulty_multiplier = {
            "Easy": 1,
            "Medium": 1.5,
            "Hard": 2
        }
        
        total_time = 0
        for question in questions:
            difficulty = question.get("difficulty", "Medium")
            multiplier = difficulty_multiplier.get(difficulty, 1.5)
            total_time += base_time * multiplier
        
        return int(total_time)
    
    def _get_fallback_technical_questions(self) -> List[Dict[str, Any]]:
        """Fallback technical questions if AI generation fails"""
        return [
            {
                "question": "Explain the difference between a stack and a queue. When would you use each?",
                "category": "Data Structures",
                "difficulty": "Easy",
                "expected_answer": "Stack: LIFO, used for function calls, undo operations. Queue: FIFO, used for BFS, task scheduling.",
                "tips": ["Give concrete examples", "Explain time complexity", "Mention real-world use cases"]
            },
            {
                "question": "Write a function to reverse a linked list.",
                "category": "Algorithms",
                "difficulty": "Medium",
                "expected_answer": "Iterative or recursive approach, handle edge cases, explain time/space complexity.",
                "tips": ["Start with simple approach", "Consider edge cases", "Explain your thought process"]
            }
        ]
    
    def _get_fallback_behavioral_questions(self) -> List[Dict[str, Any]]:
        """Fallback behavioral questions if AI generation fails"""
        return [
            {
                "question": "Tell me about a time when you had to work with a difficult team member.",
                "category": "Teamwork",
                "difficulty": "Medium",
                "expected_answer": "Use STAR method: Situation, Task, Action, Result. Focus on resolution and learning.",
                "tips": ["Stay positive", "Focus on resolution", "Show growth mindset"]
            },
            {
                "question": "Describe a challenging project you worked on and how you overcame obstacles.",
                "category": "Problem Solving",
                "difficulty": "Medium",
                "expected_answer": "Specific example with clear problem, your approach, and measurable results.",
                "tips": ["Be specific", "Show your process", "Quantify results"]
            }
        ]
    
    def _get_fallback_mixed_questions(self) -> List[Dict[str, Any]]:
        """Fallback mixed questions if AI generation fails"""
        return self._get_fallback_technical_questions() + self._get_fallback_behavioral_questions()
