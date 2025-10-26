// Simulated AI responses for the mentor chat
// In production, this would call the Gemini API

const responseTemplates: Record<string, string> = {
  "binary search tree": `**Binary Search Tree (BST)**

A Binary Search Tree is a tree data structure where each node has at most two children. The key property is:

- All nodes in the left subtree have values **less than** the parent node
- All nodes in the right subtree have values **greater than** the parent node

**Key Benefit:** This ordering property makes searching very efficient - **O(log n)** on average!

**Example Structure:**
       8
      / \\
     3   10
    / \\    \\
   1   6    14

Would you like me to explain BST operations like insertion or deletion?`,

  "stack and queue": `**Stack vs Queue: Key Differences**

Great question! Both are linear data structures, but they differ in how elements are accessed:

**Stack (LIFO - Last In, First Out)**
- Think of a stack of plates - you add and remove from the **top**
- Operations: push() and pop()
- **Use cases:** Function call stack, undo operations, expression evaluation

**Queue (FIFO - First In, First Out)**
- Think of a line at a store - first person in line is served **first**
- Operations: enqueue() and dequeue()
- **Use cases:** Task scheduling, breadth-first search, print queue

**Key Difference:** Stack removes the most recently added item, while Queue removes the oldest item.

Would you like to see code examples?`,

  "dynamic programming": `**Dynamic Programming (DP)**

Dynamic Programming is an optimization technique that solves complex problems by breaking them down into simpler subproblems.

**Key Principles:**
1. **Optimal Substructure**: The optimal solution contains optimal solutions to subproblems
2. **Overlapping Subproblems**: The same subproblems are solved multiple times
3. **Memoization**: Store results to avoid recomputation

**Classic Example - Fibonacci:**
- Without DP: **O(2^n)** - recalculates same values
- With DP: **O(n)** - stores and reuses calculated values

**Two Approaches:**
- **Top-down (Memoization)**: Recursive with caching
- **Bottom-up (Tabulation)**: Iterative, builds solution from base cases

**Common DP Problems:** Knapsack, longest common subsequence, coin change.

Would you like to see a specific example?`,

  "big o notation": `**Big O Notation**

Big O notation describes how an algorithm's runtime or space requirements grow as the input size increases.

**Common Time Complexities (from fastest to slowest):**
- **O(1)** - Constant: Array access by index
- **O(log n)** - Logarithmic: Binary search
- **O(n)** - Linear: Simple loop through array
- **O(n log n)** - Linearithmic: Merge sort, quick sort
- **O(n²)** - Quadratic: Nested loops
- **O(2^n)** - Exponential: Recursive fibonacci
- **O(n!)** - Factorial: Generating all permutations

**Key Points:**
- We focus on **worst-case scenarios**
- Drop constants: O(2n) becomes O(n)
- Drop lower-order terms: O(n² + n) becomes O(n²)

**Think of it as:** "How does performance change when I double the input size?"

Want to analyze a specific algorithm?`,

  "design patterns": `Design patterns are reusable solutions to common software design problems. They're like templates for solving recurring challenges.

**Three Main Categories:**

**1. Creational Patterns** (Object creation)
- Singleton: Ensure only one instance exists
- Factory: Create objects without specifying exact class
- Builder: Construct complex objects step by step

**2. Structural Patterns** (Object composition)
- Adapter: Make incompatible interfaces work together
- Decorator: Add behavior to objects dynamically
- Facade: Provide simplified interface to complex system

**3. Behavioral Patterns** (Object interaction)
- Observer: Notify multiple objects of state changes
- Strategy: Define family of algorithms, make them interchangeable
- Command: Encapsulate requests as objects

**Benefits:**
- Proven solutions
- Common vocabulary for developers
- Easier maintenance and scalability

Which pattern would you like to explore in detail?`,

  "hash table": `**Hash Table (Hash Map)**

A hash table is a data structure that provides very fast lookups, insertions, and deletions - typically **O(1)** average time!

**How It Works:**
1. Uses a hash function to convert keys into array indices
2. Stores key-value pairs at those indices
3. Retrieves values by hashing the key again

**Example:**
Key "apple" → Hash function → Index 5 → Store value at array[5]

**Collision Handling:**
When two keys hash to the same index:
- **Chaining**: Store multiple items in a linked list at that index
- **Open Addressing**: Find next available slot

**Real-World Uses:**
- Database indexing
- Caching (like browser cache)
- Counting frequencies
- Detecting duplicates

**Trade-offs:**
- ✓ Fast average-case operations **O(1)**
- ✗ Worst case can be **O(n)** with many collisions
- ✗ No ordering of elements

Would you like to see a hash table implementation?`,
}

export function generateAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  // Check for keyword matches
  for (const [keyword, response] of Object.entries(responseTemplates)) {
    if (lowerMessage.includes(keyword)) {
      return response
    }
  }

  // Generic responses for common question types
  if (lowerMessage.includes("how") || lowerMessage.includes("what") || lowerMessage.includes("explain")) {
    return `That's a great question! Let me help you understand that concept.

${lowerMessage.includes("algorithm") ? "Algorithms are step-by-step procedures for solving problems. Each algorithm has different time and space complexity characteristics." : ""}
${lowerMessage.includes("data structure") ? "Data structures are ways of organizing and storing data efficiently. The choice of data structure affects the performance of your algorithms." : ""}
${lowerMessage.includes("complexity") ? "Time complexity measures how an algorithm's runtime grows with input size, while space complexity measures memory usage." : ""}

Could you be more specific about what aspect you'd like to explore? For example:
- How does it work internally?
- What are common use cases?
- How do I implement it?
- What are the trade-offs?`
  }

  if (lowerMessage.includes("example") || lowerMessage.includes("code")) {
    return `I'd be happy to show you an example! Here's a simple implementation:

\`\`\`javascript
// Example code structure
function example(input) {
  // Process the input
  let result = processData(input);
  
  // Return the result
  return result;
}
\`\`\`

This demonstrates the basic pattern. Would you like me to:
- Explain each step in detail?
- Show a more complex example?
- Discuss edge cases and optimizations?`
  }

  if (lowerMessage.includes("interview") || lowerMessage.includes("prepare")) {
    return `Great that you're preparing for interviews! Here are some tips:

**Technical Interview Prep:**
1. Master fundamental data structures (arrays, linked lists, trees, graphs, hash tables)
2. Practice common algorithms (sorting, searching, dynamic programming)
3. Understand time and space complexity analysis
4. Practice coding on a whiteboard or in a simple editor
5. Think out loud - explain your thought process

**Problem-Solving Approach:**
1. Clarify the problem and ask questions
2. Think of examples and edge cases
3. Discuss your approach before coding
4. Write clean, readable code
5. Test your solution with examples

Would you like to practice with a specific type of interview question?`
  }

  // Default response
  return `I understand you're asking about "${userMessage}". 

I'm here to help you learn! To give you the best explanation, could you help me understand:
- What specific aspect are you curious about?
- Is this for understanding a concept, solving a problem, or interview prep?
- Do you have any prior knowledge of related topics?

Feel free to ask about:
- Data structures (arrays, trees, graphs, hash tables)
- Algorithms (sorting, searching, dynamic programming)
- System design concepts
- Object-oriented programming
- Time and space complexity

What would you like to explore?`
}
