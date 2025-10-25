export type InterviewQuestion = {
  id: string
  type: "quick" | "full" | "behavioral" | "system-design"
  category: string
  difficulty: "easy" | "medium" | "hard"
  question: string
  context?: string
  hints?: string[]
  keywords?: string[]
  feedback: {
    positive: string
    improvement: string
    optimalSolution?: string
  }
}

const interviewQuestions: Record<string, Record<string, InterviewQuestion[]>> = {
  quick: {
    easy: [
      {
        id: "quick-easy-1",
        type: "quick",
        category: "Arrays",
        difficulty: "easy",
        question: "Given an array of integers, return indices of the two numbers that add up to a specific target.",
        context: "Example: nums = [2, 7, 11, 15], target = 9. Output: [0, 1] because nums[0] + nums[1] = 9",
        hints: [
          "Think about using a hash map to store values you've seen",
          "For each number, check if target - number exists in your map",
        ],
        keywords: ["hash", "map", "complement", "O(n)"],
        feedback: {
          positive: "You identified the need for an efficient lookup structure.",
          improvement:
            "Consider discussing the time complexity trade-off between the brute force O(n²) and hash map O(n) approaches.",
          optimalSolution:
            "Use a hash map to store each number and its index. For each number, check if (target - number) exists in the map. Time: O(n), Space: O(n).",
        },
      },
      {
        id: "quick-easy-2",
        type: "quick",
        category: "Strings",
        difficulty: "easy",
        question: "Write a function to reverse a string.",
        context: "Example: 'hello' becomes 'olleh'",
        hints: ["Can you use two pointers?", "What about built-in methods?"],
        keywords: ["reverse", "two pointers", "swap"],
        feedback: {
          positive: "You provided a working solution.",
          improvement: "Discuss multiple approaches and their trade-offs.",
          optimalSolution: "Use two pointers from start and end, swap characters. Time: O(n), Space: O(1).",
        },
      },
    ],
    medium: [
      {
        id: "quick-medium-1",
        type: "quick",
        category: "Strings",
        difficulty: "medium",
        question: "Determine if a string has all unique characters without using additional data structures.",
        context: "Example: 'abcdef' returns true, 'hello' returns false (two l's)",
        hints: [
          "Can you use bit manipulation?",
          "What if you sort the string first?",
          "Consider the character set size (ASCII vs Unicode)",
        ],
        keywords: ["bit", "sort", "ascii", "unique"],
        feedback: {
          positive: "You considered multiple approaches to solve the problem.",
          improvement:
            "Discuss the space-time trade-offs between different solutions and clarify assumptions about the character set.",
          optimalSolution:
            "If ASCII (128 chars), use a boolean array or bit vector. If no extra space allowed, sort the string O(n log n) and check adjacent characters.",
        },
      },
    ],
    hard: [
      {
        id: "quick-hard-1",
        type: "quick",
        category: "Arrays",
        difficulty: "hard",
        question: "Find the median of two sorted arrays.",
        context: "Example: nums1 = [1,3], nums2 = [2]. Output: 2.0",
        hints: ["Think about binary search", "Can you partition the arrays?"],
        keywords: ["binary search", "partition", "median", "O(log(m+n))"],
        feedback: {
          positive: "You recognized this requires an efficient algorithm.",
          improvement: "Explain the binary search approach and edge cases.",
          optimalSolution: "Use binary search to partition arrays. Time: O(log(min(m,n))), Space: O(1).",
        },
      },
    ],
  },
  full: {
    easy: [
      {
        id: "full-easy-1",
        type: "full",
        category: "Linked Lists",
        difficulty: "easy",
        question: "Reverse a singly linked list.",
        context: "Example: 1->2->3->4->5 becomes 5->4->3->2->1",
        hints: ["Use three pointers: prev, current, next", "Iterate through the list once"],
        keywords: ["linked list", "reverse", "pointers"],
        feedback: {
          positive: "You understood the pointer manipulation needed.",
          improvement: "Discuss both iterative and recursive approaches.",
          optimalSolution: "Use three pointers to reverse links. Time: O(n), Space: O(1) iterative or O(n) recursive.",
        },
      },
    ],
    medium: [
      {
        id: "full-medium-1",
        type: "full",
        category: "Trees",
        difficulty: "medium",
        question: "Implement a function to check if a binary tree is balanced.",
        context:
          "A balanced tree is defined as a tree where the heights of the two subtrees of any node never differ by more than one.",
        hints: [
          "Think about how to calculate height recursively",
          "Can you check balance while calculating height?",
          "What should you return if a subtree is unbalanced?",
        ],
        keywords: ["recursive", "height", "balanced", "subtree"],
        feedback: {
          positive: "You understood the recursive nature of the problem.",
          improvement:
            "Optimize by checking balance during height calculation rather than making separate passes. Discuss time complexity.",
          optimalSolution:
            "Use a helper function that returns both height and balance status. Return -1 for unbalanced subtrees. Time: O(n), Space: O(h) for recursion stack.",
        },
      },
    ],
    hard: [
      {
        id: "full-hard-1",
        type: "full",
        category: "Dynamic Programming",
        difficulty: "hard",
        question: "Given a set of coin denominations and a target amount, find the minimum number of coins needed.",
        context: "Example: coins = [1, 5, 10, 25], amount = 41. Output: 4 (25 + 10 + 5 + 1)",
        hints: [
          "This is a classic DP problem",
          "What's the base case?",
          "For each amount, try using each coin and take the minimum",
        ],
        keywords: ["dynamic programming", "dp", "memoization", "bottom-up"],
        feedback: {
          positive: "You recognized this as a dynamic programming problem.",
          improvement:
            "Explain why greedy doesn't work for all coin systems. Discuss both top-down and bottom-up approaches.",
          optimalSolution:
            "Use DP array where dp[i] = minimum coins for amount i. For each amount, try each coin: dp[i] = min(dp[i], dp[i-coin] + 1). Time: O(amount * coins), Space: O(amount).",
        },
      },
    ],
  },
  behavioral: {
    easy: [
      {
        id: "behavioral-easy-1",
        type: "behavioral",
        category: "Introduction",
        difficulty: "easy",
        question: "Tell me about yourself and your background in computer science.",
        hints: [
          "Keep it concise (2-3 minutes)",
          "Focus on relevant experience",
          "End with why you're interested in this role",
        ],
        keywords: ["background", "experience", "education", "interests"],
        feedback: {
          positive: "You provided a clear overview of your background.",
          improvement: "Make sure to connect your experience to the role you're applying for.",
        },
      },
    ],
    medium: [
      {
        id: "behavioral-medium-1",
        type: "behavioral",
        category: "Teamwork",
        difficulty: "medium",
        question: "Tell me about a time when you had to work with a difficult team member.",
        hints: [
          "Use the STAR method: Situation, Task, Action, Result",
          "Focus on what YOU did, not just what happened",
          "Show empathy and problem-solving skills",
        ],
        keywords: ["situation", "task", "action", "result", "communication", "conflict"],
        feedback: {
          positive: "You provided a concrete example with specific details.",
          improvement:
            "Make sure to emphasize your specific actions and the positive outcome. Quantify results when possible.",
        },
      },
      {
        id: "behavioral-medium-2",
        type: "behavioral",
        category: "Problem Solving",
        difficulty: "medium",
        question: "Describe a situation where you had to learn a new technology quickly to complete a project.",
        hints: [
          "Explain your learning process",
          "Mention resources you used",
          "Discuss how you applied what you learned",
          "Share the outcome",
        ],
        keywords: ["learning", "resources", "documentation", "practice", "deadline"],
        feedback: {
          positive: "You demonstrated adaptability and self-directed learning.",
          improvement:
            "Include more details about your learning strategy and how you validated your understanding before applying it.",
        },
      },
    ],
    hard: [
      {
        id: "behavioral-hard-1",
        type: "behavioral",
        category: "Leadership",
        difficulty: "hard",
        question: "Tell me about a time when you had to make a difficult decision that affected your team.",
        hints: [
          "Explain the context and stakes",
          "Describe the options you considered",
          "Explain your decision-making process",
          "Share the outcome and what you learned",
        ],
        keywords: ["decision", "leadership", "trade-offs", "impact", "responsibility"],
        feedback: {
          positive: "You showed leadership and decision-making skills.",
          improvement: "Discuss how you communicated the decision and handled any pushback.",
        },
      },
    ],
  },
  "system-design": {
    easy: [
      {
        id: "system-easy-1",
        type: "system-design",
        category: "Basic Design",
        difficulty: "easy",
        question: "Design a simple parking lot system.",
        context: "The system should track available spots and allow cars to park and leave.",
        hints: ["Think about the data structures needed", "How will you track spot availability?"],
        keywords: ["data structure", "availability", "tracking"],
        feedback: {
          positive: "You identified the core requirements.",
          improvement: "Consider different vehicle types and spot sizes.",
        },
      },
    ],
    medium: [
      {
        id: "system-medium-1",
        type: "system-design",
        category: "Scalability",
        difficulty: "medium",
        question: "Design a URL shortening service like bit.ly.",
        context:
          "The service should take long URLs and generate short URLs. When users visit the short URL, they should be redirected to the original URL.",
        hints: [
          "Think about how to generate unique short codes",
          "Consider database schema for storing mappings",
          "How will you handle high traffic?",
          "What about analytics and expiration?",
        ],
        keywords: ["hash", "database", "cache", "load balancer", "scalability", "distributed"],
        feedback: {
          positive: "You identified the core components of the system.",
          improvement:
            "Discuss scalability concerns like database sharding, caching strategy, and handling collisions in short URL generation.",
          optimalSolution:
            "Use base62 encoding of auto-incrementing IDs or hash of URL. Store in distributed database with caching layer. Use load balancers for high availability. Consider CDN for global distribution.",
        },
      },
    ],
    hard: [
      {
        id: "system-hard-1",
        type: "system-design",
        category: "Architecture",
        difficulty: "hard",
        question: "Design a notification system that can send emails, SMS, and push notifications.",
        context: "The system should support millions of users and handle different notification preferences.",
        hints: [
          "Think about message queues for reliability",
          "How will you handle user preferences?",
          "What about rate limiting?",
          "Consider failure handling and retries",
        ],
        keywords: ["queue", "microservices", "preferences", "rate limiting", "retry", "idempotent"],
        feedback: {
          positive: "You considered multiple notification channels and user preferences.",
          improvement:
            "Elaborate on how you'd handle failures, implement rate limiting, and ensure message delivery guarantees.",
          optimalSolution:
            "Use message queue (Kafka/RabbitMQ) for reliability. Separate services for each notification type. Store preferences in database with caching. Implement exponential backoff for retries. Use rate limiting per user/channel.",
        },
      },
    ],
  },
}

export function generateInterviewQuestion(
  type: "quick" | "full" | "behavioral" | "system-design",
  difficulty: "easy" | "medium" | "hard" = "medium",
): InterviewQuestion {
  const questionsForType = interviewQuestions[type] || interviewQuestions.quick
  const questionsForDifficulty = questionsForType[difficulty] || questionsForType.medium || []

  if (questionsForDifficulty.length === 0) {
    // Fallback to medium if no questions for selected difficulty
    const fallbackQuestions = questionsForType.medium || Object.values(questionsForType)[0] || []
    return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)]
  }

  return questionsForDifficulty[Math.floor(Math.random() * questionsForDifficulty.length)]
}
