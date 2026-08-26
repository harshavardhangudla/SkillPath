# SkillPath 🚀

## Graph-Powered Career & Skill Path Explorer

SkillPath is an interactive career exploration platform that uses a graph database to represent relationships between careers, skills, and prerequisites.

Instead of simply listing the skills required for a career, SkillPath shows **how those skills are connected** and helps users understand **what they should learn first**.

---

## ✨ Features

- 🎯 Explore multiple career paths
- 🧠 View skills required for each career
- 📊 Categorize skills by Beginner, Intermediate, and Advanced levels
- 🕸️ Explore an interactive skill dependency graph
- 🔎 Search for specific skills
- 🖱️ Click a skill to inspect its details
- 🧭 Identify prerequisite skills automatically
- 🛣️ Generate a learning path toward a selected skill
- 💡 Visually highlight prerequisite chains
- 🔄 Switch between different careers
- 🗄️ Store career, skill, and prerequisite relationships in a graph database
- ⚡ Retrieve graph data through REST APIs

---

## 🎯 Supported Career Paths

SkillPath currently supports:

- AI Engineer
- Data Scientist
- Full-Stack Developer
- ML Engineer
- Machine Learning Engineer

---

## 🏗️ Architecture

```text
                    ┌────────────────────────┐
                    │       React UI         │
                    │                        │
                    │   Career Explorer      │
                    │   Skill Map            │
                    │   Interactive Graph    │
                    │   Skill Details        │
                    └────────────┬───────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌────────────────────────┐
                    │        FastAPI         │
                    │                        │
                    │   Career APIs          │
                    │   Skill APIs           │
                    │   Graph APIs           │
                    └────────────┬───────────┘
                                 │
                                 │ Cypher Queries
                                 ▼
                    ┌────────────────────────┐
                    │     Neo4j / CognoDB    │
                    │                        │
                    │   Careers              │
                    │   Skills               │
                    │   Prerequisites        │
                    │   Relationships        │
                    └────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Flow
- CSS

### Backend

- Python
- FastAPI
- Uvicorn

### Database

- Neo4j / CognoDB
- Cypher

### API Communication

- REST APIs
- JSON

---

## 🧩 How SkillPath Works

SkillPath models careers and skills as a connected graph.

For example:

```text
Python
   │
   ├──────────────► NumPy
   │                  │
   │                  ▼
   │            Machine Learning
   │                  │
   │                  ▼
   │            Neural Networks
   │                  │
   │                  ▼
   │             Deep Learning
   │
   └──────────────► Pandas
```

When a user selects a skill, SkillPath can determine:

- What prerequisites are required
- Which skills should be learned first
- How the selected skill connects to other skills
- The learning path toward the selected skill

---

## 🔌 API Endpoints

### Get Careers

```http
GET /api/careers
```

### Get Career Skills

```http
GET /api/careers/{career}/skills
```

### Get Career Graph

```http
GET /api/careers/{career}/graph
```

---

## 📂 Project Structure

```text
SkillPath/
│
├── backend/
│   ├── database.py
│   ├── main.py
│   ├── queries.py
│   ├── requirements.txt
│   ├── seed.py
│   └── test_connection.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Running the Project Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

### Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

Database credentials and other secrets should be stored in environment variables.

Example:

```env
NEO4J_URI=your_neo4j_uri
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_neo4j_password
```

**Never commit real database credentials, passwords, or API keys to Git.**

---

## 🖥️ Application

### Career Explorer

Switch between different career paths and view the required skills.

### Interactive Skill Graph

Visualize relationships between skills and their prerequisites.

### Skill Details

Click a skill to view:

- Category
- Difficulty
- Prerequisites
- Learning path

### Learning Path

Prerequisite relationships are highlighted to show what should be learned first.

---

## 🔄 Application Flow

```text
User selects career
        │
        ▼
React requests career data
        │
        ▼
FastAPI REST API
        │
        ▼
Neo4j / CognoDB
        │
        ▼
Career + Skills + Relationships
        │
        ▼
React Flow renders graph
        │
        ▼
User selects a skill
        │
        ▼
Prerequisites and learning path highlighted
```

---

## 🎯 Project Goal

The goal of SkillPath is to make career planning more **structured, visual, and actionable**.

Traditional career guides often provide a static list of technologies or skills.

SkillPath focuses on the relationships between those skills, helping users answer:

> **"What should I learn first, and what should I learn next?"**

---

## 🔮 Future Improvements

- 🤖 AI-powered personalized career recommendations
- 📈 Skill progress tracking
- 👤 User profiles and personalized learning paths
- 📚 Learning resource recommendations
- 🎓 Course and certification recommendations
- 🧠 AI-generated learning roadmaps
- 📊 Progress visualization
- ☁️ Cloud deployment
- 🔐 User authentication

---

## 👨‍💻 Author

**Harsha Vardhan Gudla**

GitHub: https://github.com/harshavardhangudla/SkillPath

---

## 📄 License

This project is currently intended for educational and demonstration purposes.
