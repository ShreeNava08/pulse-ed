const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets from both root and public directories
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// Safe file resolver
function sendHtmlFile(res, fileName) {
  const rootPath = path.join(__dirname, fileName);
  const publicPath = path.join(__dirname, 'public', fileName);

  if (fs.existsSync(rootPath)) {
    return res.sendFile(rootPath);
  } else if (fs.existsSync(publicPath)) {
    return res.sendFile(publicPath);
  } else {
    return res.status(404).send(`<h3>Error 404: ${fileName} not found</h3>`);
  }
}

// Routes
app.get('/', (req, res) => sendHtmlFile(res, 'student.html'));
app.get('/student.html', (req, res) => sendHtmlFile(res, 'student.html'));
app.get('/teacher.html', (req, res) => sendHtmlFile(res, 'teacher.html'));

// Mathematics: Calculus & Algebra Dataset
let quizzes = [
  {
    id: "quiz_math_01",
    topic: "Mathematics: Calculus & Foundational Algebra",
    questions: [
      {
        id: "q1",
        text: "What are the roots of the quadratic equation (x - 3)(x + 2) = 0?",
        concept: "Algebraic Roots",
        options: [
          "x = 3 and x = -2",
          "x = -3 and x = 2",
          "x = 3 and x = 2"
        ],
        correctIndex: 0
      },
      {
        id: "q2",
        text: "What is the limit of (x² - 1) / (x - 1) as x approaches 1?",
        concept: "Limits & Indeterminate Forms",
        options: [
          "0 (zero)",
          "1",
          "2"
        ],
        correctIndex: 2
      },
      {
        id: "q3",
        text: "Geometrically, what does the first derivative f'(a) represent on a curve y = f(x)?",
        concept: "Derivative as Slope of Tangent",
        options: [
          "The total area under the curve up to x = a",
          "The slope of the tangent line at x = a",
          "The distance between point a and the y-axis"
        ],
        correctIndex: 1
      }
    ]
  }
];

let students = [
  { id: "S101", name: "Aditi Rao", fails: 2, weakConcept: "Limits & Indeterminate Forms", status: "At-Risk" },
  { id: "S102", name: "Karthik Gowda", fails: 0, weakConcept: "None", status: "On-Track" },
  { id: "S103", name: "Mohammed Zeeshan", fails: 3, weakConcept: "Limits & Indeterminate Forms", status: "Critical" },
  { id: "S104", name: "Sneha Nair", fails: 0, weakConcept: "None", status: "On-Track" },
  { id: "S105", name: "Vikram Patil", fails: 2, weakConcept: "Algebraic Roots", status: "At-Risk" }
];

let liveSubmissions = [
  { name: "Sneha Nair", id: "S104", score: "3/3", time: "1 min ago" },
  { name: "Karthik Gowda", id: "S102", score: "2/3", time: "3 mins ago" },
  { name: "Aditi Rao", id: "S101", score: "1/3", time: "5 mins ago" }
];

let totalSubmissionsCount = 28;

// API Endpoints
app.get('/api/active-quiz', (req, res) => {
  res.json(quizzes[0]);
});

app.post('/api/submit', (req, res) => {
  const { studentId, studentName, answers } = req.body;
  const activeQuiz = quizzes[0];
  let correctCount = 0;

  activeQuiz.questions.forEach((q) => {
    if (answers && answers[q.id] === q.correctIndex) {
      correctCount++;
    }
  });

  const displayName = studentName || studentId || "Anonymous Student";
  const displayId = studentId || "DEMO";

  // Prepend new submission to live stream
  liveSubmissions.unshift({
    name: displayName,
    id: displayId,
    score: `${correctCount}/${activeQuiz.questions.length}`,
    time: "Just now"
  });

  totalSubmissionsCount += 1;

  // Add low score directly to At-Risk table for live demo effect
  if (correctCount <= 1) {
    const existingIndex = students.findIndex(s => s.id === displayId);
    if (existingIndex !== -1) {
      students[existingIndex].fails += 1;
      students[existingIndex].status = "Critical";
    } else {
      students.unshift({
        id: displayId,
        name: displayName,
        fails: 1,
        weakConcept: "Limits & Indeterminate Forms",
        status: "At-Risk"
      });
    }
  }

  res.json({ success: true, score: `${correctCount}/${activeQuiz.questions.length}` });
});

app.get('/api/analytics', (req, res) => {
  res.json({
    totalStudents: 30,
    submissionsCount: totalSubmissionsCount,
    conceptMastery: [
      { concept: "Derivative as Slope", masteryPct: 84, status: "Good" },
      { concept: "Algebraic Roots", masteryPct: 71, status: "Moderate" },
      { concept: "Limits & Indeterminate Forms", masteryPct: 44, status: "Critical Bottleneck" }
    ],
    atRiskStudents: students.filter(s => s.fails >= 1),
    recentSubmissions: liveSubmissions
  });
});

app.listen(PORT, () => {
  console.log(`Server online on port ${PORT}!`);
});