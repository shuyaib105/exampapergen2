# Exam Paper Generator AI Prompt

Copy and paste the following prompt into an AI like ChatGPT, Claude, or Gemini to recreate this application using pure HTML, CSS, and JavaScript.

---

**Prompt:**

"Create a professional single-file web application (HTML, CSS, JS) called 'ExamPaperGen' for generating MCQ exam papers in Bengali. The app should have the following features:

1. **Layout**: A sidebar for controls and a main preview area for the exam paper. Use 'Noto Serif Bengali' from Google Fonts.
2. **Inputs**:
   - Exam Name (default: 'মডেল টেস্ট')
   - Time (default: '২ ঘন্টা')
   - Total Marks (default: '১০০')
   - Set Selection (A, B, C, D)
   - Font Size Slider (8px to 16px) specifically for the printed paper.
   - JSON Input Textarea: Accepts an array of objects like `{"question": "...", "options": ["...", "...", "...", "..."], "answer": "...", "explanation": "..."}`.
3. **Core Logic**:
   - **JSON Parsing**: A 'Generate' button that parses the JSON and populates the paper.
   - **Shuffle System**: When a set (B, C, or D) is selected, shuffle the questions using a seed-based random function so the order is consistent for that set. Set A remains original.
   - **Answer Toggle**: A switch to show/hide correct answers in the live preview.
4. **Preview & Print UI**:
   - **Header**: Centered title, then 'Md Jubayer | রংপুর মেডিকেল কলেজ' underneath. Below that, a row with 'Total Marks', 'Set Name', and 'Time'.
   - **Questions**: Display questions in a **two-column layout** (`column-count: 2`).
   - **Options**: Options for each question must be in a **2x2 grid** (two options per line).
   - **Styling**: Minimal gaps between questions to fit maximum content (target ~25 questions per page).
5. **PDF Export**:
   - Two buttons: 'Export with Answers' and 'Export without Answers'.
   - **CSS Print Media Queries**:
     - Page size: A4.
     - **Extremely small margins** (top, bottom, left, right: ~0.1cm) as requested.
     - Hide the sidebar and all UI controls during print.
     - Only show correct answers if 'Export with Answers' is clicked.
6. **Answer Sheet**: A button to open a modal/dialog showing only the question numbers and their correct option labels (e.g., 1. A, 2. C) for the current set.

Please ensure the code is clean, responsive, and works in modern browsers without external dependencies except Google Fonts and Lucide Icons (CDN)."

---