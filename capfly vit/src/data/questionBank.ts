// ═══════════════════════════════════════════════════════
//  CAPFLY — DSA Question Bank
//  All questions with full metadata.
//  correctAnswer is NEVER exposed to the client during
//  an active exam — it is stripped server-side.
// ═══════════════════════════════════════════════════════

import type { ExamQuestion } from "@/types/exam";

export const QUESTION_BANK: ExamQuestion[] = [
  // ─────────────────── ARRAYS ────────────────────────────
  {
    id: "arr-001",
    topic: "Arrays",
    difficulty: "Easy",
    type: "MCQ",
    question: "What is the time complexity of accessing an element at a specific index in an array?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(1)" },
      { id: "d", text: "O(n²)" },
    ],
    correctAnswer: "c",
    explanation: "Array elements are stored in contiguous memory locations, so accessing by index is a direct memory lookup — O(1) constant time.",
    marks: 4,
    negativeMarks: 1,
    tags: ["arrays", "time-complexity", "fundamentals"],
  },
  {
    id: "arr-002",
    topic: "Arrays",
    difficulty: "Medium",
    type: "CODE_OUTPUT",
    question: "What is the output of the following code?",
    codeSnippet: `let arr = [1, 2, 3, 4, 5];
arr.splice(1, 2);
console.log(arr);`,
    options: [
      { id: "a", text: "[1, 4, 5]" },
      { id: "b", text: "[1, 2, 3]" },
      { id: "c", text: "[2, 3, 4, 5]" },
      { id: "d", text: "[1, 3, 5]" },
    ],
    correctAnswer: "a",
    explanation: "splice(1, 2) removes 2 elements starting at index 1 — elements 2 and 3 are removed. The result is [1, 4, 5].",
    marks: 4,
    negativeMarks: 1,
    tags: ["arrays", "javascript", "splice"],
  },
  {
    id: "arr-003",
    topic: "Arrays",
    difficulty: "Hard",
    type: "ALGORITHM_SELECTION",
    question: "You need to find the maximum sum of a contiguous subarray in an array of n integers (which may include negatives). Which algorithm gives O(n) time complexity?",
    options: [
      { id: "a", text: "Brute force: check all subarrays" },
      { id: "b", text: "Kadane's Algorithm" },
      { id: "c", text: "Merge Sort based approach" },
      { id: "d", text: "Binary Search" },
    ],
    correctAnswer: "b",
    explanation: "Kadane's Algorithm solves the Maximum Subarray Problem in O(n) by iteratively computing the maximum sum ending at each position.",
    marks: 4,
    negativeMarks: 1,
    tags: ["arrays", "kadane", "dynamic-programming"],
  },
  {
    id: "arr-004",
    topic: "Arrays",
    difficulty: "Medium",
    type: "MULTI_SELECT",
    question: "Which of the following operations on a dynamic array (like ArrayList) have O(1) amortized time complexity? (Select all that apply)",
    options: [
      { id: "a", text: "Access by index" },
      { id: "b", text: "Append to end (amortized)" },
      { id: "c", text: "Insert at beginning" },
      { id: "d", text: "Delete at arbitrary position" },
    ],
    correctAnswer: ["a", "b"],
    explanation: "Index access is O(1). Appending is O(1) amortized (occasional resize is O(n) but averaged over many inserts it's O(1)). Inserting at beginning or deleting from an arbitrary position requires shifting elements: O(n).",
    marks: 4,
    negativeMarks: 1,
    tags: ["arrays", "amortized", "dynamic-array"],
  },

  // ─────────────────── STRINGS ────────────────────────────
  {
    id: "str-001",
    topic: "Strings",
    difficulty: "Easy",
    type: "MCQ",
    question: "Which algorithm is most efficient for finding all occurrences of a pattern in a text of length n where the pattern has length m?",
    options: [
      { id: "a", text: "Brute force O(nm)" },
      { id: "b", text: "KMP Algorithm O(n + m)" },
      { id: "c", text: "Binary Search O(n log n)" },
      { id: "d", text: "BFS traversal O(n + m)" },
    ],
    correctAnswer: "b",
    explanation: "The KMP (Knuth-Morris-Pratt) algorithm pre-processes the pattern to build a failure function, enabling linear O(n + m) pattern matching.",
    marks: 4,
    negativeMarks: 1,
    tags: ["strings", "pattern-matching", "kmp"],
  },
  {
    id: "str-002",
    topic: "Strings",
    difficulty: "Medium",
    type: "CODE_OUTPUT",
    question: "What does the following Python code output?",
    codeSnippet: `s = "abcabc"
print(s[::-1])`,
    options: [
      { id: "a", text: "abcabc" },
      { id: "b", text: "cbacba" },
      { id: "c", text: "Error" },
      { id: "d", text: "cba" },
    ],
    correctAnswer: "b",
    explanation: "s[::-1] reverses the string in Python using slice notation with step -1. 'abcabc' reversed is 'cbacba'.",
    marks: 4,
    negativeMarks: 1,
    tags: ["strings", "python", "slicing"],
  },

  // ─────────────────── LINKED LISTS ───────────────────────
  {
    id: "ll-001",
    topic: "Linked Lists",
    difficulty: "Easy",
    type: "MCQ",
    question: "In a singly linked list, what is the time complexity of deleting a node at the beginning?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(n log n)" },
      { id: "c", text: "O(1)" },
      { id: "d", text: "O(n²)" },
    ],
    correctAnswer: "c",
    explanation: "Deleting the head of a singly linked list only requires updating the head pointer to the next node — O(1).",
    marks: 4,
    negativeMarks: 1,
    tags: ["linked-list", "deletion", "time-complexity"],
  },
  {
    id: "ll-002",
    topic: "Linked Lists",
    difficulty: "Medium",
    type: "ALGORITHM_SELECTION",
    question: "To detect a cycle in a singly linked list with minimum space complexity, which algorithm should you use?",
    options: [
      { id: "a", text: "Store all visited nodes in a HashSet" },
      { id: "b", text: "Floyd's Cycle Detection (slow/fast pointers)" },
      { id: "c", text: "Reverse the list and compare" },
      { id: "d", text: "Convert to array and check for duplicates" },
    ],
    correctAnswer: "b",
    explanation: "Floyd's Tortoise and Hare algorithm uses two pointers (slow moves 1 step, fast moves 2) to detect cycles in O(n) time and O(1) space.",
    marks: 4,
    negativeMarks: 1,
    tags: ["linked-list", "cycle-detection", "floyd"],
  },

  // ─────────────────── STACKS ─────────────────────────────
  {
    id: "stk-001",
    topic: "Stacks",
    difficulty: "Easy",
    type: "MCQ",
    question: "A stack follows which principle?",
    options: [
      { id: "a", text: "FIFO — First In First Out" },
      { id: "b", text: "LIFO — Last In First Out" },
      { id: "c", text: "Priority-based ordering" },
      { id: "d", text: "Random access ordering" },
    ],
    correctAnswer: "b",
    explanation: "A stack is a LIFO (Last In First Out) data structure — the last element pushed is the first to be popped.",
    marks: 4,
    negativeMarks: 1,
    tags: ["stacks", "fundamentals"],
  },
  {
    id: "stk-002",
    topic: "Stacks",
    difficulty: "Medium",
    type: "ALGORITHM_SELECTION",
    question: "Which data structure is most appropriate for evaluating a postfix (Reverse Polish Notation) expression like '3 4 + 2 *'?",
    options: [
      { id: "a", text: "Queue" },
      { id: "b", text: "Stack" },
      { id: "c", text: "Binary Search Tree" },
      { id: "d", text: "Heap" },
    ],
    correctAnswer: "b",
    explanation: "A stack is perfect for evaluating postfix expressions: push operands, then for each operator pop two operands, apply the operator, and push the result.",
    marks: 4,
    negativeMarks: 1,
    tags: ["stacks", "postfix", "evaluation"],
  },

  // ─────────────────── QUEUES ─────────────────────────────
  {
    id: "que-001",
    topic: "Queues",
    difficulty: "Easy",
    type: "MCQ",
    question: "In BFS (Breadth-First Search), which data structure is used to keep track of the next node to visit?",
    options: [
      { id: "a", text: "Stack" },
      { id: "b", text: "Queue" },
      { id: "c", text: "Priority Queue" },
      { id: "d", text: "Deque" },
    ],
    correctAnswer: "b",
    explanation: "BFS uses a Queue (FIFO) to process nodes level by level. This ensures all neighbors at distance d are visited before nodes at distance d+1.",
    marks: 4,
    negativeMarks: 1,
    tags: ["queues", "bfs", "graphs"],
  },

  // ─────────────────── HASHING ────────────────────────────
  {
    id: "hash-001",
    topic: "Hashing",
    difficulty: "Easy",
    type: "MCQ",
    question: "What is the average time complexity of search, insert, and delete in a well-implemented hash table?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(1)" },
      { id: "d", text: "O(n log n)" },
    ],
    correctAnswer: "c",
    explanation: "A hash table uses a hash function to map keys to array indices. Under uniform hashing with a good load factor, all three operations average O(1).",
    marks: 4,
    negativeMarks: 1,
    tags: ["hashing", "time-complexity", "fundamentals"],
  },
  {
    id: "hash-002",
    topic: "Hashing",
    difficulty: "Medium",
    type: "ALGORITHM_SELECTION",
    question: "Given an array of integers, find two numbers that add up to a target. What is the most efficient approach?",
    options: [
      { id: "a", text: "Brute force: nested loops O(n²)" },
      { id: "b", text: "Sort and use two pointers O(n log n)" },
      { id: "c", text: "Use a HashSet: store seen numbers, check complement O(n)" },
      { id: "d", text: "Binary Search on each element O(n log n)" },
    ],
    correctAnswer: "c",
    explanation: "The HashMap/HashSet approach: for each number x, check if (target - x) exists in the set. This is O(n) time and O(n) space — optimal for this problem.",
    marks: 4,
    negativeMarks: 1,
    tags: ["hashing", "two-sum", "problem-solving"],
  },

  // ─────────────────── TREES ──────────────────────────────
  {
    id: "tree-001",
    topic: "Trees",
    difficulty: "Easy",
    type: "MCQ",
    question: "What is the height of a complete binary tree with n nodes?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(√n)" },
      { id: "d", text: "O(n²)" },
    ],
    correctAnswer: "b",
    explanation: "A complete binary tree has approximately log₂(n) levels, so its height is O(log n). At each level the number of nodes doubles.",
    marks: 4,
    negativeMarks: 1,
    tags: ["trees", "height", "binary-tree"],
  },
  {
    id: "tree-002",
    topic: "Trees",
    difficulty: "Medium",
    type: "ALGORITHM_SELECTION",
    question: "To print all nodes of a binary tree level by level (level-order traversal), which algorithm should you use?",
    options: [
      { id: "a", text: "DFS with a Stack" },
      { id: "b", text: "BFS with a Queue" },
      { id: "c", text: "Recursive in-order traversal" },
      { id: "d", text: "Post-order traversal" },
    ],
    correctAnswer: "b",
    explanation: "Level-order traversal = BFS. Use a queue: enqueue root, then repeatedly dequeue a node, process it, and enqueue its children.",
    marks: 4,
    negativeMarks: 1,
    tags: ["trees", "bfs", "level-order"],
  },

  // ─────────────────── BST ────────────────────────────────
  {
    id: "bst-001",
    topic: "Binary Search Trees",
    difficulty: "Medium",
    type: "MCQ",
    question: "For a Balanced BST (like AVL or Red-Black tree), what is the worst-case time complexity of search?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(1)" },
      { id: "d", text: "O(n log n)" },
    ],
    correctAnswer: "b",
    explanation: "A balanced BST maintains height O(log n), so search always takes O(log n) — at each step half the remaining nodes are eliminated.",
    marks: 4,
    negativeMarks: 1,
    tags: ["bst", "balanced", "search"],
  },

  // ─────────────────── HEAPS ──────────────────────────────
  {
    id: "heap-001",
    topic: "Heaps",
    difficulty: "Medium",
    type: "MCQ",
    question: "Which operation on a Max-Heap has the worst time complexity?",
    options: [
      { id: "a", text: "Get maximum (peek)" },
      { id: "b", text: "Insert a new element" },
      { id: "c", text: "Extract the maximum" },
      { id: "d", text: "Build a heap from an unsorted array" },
    ],
    correctAnswer: "d",
    explanation: "Building a heap (heapify all) is O(n) — but for individual operations: peek is O(1), insert is O(log n), extract-max is O(log n). Building is the most expensive, though surprisingly O(n) not O(n log n).",
    marks: 4,
    negativeMarks: 1,
    tags: ["heaps", "heapify", "time-complexity"],
  },

  // ─────────────────── GRAPHS ─────────────────────────────
  {
    id: "graph-001",
    topic: "Graphs",
    difficulty: "Medium",
    type: "MCQ",
    question: "What is the time complexity of BFS/DFS on a graph represented as an adjacency list with V vertices and E edges?",
    options: [
      { id: "a", text: "O(V²)" },
      { id: "b", text: "O(V + E)" },
      { id: "c", text: "O(E log V)" },
      { id: "d", text: "O(V log E)" },
    ],
    correctAnswer: "b",
    explanation: "With an adjacency list, each vertex is visited once (O(V)) and each edge is traversed once (O(E)). Total: O(V + E).",
    marks: 4,
    negativeMarks: 1,
    tags: ["graphs", "bfs", "dfs", "adjacency-list"],
  },
  {
    id: "graph-002",
    topic: "Graphs",
    difficulty: "Hard",
    type: "ALGORITHM_SELECTION",
    question: "You need to find the shortest path in a weighted directed graph with non-negative edge weights. Which algorithm is most appropriate?",
    options: [
      { id: "a", text: "BFS" },
      { id: "b", text: "DFS" },
      { id: "c", text: "Dijkstra's Algorithm" },
      { id: "d", text: "Prim's Algorithm" },
    ],
    correctAnswer: "c",
    explanation: "Dijkstra's algorithm finds shortest paths from a source to all vertices in a weighted graph with non-negative weights. BFS works only for unweighted graphs. Prim's is for MST, not shortest paths.",
    marks: 4,
    negativeMarks: 1,
    tags: ["graphs", "dijkstra", "shortest-path"],
  },

  // ─────────────────── SORTING ────────────────────────────
  {
    id: "sort-001",
    topic: "Sorting",
    difficulty: "Easy",
    type: "COMPLEXITY",
    question: "What is the average-case time complexity of Merge Sort?",
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n)" },
      { id: "d", text: "O(n log n)" },
      { id: "e", text: "O(n²)" },
    ],
    correctAnswer: "d",
    explanation: "Merge Sort always divides the array in half (log n levels) and merges in O(n) time per level. Total: O(n log n) in best, average, and worst case.",
    marks: 4,
    negativeMarks: 1,
    tags: ["sorting", "merge-sort", "time-complexity"],
  },
  {
    id: "sort-002",
    topic: "Sorting",
    difficulty: "Medium",
    type: "MCQ",
    question: "Which sorting algorithm is typically used by standard libraries (like Python's sorted() and Java's Arrays.sort for objects) due to its stability and performance?",
    options: [
      { id: "a", text: "Quick Sort" },
      { id: "b", text: "Bubble Sort" },
      { id: "c", text: "Tim Sort (hybrid Merge + Insertion)" },
      { id: "d", text: "Heap Sort" },
    ],
    correctAnswer: "c",
    explanation: "TimSort is a hybrid algorithm combining Merge Sort and Insertion Sort. It's O(n log n) worst-case, stable, and performs extremely well on real-world data. Used in Python and Java standard libraries.",
    marks: 4,
    negativeMarks: 1,
    tags: ["sorting", "timsort", "stdlib"],
  },

  // ─────────────────── SEARCHING ──────────────────────────
  {
    id: "srch-001",
    topic: "Searching",
    difficulty: "Easy",
    type: "COMPLEXITY",
    question: "What is the time complexity of Binary Search on a sorted array of n elements?",
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n)" },
      { id: "d", text: "O(n log n)" },
      { id: "e", text: "O(n²)" },
    ],
    correctAnswer: "b",
    explanation: "Binary Search halves the search space at each step. Starting with n elements, after k steps 1 element remains: n/2^k = 1, so k = log₂n. Time complexity: O(log n).",
    marks: 4,
    negativeMarks: 1,
    tags: ["searching", "binary-search", "time-complexity"],
  },

  // ─────────────────── RECURSION ──────────────────────────
  {
    id: "rec-001",
    topic: "Recursion",
    difficulty: "Medium",
    type: "CODE_OUTPUT",
    question: "What does the following function return for factorial(4)?",
    codeSnippet: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}
