// Company-specific interview question database
export const companyQuestions = {
  google: {
    technical: [
      "Design a URL shortener service",
      "Implement LRU Cache",
      "Find the longest substring without repeating characters",
      "Design a distributed rate limiter",
    ],
    behavioral: [
      "Tell me about a time you disagreed with a teammate",
      "Describe a project where you had to learn a new technology quickly",
      "How do you handle ambiguity in requirements?",
    ],
  },
  amazon: {
    technical: [
      "Design Amazon's recommendation system",
      "Implement a package delivery routing system",
      "Design a distributed key-value store",
      "Optimize warehouse inventory management",
    ],
    behavioral: [
      "Tell me about a time you had to make a decision with incomplete information",
      "Describe a situation where you had to earn trust",
      "Give an example of when you took a calculated risk",
    ],
  },
  microsoft: {
    technical: [
      "Design a collaborative document editing system",
      "Implement a file synchronization service",
      "Design a meeting scheduler",
      "Build a real-time chat application",
    ],
    behavioral: [
      "Tell me about a time you had to influence without authority",
      "Describe how you handle competing priorities",
      "Give an example of when you had to adapt to change",
    ],
  },
  meta: {
    technical: [
      "Design a news feed system",
      "Implement a friend suggestion algorithm",
      "Design a notification system",
      "Build a content moderation pipeline",
    ],
    behavioral: [
      "Tell me about a time you had to move fast and break things",
      "Describe a project where you had to balance speed and quality",
      "How do you approach building for scale?",
    ],
  },
  default: {
    technical: [
      "Reverse a linked list",
      "Find two numbers that sum to a target",
      "Implement binary search",
      "Design a parking lot system",
      "Explain the difference between processes and threads",
    ],
    behavioral: [
      "Tell me about yourself",
      "Why do you want to work here?",
      "Describe a challenging project you worked on",
      "How do you handle feedback?",
    ],
  },
}

export function getQuestionsForInterview(company: string, type: string): string[] {
  const normalizedCompany = company.toLowerCase()
  const companyKey = Object.keys(companyQuestions).find((key) => normalizedCompany.includes(key)) || "default"

  const questions = companyQuestions[companyKey as keyof typeof companyQuestions]

  if (type === "behavioral") {
    return questions.behavioral || companyQuestions.default.behavioral
  }

  return questions.technical || companyQuestions.default.technical
}
