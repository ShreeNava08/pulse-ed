const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve HTML files directly from current folder
app.use(express.static(__dirname));

// Self-contained data
let quizzes = [
  {
    id: "quiz_01",
    topic: "Physics: Laws of Motion",
    questions: [
      {
        id: "q1",
        text: "If the net external force on a moving object is zero, what happens to its velocity?",
        concept: "Newton's First Law",
        options: ["It drops to zero instantly", "It remains constant in magnitude and direction", "It continuously increases"],
        correctIndex: 1
      },
      {
        id: "q2",
        text: "A heavy book rests on a table. Which pair represents Newton's 3rd Law pair?",
        concept: "Action-Reaction Pairs",
        options: ["Gravity pulling down & Normal force pushing up", "Book pushing table & Table pushing book", "Weight & Air resistance"],
        correctIndex: 1
      },
      {
        id: "q3",
        text: "Why do passengers jerk forward when a bus suddenly hits the brakes?",
        concept: "Inertia of Motion",
        options: ["A backward force pushes them", "Upper body continues in forward motion due to inertia", "Air friction inside cabin"],
        correctIndex: 1
      }
    ]
  }
];

let students = [
  { id: "S101", name: "Aditi Rao", fails: 2, weakConcept: "Action-Reaction Pairs", status: "At-Risk" },
  { id: "S102", name: "Karthik Gowda", fails: 0, weakConcept: "None", status: "On-Track" },
  { id: "S103", name: "Mohammed Zeeshan", fails: 3, weakConcept: "Action-Reaction Pairs", status: "Critical" },
  { id: "S104", name: "Sneha Nair", fails: 0, weakConcept: "None", status: "On-Track" },
  { id: "S105", name: "Vikram Patil", fails: 2, weakConcept: "Newton's First Law", status: "At-Risk" }
];

let liveSubmissions = [
  { name: "Sneha Nair", id: "S104", score: "3/3", time: "1 min ago" },
  { name: "Karthik Gowda", id: "S102", score: "2/3", time: "3 mins ago" },
  { name: "Aditi Rao", id: "S101", score: "1/3", time: "5 mins ago" }
];

let totalSubmissionsCount = 28;

// Routes
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

  const displayName = studentName || studentId || "Demo Student";
  const displayId = studentId || "DEMO";

  // Add submission to top of live feed
  liveSubmissions.unshift({
    name: displayName,
    id: displayId,
    score: `${correctCount}/${activeQuiz.questions.length}`,
    time: "Just now"
  });

  totalSubmissionsCount += 1;

  // Dynamically add low scores to the At-Risk table
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
        weakConcept: "Action-Reaction Pairs",
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
      { concept: "Inertia of Motion", masteryPct: 88, status: "Good" },
      { concept: "Newton's First Law", masteryPct: 76, status: "Moderate" },
      { concept: "Action-Reaction Pairs", masteryPct: 42, status: "Critical Bottleneck" }
    ],
    atRiskStudents: students.filter(s => s.fails >= 1),
    recentSubmissions: liveSubmissions
  });
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'student.html'));
});
app.listen(PORT, () => {
  console.log(`Server online on port ${PORT}!`);
});