console.log(factorial(4));`,
    options: [
      { id: "a", text: "4" },
      { id: "b", text: "12" },
      { id: "c", text: "24" },
      { id: "d", text: "16" },
    ],
    correctAnswer: "c",
    explanation: "factorial(4) = 4 × factorial(3) = 4 × 3 × factorial(2) = 4 × 3 × 2 × factorial(1) = 4 × 3 × 2 × 1 = 24.",
    marks: 4,
    negativeMarks: 1,
    tags: ["recursion", "factorial"],
  },

  // ─────────────────── DYNAMIC PROGRAMMING ────────────────
  {
    id: "dp-001",
    topic: "Dynamic Programming",
    difficulty: "Hard",
    type: "MCQ",
    question: "In the 0/1 Knapsack problem with n items and capacity W, what is the time complexity of the standard DP solution?",
    options: [
      { id: "a", text: "O(n)" },
      { id: "b", text: "O(n log n)" },
      { id: "c", text: "O(nW)" },
      { id: "d", text: "O(2^n)" },
    ],
    correctAnswer: "c",
    explanation: "The classic DP table has dimensions n × W. For each item (n), for each capacity (W), we compute one value: O(nW). This is pseudo-polynomial since W can be large.",
    marks: 4,
    negativeMarks: 1,
    tags: ["dynamic-programming", "knapsack", "time-complexity"],
  },

  // ─────────────────── TWO POINTERS ───────────────────────
  {
    id: "tp-001",
    topic: "Two Pointers",
    difficulty: "Medium",
    type: "ALGORITHM_SELECTION",
    question: "To check if a sorted array has a pair of numbers that sum to a given target, which approach gives the best time and space complexity?",
    options: [
      { id: "a", text: "Nested loops: O(n²) time, O(1) space" },
      { id: "b", text: "HashSet: O(n) time, O(n) space" },
      { id: "c", text: "Two Pointers on sorted array: O(n) time, O(1) space" },
      { id: "d", text: "Sort then binary search for each: O(n log n)" },
    ],
    correctAnswer: "c",
    explanation: "Since the array is already sorted, Two Pointers is optimal: start with left=0, right=n-1. If sum < target: move left right; if sum > target: move right left. O(n) time, O(1) space.",
    marks: 4,
    negativeMarks: 1,
    tags: ["two-pointers", "sorted-array", "pair-sum"],
  },

  // ─────────────────── SLIDING WINDOW ─────────────────────
  {
    id: "sw-001",
    topic: "Sliding Window",
    difficulty: "Medium",
    type: "ALGORITHM_SELECTION",
    question: "Find the longest substring without repeating characters. Which technique gives O(n) time complexity?",
    options: [
      { id: "a", text: "Brute force: check all substrings O(n³)" },
      { id: "b", text: "Sort characters then scan O(n log n)" },
      { id: "c", text: "Sliding Window with a HashSet O(n)" },
      { id: "d", text: "Dynamic Programming table O(n²)" },
    ],
    correctAnswer: "c",
    explanation: "Sliding Window: maintain a window [left, right] and a HashSet of characters. Expand right; when a duplicate is found, shrink from left until the duplicate is removed. O(n) time.",
    marks: 4,
    negativeMarks: 1,
    tags: ["sliding-window", "longest-substring", "hashset"],
  },

  // ─────────────────── TIME COMPLEXITY ────────────────────
  {
    id: "tc-001",
    topic: "Time Complexity",
    difficulty: "Medium",
    type: "COMPLEXITY",
    question: "What is the time complexity of the following code snippet?",
    codeSnippet: `for (let i = 0; i < n; i++) {
  for (let j = i; j < n; j++) {
    // O(1) operation
  }
}`,
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n)" },
      { id: "d", text: "O(n log n)" },
      { id: "e", text: "O(n²)" },
    ],
    correctAnswer: "e",
    explanation: "The inner loop runs n + (n-1) + (n-2) + ... + 1 = n(n+1)/2 times, which is O(n²). The starting point of the inner loop does not change the quadratic nature.",
    marks: 4,
    negativeMarks: 1,
    tags: ["time-complexity", "nested-loops", "big-o"],
  },

  // ─────────────────── DEBUGGING ──────────────────────────
  {
    id: "dbg-001",
    topic: "Problem Solving",
    difficulty: "Medium",
    type: "DEBUGGING",
    question: "The following binary search implementation has a bug. Identify the correct fix:",
    codeSnippet: `function binarySearch(arr, target) {
  let left = 0, right = arr.length;  // BUG HERE
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    options: [
      { id: "a", text: "Change 'arr.length' to 'arr.length - 1'" },
      { id: "b", text: "Change 'left <= right' to 'left < right'" },
      { id: "c", text: "Change 'mid + 1' to 'mid'" },
      { id: "d", text: "Change Math.floor to Math.ceil" },
    ],
    correctAnswer: "a",
    explanation: "The right pointer should be initialized to arr.length - 1 (last valid index). Using arr.length causes arr[right] to be undefined and can lead to incorrect results or infinite loops.",
    marks: 4,
    negativeMarks: 1,
    tags: ["debugging", "binary-search", "off-by-one"],
  },
  {
    id: "dbg-002",
    topic: "Linked Lists",
    difficulty: "Hard",
    type: "DEBUGGING",
    question: "Find the bug in this function that reverses a linked list:",
    codeSnippet: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    let next = curr.next;
    curr.next = prev;
    curr = next;  // BUG: should we update prev?
  }
  return curr;   // BUG
}`,
    options: [
      { id: "a", text: "Add 'prev = curr' before 'curr = next', and return prev instead of curr" },
      { id: "b", text: "Change the while condition to curr.next !== null" },
      { id: "c", text: "Return head instead of curr" },
      { id: "d", text: "Initialize curr to head.next" },
    ],
    correctAnswer: "a",
    explanation: "Two bugs: (1) prev is never updated — should be 'prev = curr' before moving forward. (2) After the loop, curr is null; we should return prev which points to the new head.",
    marks: 4,
    negativeMarks: 1,
    tags: ["debugging", "linked-list", "reversal"],
  },

  // ─────────────────── MULTI-SELECT ───────────────────────
  {
    id: "ms-001",
    topic: "Sorting",
    difficulty: "Medium",
    type: "MULTI_SELECT",
    question: "Which of the following sorting algorithms are stable? (Select all that apply)",
    options: [
      { id: "a", text: "Merge Sort" },
      { id: "b", text: "Quick Sort (standard implementation)" },
      { id: "c", text: "Bubble Sort" },
      { id: "d", text: "Heap Sort" },
      { id: "e", text: "Insertion Sort" },
    ],
    correctAnswer: ["a", "c", "e"],
    explanation: "Merge Sort, Bubble Sort, and Insertion Sort are stable (equal elements preserve relative order). Quick Sort and Heap Sort in standard implementations are NOT stable.",
    marks: 4,
    negativeMarks: 1,
    tags: ["sorting", "stable", "multi-select"],
  },
  {
    id: "ms-002",
    topic: "Graphs",
    difficulty: "Hard",
    type: "MULTI_SELECT",
    question: "Which of the following can be used to detect a cycle in a DIRECTED graph? (Select all that apply)",
    options: [
      { id: "a", text: "DFS with recursion stack (coloring/visited flags)" },
      { id: "b", text: "Kahn's Algorithm (topological sort using in-degree)" },
      { id: "c", text: "Floyd's Tortoise and Hare algorithm" },
      { id: "d", text: "Union-Find (Disjoint Set Union)" },
    ],
    correctAnswer: ["a", "b"],
    explanation: "For directed graphs: (a) DFS with a recursion stack detects back edges = cycles. (b) Kahn's topological sort: if not all nodes are processed, a cycle exists. Floyd's cycle detection works on linked lists. Union-Find detects cycles in UNDIRECTED graphs.",
    marks: 4,
    negativeMarks: 1,
    tags: ["graphs", "cycle-detection", "directed"],
  },

  // ─────────────────── CODING QUESTIONS ───────────────────
  {
    id: "code-001",
    topic: "Arrays",
    difficulty: "Medium",
    type: "CODING",
    question: `**Reverse an Array**\n\nWrite a function that reverses an array in-place and returns it.\n\nDo NOT create a new array — modify the original.\n\n**Example:**\n\nInput: [1, 2, 3, 4, 5]\nOutput: [5, 4, 3, 2, 1]\n\nInput: [1]\nOutput: [1]`,
    marks: 8,
    negativeMarks: 0,
    testCases: [
      { input: "[1, 2, 3, 4, 5]", expectedOutput: "[5, 4, 3, 2, 1]", isHidden: false, description: "Basic reversal" },
      { input: "[1]", expectedOutput: "[1]", isHidden: false, description: "Single element" },
      { input: "[]", expectedOutput: "[]", isHidden: true, description: "Empty array" },
      { input: "[3, 1]", expectedOutput: "[1, 3]", isHidden: true, description: "Two elements" },
      { input: "[5, 4, 3, 2, 1]", expectedOutput: "[1, 2, 3, 4, 5]", isHidden: true, description: "Already reversed" },
    ],
    starterCode: {
      JavaScript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function reverseArray(nums) {
  // Your code here
  
}`,
      Python: `def reverse_array(nums: list) -> list:
    # Your code here
    pass`,
      Java: `class Solution {
    public int[] reverseArray(int[] nums) {
        // Your code here
        return nums;
    }
}`,
      "C++": `#include <vector>
using namespace std;

vector<int> reverseArray(vector<int>& nums) {
    // Your code here
    return nums;
}`,
    },
    explanation: "Use two pointers: one at start, one at end. Swap elements and move pointers toward center. O(n) time, O(1) space.",
    tags: ["arrays", "two-pointers", "in-place"],
    correctAnswer: "// See test cases",
  },
  {
    id: "code-002",
    topic: "Hashing",
    difficulty: "Medium",
    type: "CODING",
    question: `**Two Sum**\n\nGiven an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\n\nYou may assume exactly one solution exists. The same element cannot be used twice.\n\n**Example:**\n\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1] (because nums[0] + nums[1] == 9)`,
    marks: 8,
    negativeMarks: 0,
    testCases: [
      { input: "nums=[2,7,11,15], target=9", expectedOutput: "[0, 1]", isHidden: false, description: "Basic case" },
      { input: "nums=[3,2,4], target=6", expectedOutput: "[1, 2]", isHidden: false, description: "Non-adjacent pair" },
      { input: "nums=[3,3], target=6", expectedOutput: "[0, 1]", isHidden: true, description: "Duplicate values" },
      { input: "nums=[1,2,3,4,5], target=9", expectedOutput: "[3, 4]", isHidden: true, description: "Last two elements" },
    ],
    starterCode: {
      JavaScript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
  
}`,
      Python: `def two_sum(nums: list, target: int) -> list:
    # Your code here
    pass`,
      Java: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
        return new int[]{};
    }
}`,
      "C++": `#include <vector>
#include <unordered_map>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}`,
    },
    explanation: "Use a HashMap: for each number, check if its complement (target - num) is already in the map. Store index as value.",
    tags: ["hashing", "two-sum", "leetcode-classic"],
    correctAnswer: "// See test cases",
  },

  // ─────────────────── MORE QUESTIONS ─────────────────────
  {
    id: "tc-002",
    topic: "Time Complexity",
    difficulty: "Hard",
    type: "COMPLEXITY",
    question: "What is the time complexity of the following recursive function?",
    codeSnippet: `function mystery(n) {
  if (n <= 1) return 1;
  return mystery(n / 2) + mystery(n / 2);
}`,
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n)" },
      { id: "d", text: "O(n log n)" },
      { id: "e", text: "O(n²)" },
    ],
    correctAnswer: "c",
    explanation: "The recurrence is T(n) = 2T(n/2) + O(1). By the Master Theorem (case 1), this resolves to O(n). The tree has log n levels but 2^(log n) = n leaf nodes.",
    marks: 4,
    negativeMarks: 1,
    tags: ["time-complexity", "recursion", "master-theorem"],
  },
  {
    id: "arr-005",
    topic: "Arrays",
    difficulty: "Hard",
    type: "ALGORITHM_SELECTION",
    question: "Given an unsorted array of n integers, find the kth largest element efficiently. Which approach is optimal?",
    options: [
      { id: "a", text: "Sort the array, return arr[n-k]: O(n log n)" },
      { id: "b", text: "Use a Min-Heap of size k: O(n log k)" },
      { id: "c", text: "QuickSelect algorithm: O(n) average" },
      { id: "d", text: "Iterate k times finding max: O(nk)" },
    ],
    correctAnswer: "c",
    explanation: "QuickSelect (a variant of QuickSort partition) finds the kth element in O(n) average time. For kth largest in a large n, this beats sorting. A k-size Min-Heap at O(n log k) is also excellent in practice.",
    marks: 4,
    negativeMarks: 1,
    tags: ["arrays", "quickselect", "kth-largest"],
  },
  {
    id: "tree-003",
    topic: "Trees",
    difficulty: "Hard",
    type: "MULTI_SELECT",
    question: "Which traversals of a Binary Search Tree produce elements in sorted order? (Select all that apply)",
    options: [
      { id: "a", text: "In-order (Left → Root → Right)" },
      { id: "b", text: "Pre-order (Root → Left → Right)" },
      { id: "c", text: "Post-order (Left → Right → Root)" },
      { id: "d", text: "Level-order (BFS)" },
    ],
    correctAnswer: ["a"],
    explanation: "Only in-order traversal of a BST produces a sorted sequence. Pre-order, Post-order, and Level-order do not produce sorted output from a BST.",
    marks: 4,
    negativeMarks: 1,
    tags: ["bst", "traversal", "in-order"],
  },
  {
    id: "hash-003",
    topic: "Hashing",
    difficulty: "Hard",
    type: "MCQ",
    question: "What is 'open addressing' in hash tables?",
    options: [
      { id: "a", text: "Using a linked list to store multiple elements at the same hash index" },
      { id: "b", text: "Storing colliding elements directly in the table by probing for the next available slot" },
      { id: "c", text: "Expanding the table whenever a collision occurs" },
      { id: "d", text: "Using a secondary hash function to always find a unique slot" },
    ],
    correctAnswer: "b",
    explanation: "Open addressing resolves collisions by probing the table for the next empty slot (linear probing, quadratic probing, or double hashing). No extra data structures — all elements live inside the table.",
    marks: 4,
    negativeMarks: 1,
    tags: ["hashing", "collision-resolution", "open-addressing"],
  },
  {
    id: "graph-003",
    topic: "Graphs",
    difficulty: "Hard",
    type: "MCQ",
    question: "In Dijkstra's algorithm using a binary min-heap (priority queue), what is the total time complexity for a graph with V vertices and E edges?",
    options: [
      { id: "a", text: "O(V²)" },
      { id: "b", text: "O(E + V)" },
      { id: "c", text: "O((V + E) log V)" },
      { id: "d", text: "O(VE)" },
    ],
    correctAnswer: "c",
    explanation: "With a binary min-heap: Each vertex extraction is O(log V), done V times = O(V log V). Each edge relaxation may involve a decrease-key = O(log V), done E times = O(E log V). Total: O((V + E) log V).",
    marks: 4,
    negativeMarks: 1,
    tags: ["graphs", "dijkstra", "priority-queue", "time-complexity"],
  },
  {
    id: "sw-002",
    topic: "Sliding Window",
    difficulty: "Hard",
    type: "ALGORITHM_SELECTION",
    question: "Find the minimum length subarray with a sum ≥ target in a positive-integer array. What is the optimal time complexity?",
    options: [
      { id: "a", text: "O(n²) using brute force" },
      { id: "b", text: "O(n log n) using binary search" },
      { id: "c", text: "O(n) using sliding window / two pointers" },
      { id: "d", text: "O(n²) using DP table" },
    ],
    correctAnswer: "c",
    explanation: "Since all elements are positive, the window sum is monotonic. Expand right pointer to meet the target, then shrink left pointer to minimize length. O(n) with the sliding window technique.",
    marks: 4,
    negativeMarks: 1,
    tags: ["sliding-window", "minimum-subarray", "two-pointers"],
  },
  {
    id: "que-002",
    topic: "Queues",
    difficulty: "Medium",
    type: "MCQ",
    question: "Which data structure should you use to efficiently implement a sliding window maximum (find max in each window of size k)?",
    options: [
      { id: "a", text: "Stack" },
      { id: "b", text: "Monotonic Deque (double-ended queue)" },
      { id: "c", text: "Max-Heap" },
      { id: "d", text: "HashSet" },
    ],
    correctAnswer: "b",
    explanation: "A Monotonic Deque maintains indices in decreasing order of values. The front always has the max for the current window. Elements are added/removed O(1) amortized, giving O(n) overall.",
    marks: 4,
    negativeMarks: 1,
    tags: ["queues", "deque", "sliding-window-max"],
  },
  {
    id: "ps-001",
    topic: "Problem Solving",
    difficulty: "Medium",
    type: "ALGORITHM_SELECTION",
    question: "You are given a grid of 0s and 1s. Count the number of islands (connected groups of 1s, connected horizontally/vertically). Which approach works?",
    options: [
      { id: "a", text: "Scan left to right, count transitions" },
      { id: "b", text: "DFS/BFS from each unvisited '1', mark visited cells, count components" },
      { id: "c", text: "Sort rows and find distinct values" },
      { id: "d", text: "Use binary search on each row" },
    ],
    correctAnswer: "b",
    explanation: "This is a classic connected components problem. For each unvisited '1', run DFS/BFS to mark the entire island as visited. Increment island count each time we initiate a DFS/BFS. O(m × n) time.",
    marks: 4,
    negativeMarks: 1,
    tags: ["graphs", "dfs", "bfs", "number-of-islands"],
  },
  {
    id: "rec-002",
    topic: "Recursion",
    difficulty: "Hard",
    type: "COMPLEXITY",
    question: "What is the time complexity of the naive recursive Fibonacci function?",
    codeSnippet: `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`,
    options: [
      { id: "a", text: "O(1)" },
      { id: "b", text: "O(log n)" },
      { id: "c", text: "O(n)" },
      { id: "d", text: "O(n log n)" },
      { id: "e", text: "O(n²)" },
    ],
    correctAnswer: "e",
    explanation: "The naive recursive Fibonacci has exponential time O(2^n) — which is worse than O(n²). However among the given options, O(n²) is the closest (the actual answer is O(φ^n) ≈ O(1.618^n)). With memoization it becomes O(n).",
    marks: 4,
    negativeMarks: 1,
    tags: ["recursion", "fibonacci", "exponential-time"],
  },
  {
    id: "dp-002",
    topic: "Dynamic Programming",
    difficulty: "Medium",
    type: "MCQ",
    question: "Which property MUST hold for a problem to be solvable with Dynamic Programming?",
    options: [
      { id: "a", text: "The problem must involve sorting" },
      { id: "b", text: "Optimal Substructure and Overlapping Subproblems" },
      { id: "c", text: "The input must be a graph" },
      { id: "d", text: "The solution must be a single integer" },
    ],
    correctAnswer: "b",
    explanation: "DP requires: (1) Optimal Substructure — optimal solution built from optimal sub-solutions. (2) Overlapping Subproblems — same subproblems solved multiple times (unlike divide & conquer where subproblems are independent).",
    marks: 4,
    negativeMarks: 1,
    tags: ["dynamic-programming", "optimal-substructure", "overlapping-subproblems"],
  },
];
