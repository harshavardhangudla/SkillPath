# SkillPath 🚀

### Graph-Powered Career & Skill Path Explorer

SkillPath is an interactive career exploration platform that uses a graph database to represent relationships between careers, skills, and prerequisites.

Instead of simply listing skills required for a career, SkillPath shows **how those skills are connected** and helps users understand **what they should learn first**.

---

## ✨ Features

- 🎯 Explore different career paths
- 🧠 View skills required for each career
- 📊 See Beginner, Intermediate, and Advanced skill levels
- 🕸️ Interactive skill dependency graph
- 🔎 Search for specific skills
- 🖱️ Click a skill to inspect its details
- 🧭 Automatically identify prerequisite skills
- 🛣️ Generate a learning path toward a selected skill
- 💡 Highlight prerequisite chains visually
- 🔄 Switch between multiple careers
- 🗄️ Graph database powered architecture

---

## 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │                      │
                    │  Career Explorer     │
                    │  Skill Map           │
                    │  Interactive Graph   │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │                      │
                    │ Career APIs          │
                    │ Skill APIs           │
                    │ Graph APIs           │
                    └──────────┬───────────┘
                               │
                               │ Cypher Queries
                               ▼
                    ┌──────────────────────┐
                    │   Neo4j / CognoDB    │
                    │                      │
                    │ Careers              │
                    │ Skills               │
                    │ Prerequisites        │
                    │ Relationships        │
                    └──────────────────────┘