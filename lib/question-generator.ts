export type Question = {
  id: string
  type: "multiple-choice" | "text"
  topic: string
  difficulty: "easy" | "medium" | "hard"
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  hint?: string
}

const questionBank: Record<string, Question[]> = {
  "data-structures": [
    {
      id: "ds-1",
      type: "multiple-choice",
      topic: "Arrays",
      difficulty: "easy",
      question: "What is the time complexity of accessing an element in an array by index?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      correctAnswer: "O(1)",
      explanation:
        "Array access by index is O(1) because arrays store elements in contiguous memory locations, allowing direct access using the index.",
      hint: "Think about how arrays are stored in memory and how we can jump directly to any position.",
    },
    {
      id: "ds-2",
      type: "multiple-choice",
      topic: "Linked Lists",
      difficulty: "medium",
      question: "What is the main advantage of a linked list over an array?",
      options: [
        "Faster access to elements",
        "Dynamic size and efficient insertions/deletions",
        "Better cache locality",
        "Less memory usage",
      ],
      correctAnswer: "Dynamic size and efficient insertions/deletions",
      explanation:
        "Linked lists can grow or shrink dynamically and allow O(1) insertions/deletions at known positions, unlike arrays which require shifting elements.",
      hint: "Consider what happens when you need to add or remove elements from the middle of the data structure.",
    },
    {
      id: "ds-3",
      type: "text",
      topic: "Trees",
      difficulty: "hard",
      question: "Explain the difference between a binary tree and a binary search tree (BST).",
      correctAnswer: "binary search tree maintains ordering property",
      explanation:
        "A binary tree is any tree where each node has at most two children. A BST is a special binary tree where for each node, all values in the left subtree are smaller and all values in the right subtree are larger, enabling efficient searching.",
      hint: "Think about the ordering property that makes searching efficient in one but not the other.",
    },
  ],
  algorithms: [
    {
      id: "algo-1",
      type: "multiple-choice",
      topic: "Sorting",
      difficulty: "easy",
      question: "Which sorting algorithm has the best average-case time complexity?",
      options: ["Bubble Sort", "Merge Sort", "Selection Sort", "Insertion Sort"],
      correctAnswer: "Merge Sort",
      explanation:
        "Merge Sort has O(n log n) time complexity in all cases (best, average, and worst), making it more efficient than O(n²) algorithms like Bubble Sort.",
      hint: "Look for the algorithm that uses divide-and-conquer strategy.",
    },
    {
      id: "algo-2",
      type: "multiple-choice",
      topic: "Dynamic Programming",
      difficulty: "medium",
      question: "What is the key principle behind dynamic programming?",
      options: [
        "Divide and conquer",
        "Storing results of subproblems to avoid recomputation",
        "Greedy choice at each step",
        "Randomization",
      ],
      correctAnswer: "Storing results of subproblems to avoid recomputation",
      explanation:
        "Dynamic programming optimizes recursive solutions by storing (memoizing) results of subproblems, avoiding redundant calculations and reducing time complexity.",
      hint: "Think about how we can avoid solving the same problem multiple times.",
    },
    {
      id: "algo-3",
      type: "text",
      topic: "Searching",
      difficulty: "hard",
      question: "Why does binary search require a sorted array?",
      correctAnswer: "sorted array allows elimination of half",
      explanation:
        "Binary search works by comparing the target with the middle element and eliminating half of the remaining elements. This only works if the array is sorted, so we know which half to discard.",
      hint: "Consider how the algorithm decides which half of the array to search next.",
    },
  ],
  "system-design": [
    {
      id: "sd-1",
      type: "multiple-choice",
      topic: "Scalability",
      difficulty: "medium",
      question: "What is horizontal scaling?",
      options: [
        "Adding more power to existing servers",
        "Adding more servers to distribute load",
        "Optimizing database queries",
        "Using caching mechanisms",
      ],
      correctAnswer: "Adding more servers to distribute load",
      explanation:
        "Horizontal scaling (scaling out) means adding more machines to your pool of resources, distributing the load across multiple servers rather than upgrading a single server.",
      hint: "Think about whether we are making existing machines more powerful or adding more machines.",
    },
    {
      id: "sd-2",
      type: "multiple-choice",
      topic: "Caching",
      difficulty: "easy",
      question: "What is the primary purpose of caching in system design?",
      options: ["To encrypt data", "To reduce latency and database load", "To backup data", "To compress data"],
      correctAnswer: "To reduce latency and database load",
      explanation:
        "Caching stores frequently accessed data in fast-access memory, reducing the need to query the database repeatedly and significantly improving response times.",
      hint: "Think about why we would want to store data temporarily in a faster location.",
    },
    {
      id: "sd-3",
      type: "text",
      topic: "Load Balancing",
      difficulty: "hard",
      question: "Explain the difference between Layer 4 and Layer 7 load balancing.",
      correctAnswer: "layer 4 transport layer 7 application",
      explanation:
        "Layer 4 load balancing operates at the transport layer (TCP/UDP) and routes based on IP and port. Layer 7 operates at the application layer and can make routing decisions based on HTTP headers, cookies, or URL paths.",
      hint: "Consider what information is available at different layers of the OSI model.",
    },
  ],
  oop: [
    {
      id: "oop-1",
      type: "multiple-choice",
      topic: "Inheritance",
      difficulty: "easy",
      question: "What is inheritance in object-oriented programming?",
      options: [
        "Creating multiple instances of a class",
        "A class acquiring properties and methods from another class",
        "Hiding implementation details",
        "Grouping related data together",
      ],
      correctAnswer: "A class acquiring properties and methods from another class",
      explanation:
        "Inheritance allows a class (child/derived class) to inherit properties and methods from another class (parent/base class), promoting code reuse and establishing hierarchical relationships.",
      hint: "Think about parent-child relationships between classes.",
    },
    {
      id: "oop-2",
      type: "multiple-choice",
      topic: "Polymorphism",
      difficulty: "medium",
      question: "What is polymorphism?",
      options: [
        "Having multiple constructors",
        "The ability of different objects to respond to the same message in different ways",
        "Creating private variables",
        "Using multiple inheritance",
      ],
      correctAnswer: "The ability of different objects to respond to the same message in different ways",
      explanation:
        "Polymorphism allows objects of different classes to be treated as objects of a common base class, with each responding to the same method call in their own specific way.",
      hint: 'Think about how different shapes might all have a "draw" method but implement it differently.',
    },
  ],
  databases: [
    {
      id: "db-1",
      type: "multiple-choice",
      topic: "SQL",
      difficulty: "easy",
      question: "What does SQL stand for?",
      options: [
        "Structured Query Language",
        "Simple Question Language",
        "Standard Query Logic",
        "System Query Language",
      ],
      correctAnswer: "Structured Query Language",
      explanation:
        "SQL (Structured Query Language) is the standard language for managing and manipulating relational databases.",
      hint: "It is a language used to query structured data.",
    },
    {
      id: "db-2",
      type: "multiple-choice",
      topic: "Indexing",
      difficulty: "medium",
      question: "What is the primary purpose of database indexing?",
      options: ["To encrypt data", "To speed up data retrieval operations", "To compress data", "To backup data"],
      correctAnswer: "To speed up data retrieval operations",
      explanation:
        "Indexes create a data structure that allows the database to find rows faster without scanning the entire table, significantly improving query performance.",
      hint: "Think about how a book index helps you find information quickly.",
    },
  ],
  networks: [
    {
      id: "net-1",
      type: "multiple-choice",
      topic: "HTTP",
      difficulty: "easy",
      question: "What does HTTP stand for?",
      options: [
        "HyperText Transfer Protocol",
        "High Transfer Text Protocol",
        "HyperText Transmission Process",
        "High Tech Transfer Protocol",
      ],
      correctAnswer: "HyperText Transfer Protocol",
      explanation:
        "HTTP (HyperText Transfer Protocol) is the foundation of data communication on the World Wide Web, defining how messages are formatted and transmitted.",
      hint: "It is the protocol used to transfer hypertext documents.",
    },
    {
      id: "net-2",
      type: "multiple-choice",
      topic: "TCP/IP",
      difficulty: "medium",
      question: "What is the main difference between TCP and UDP?",
      options: [
        "TCP is faster than UDP",
        "TCP is connection-oriented and reliable, UDP is connectionless",
        "UDP is more secure than TCP",
        "TCP uses more bandwidth than UDP",
      ],
      correctAnswer: "TCP is connection-oriented and reliable, UDP is connectionless",
      explanation:
        "TCP establishes a connection and guarantees delivery of packets in order, while UDP sends packets without establishing a connection and does not guarantee delivery, making it faster but less reliable.",
      hint: "Think about whether the protocol guarantees that data arrives correctly.",
    },
  ],
}

export function generateQuestion(topic: string, difficulty: "easy" | "medium" | "hard"): Question {
  const topicQuestions = questionBank[topic] || questionBank["data-structures"]
  const filteredQuestions = topicQuestions.filter((q) => q.difficulty === difficulty)

  if (filteredQuestions.length === 0) {
    // Fallback to any difficulty if none match
    return topicQuestions[Math.floor(Math.random() * topicQuestions.length)]
  }

  return filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)]
}
