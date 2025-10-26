import { NextRequest, NextResponse } from 'next/server'

interface QuestionRequest {
  category: 'technical' | 'behavioral' | 'system-design' | 'coding' | 'dsa'
  difficulty?: 'easy' | 'medium' | 'hard'
  count?: number
  company?: string
  role?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: QuestionRequest = await request.json()
    const { category, difficulty = 'medium', count = 5, company, role } = body

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      )
    }

    // Use OpenRouter API to generate contextual questions
    const apiKey = process.env.OPENROUTER_API_KEY || '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'
    
    const prompt = buildPrompt(category, difficulty, count, company, role)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Interview Practice Platform'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interview coach who generates realistic, high-quality interview questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenRouter API error:', error)
      
      // Fallback to default questions
      return NextResponse.json({
        questions: getDefaultQuestions(category, difficulty, count),
        source: 'fallback'
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    // Parse the response - expecting JSON array of questions
    let questions
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        // If not JSON, parse as text lines
        questions = content
          .split('\n')
          .filter((line: string) => line.trim() && !line.startsWith('#'))
          .map((line: string) => ({
            question: line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim(),
            category,
            difficulty,
            type: category
          }))
          .slice(0, count)
      }
    } catch (parseError) {
      console.error('Failed to parse questions:', parseError)
      questions = getDefaultQuestions(category, difficulty, count)
    }

    return NextResponse.json({
      questions,
      source: 'ai-generated',
      metadata: {
        category,
        difficulty,
        company,
        role,
        count: questions.length
      }
    })

  } catch (error: any) {
    console.error('Question generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate questions' },
      { status: 500 }
    )
  }
}

function buildPrompt(
  category: string,
  difficulty: string,
  count: number,
  company?: string,
  role?: string
): string {
  const companyContext = company ? ` for ${company}` : ''
  const roleContext = role ? ` for a ${role} position` : ''
  
  const prompts = {
    technical: `Generate ${count} ${difficulty} technical interview questions${roleContext}${companyContext}. 
Include questions about programming concepts, algorithms, data structures, and problem-solving.
Return as a JSON array with format: [{"question": "...", "type": "technical", "difficulty": "${difficulty}"}]`,
    
    behavioral: `Generate ${count} ${difficulty} behavioral interview questions${roleContext}${companyContext}.
Use the STAR method framework (Situation, Task, Action, Result).
Focus on: teamwork, leadership, conflict resolution, problem-solving, and adaptability.
Return as a JSON array with format: [{"question": "...", "type": "behavioral", "difficulty": "${difficulty}"}]`,
    
    'system-design': `Generate ${count} ${difficulty} system design interview questions${roleContext}${companyContext}.
Include questions about scalability, architecture, distributed systems, databases, and trade-offs.
Return as a JSON array with format: [{"question": "...", "type": "system-design", "difficulty": "${difficulty}"}]`,
    
    coding: `Generate ${count} ${difficulty} coding interview questions${roleContext}${companyContext}.
Include algorithm problems similar to LeetCode/HackerRank style questions.
Return as a JSON array with format: [{"question": "...", "type": "coding", "difficulty": "${difficulty}"}]`,
    
    dsa: `Generate ${count} ${difficulty} data structures and algorithms questions${roleContext}${companyContext}.
Cover arrays, linked lists, trees, graphs, dynamic programming, sorting, searching.
Return as a JSON array with format: [{"question": "...", "type": "dsa", "difficulty": "${difficulty}"}]`
  }

  return prompts[category as keyof typeof prompts] || prompts.technical
}

function getDefaultQuestions(category: string, difficulty: string, count: number) {
  const defaults = {
    technical: [
      { question: 'Explain the concept of closures in JavaScript.', type: 'technical', difficulty },
      { question: 'What is the difference between async/await and promises?', type: 'technical', difficulty },
      { question: 'How does garbage collection work in your preferred language?', type: 'technical', difficulty },
      { question: 'Explain RESTful API design principles.', type: 'technical', difficulty },
      { question: 'What are the SOLID principles in object-oriented programming?', type: 'technical', difficulty }
    ],
    behavioral: [
      { question: 'Tell me about a time you faced a significant challenge at work.', type: 'behavioral', difficulty },
      { question: 'Describe a situation where you had to work with a difficult team member.', type: 'behavioral', difficulty },
      { question: 'Give an example of when you showed leadership.', type: 'behavioral', difficulty },
      { question: 'Tell me about a time you failed and what you learned from it.', type: 'behavioral', difficulty },
      { question: 'Describe a situation where you had to meet a tight deadline.', type: 'behavioral', difficulty }
    ],
    'system-design': [
      { question: 'Design a URL shortening service like bit.ly.', type: 'system-design', difficulty },
      { question: 'How would you design Twitter/X?', type: 'system-design', difficulty },
      { question: 'Design a rate limiter for an API.', type: 'system-design', difficulty },
      { question: 'How would you design a distributed cache?', type: 'system-design', difficulty },
      { question: 'Design a notification system for a social media platform.', type: 'system-design', difficulty }
    ],
    coding: [
      { question: 'Implement a function to reverse a linked list.', type: 'coding', difficulty },
      { question: 'Find the longest substring without repeating characters.', type: 'coding', difficulty },
      { question: 'Implement a binary search algorithm.', type: 'coding', difficulty },
      { question: 'Merge two sorted arrays into one sorted array.', type: 'coding', difficulty },
      { question: 'Validate if a binary tree is a valid binary search tree.', type: 'coding', difficulty }
    ],
    dsa: [
      { question: 'Explain how a hash table works and its time complexity.', type: 'dsa', difficulty },
      { question: 'What is the difference between BFS and DFS?', type: 'dsa', difficulty },
      { question: 'Implement a stack using queues.', type: 'dsa', difficulty },
      { question: 'Find the kth largest element in an array.', type: 'dsa', difficulty },
      { question: 'Detect a cycle in a linked list.', type: 'dsa', difficulty }
    ]
  }

  const questions = defaults[category as keyof typeof defaults] || defaults.technical
  return questions.slice(0, count)
}
