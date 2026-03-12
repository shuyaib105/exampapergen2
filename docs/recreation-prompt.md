# Exam Paper Generator AI Prompt (Full Featured)

Copy and paste the following prompt into an AI like ChatGPT, Claude, or Gemini to recreate this application using pure HTML, CSS, and JavaScript.

---

**Prompt:**

"Create a professional, high-performance single-file web application (HTML, CSS, JS) called 'ExamPaperGen' for generating exam papers in Bengali. The app must feature two modes: MCQ and CQ (Creative Questions).

### Core Features:
1. **Landing Page**: A clean UI to choose between 'MCQ Mode' and 'CQ Mode'.
2. **Layout**:
   - **Sidebar**: A control panel (30% width) for settings and inputs.
   - **Main Area**: A real-time preview of the A4 paper (70% width) using 'Noto Serif Bengali' from Google Fonts.
3. **Common Settings**:
   - Inputs for: Exam Name, Author/Institution Name, Time, Total Marks.
   - **Font Size Slider**: Controls the font size of the printed paper (range: 8px to 16px).
4. **Input Methods**:
   - **Manual Input**:
     - **MCQ**: Fields for Question text, 4 Options, Correct Answer, and an Image Upload button (convert image to Base64 for local preview).
     - **CQ**: Fields for Stimulus text, Stimulus Image Upload, and sub-questions (a, b, c, d).
   - **JSON Input**: A textarea to paste JSON arrays. **CRITICAL**: JSON generation must APPEND to existing questions, not overwrite them.
5. **MCQ Logic**:
   - **Seeded Shuffle**: Support Sets A, B, C, D. Set A is original. Sets B-D must use a seeded random function to shuffle question order consistently for each set.
   - **Layout**: Questions must be in a **two-column layout**. Options must be in a **2x2 grid**.
6. **CQ Logic**:
   - Stimulus (text/image) must appear first, followed by parts (ক, খ, গ, ঘ) in a list.
7. **Export & Printing**:
   - **Export with Answers**: Highlights correct options and shows explanations.
   - **Export without Answers**: Clean paper for students.
   - **CSS Print Media Queries**:
     - Page: A4, Margins: **0.1cm** (extremely small).
     - Hide all UI/Sidebar.
     - Ensure questions don't break across pages where possible (`page-break-inside: avoid`).
8. **Answer Sheet**: A button to show a modal with only the MCQ answer keys (e.g., 1. A, 2. C) for the current set.

### Styling Requirements:
- Use a modern, professional color palette (Primary: Slate/Blue, Accent: Amber).
- Use Lucide Icons (via CDN) for buttons.
- Ensure the preview looks like a real printed paper.
- Responsive design for mobile/desktop.

Please provide the complete code in a single HTML file."

---

