from database import driver


def seed_database():
    with driver.session() as session:
        # ---------------------------------------------------------
        # 1. Create constraints
        # ---------------------------------------------------------
        constraints = [
            """
            CREATE CONSTRAINT career_name_unique IF NOT EXISTS
            FOR (c:Career) REQUIRE c.name IS UNIQUE
            """,
            """
            CREATE CONSTRAINT skill_name_unique IF NOT EXISTS
            FOR (s:Skill) REQUIRE s.name IS UNIQUE
            """,
            """
            CREATE CONSTRAINT topic_name_unique IF NOT EXISTS
            FOR (t:Topic) REQUIRE t.name IS UNIQUE
            """,
        ]

        for query in constraints:
            session.run(query)

        # ---------------------------------------------------------
        # 2. Create Topics
        # ---------------------------------------------------------
        topics = [
            {
                "name": "Programming",
                "description": "Core programming languages and development practices.",
            },
            {
                "name": "Mathematics",
                "description": "Mathematical foundations used in computing and AI.",
            },
            {
                "name": "Data Science",
                "description": "Data analysis, statistics and data processing.",
            },
            {
                "name": "Machine Learning",
                "description": "Algorithms and techniques for learning from data.",
            },
            {
                "name": "Deep Learning",
                "description": "Neural networks and modern deep learning techniques.",
            },
            {
                "name": "Cloud & DevOps",
                "description": "Deployment, infrastructure and software operations.",
            },
            {
                "name": "Web Development",
                "description": "Frontend and backend web application development.",
            },
        ]

        session.run(
            """
            UNWIND $topics AS topic
            MERGE (t:Topic {name: topic.name})
            SET t.description = topic.description
            """,
            topics=topics,
        )

        # ---------------------------------------------------------
        # 3. Create Skills
        # ---------------------------------------------------------
        skills = [
            {
                "name": "Python",
                "category": "Programming",
                "difficulty": "Beginner",
                "description": "General-purpose programming language widely used in AI and backend development.",
            },
            {
                "name": "JavaScript",
                "category": "Programming",
                "difficulty": "Beginner",
                "description": "Programming language commonly used for interactive web applications.",
            },
            {
                "name": "Git",
                "category": "Programming",
                "difficulty": "Beginner",
                "description": "Version control system used to manage source code.",
            },
            {
                "name": "SQL",
                "category": "Data",
                "difficulty": "Beginner",
                "description": "Language for querying and managing relational data.",
            },
            {
                "name": "NumPy",
                "category": "Data Science",
                "difficulty": "Intermediate",
                "description": "Python library for numerical computing and array operations.",
            },
            {
                "name": "Pandas",
                "category": "Data Science",
                "difficulty": "Intermediate",
                "description": "Python library for data manipulation and analysis.",
            },
            {
                "name": "Statistics",
                "category": "Mathematics",
                "difficulty": "Intermediate",
                "description": "Statistical concepts used to understand and analyze data.",
            },
            {
                "name": "Linear Algebra",
                "category": "Mathematics",
                "difficulty": "Intermediate",
                "description": "Mathematical foundation for vectors, matrices and many ML algorithms.",
            },
            {
                "name": "Machine Learning",
                "category": "Machine Learning",
                "difficulty": "Intermediate",
                "description": "Methods for building systems that learn patterns from data.",
            },
            {
                "name": "Scikit-learn",
                "category": "Machine Learning",
                "difficulty": "Intermediate",
                "description": "Python machine learning library for classical ML algorithms.",
            },
            {
                "name": "PyTorch",
                "category": "Deep Learning",
                "difficulty": "Advanced",
                "description": "Deep learning framework used to build and train neural networks.",
            },
            {
                "name": "Neural Networks",
                "category": "Deep Learning",
                "difficulty": "Advanced",
                "description": "Computational models forming the foundation of modern deep learning.",
            },
            {
                "name": "Deep Learning",
                "category": "Deep Learning",
                "difficulty": "Advanced",
                "description": "Field focused on learning representations using multi-layer neural networks.",
            },
            {
                "name": "Transformers",
                "category": "Deep Learning",
                "difficulty": "Advanced",
                "description": "Neural network architecture widely used in modern NLP and generative AI.",
            },
            {
                "name": "Natural Language Processing",
                "category": "AI",
                "difficulty": "Advanced",
                "description": "Techniques for processing and understanding human language.",
            },
            {
                "name": "Docker",
                "category": "Cloud & DevOps",
                "difficulty": "Intermediate",
                "description": "Containerization platform used to package and deploy applications.",
            },
            {
                "name": "CI/CD",
                "category": "Cloud & DevOps",
                "difficulty": "Intermediate",
                "description": "Practices for automatically building, testing and deploying software.",
            },
            {
                "name": "REST APIs",
                "category": "Web Development",
                "difficulty": "Intermediate",
                "description": "HTTP-based interface pattern for communication between applications.",
            },
            {
                "name": "React",
                "category": "Web Development",
                "difficulty": "Intermediate",
                "description": "JavaScript library for building component-based user interfaces.",
            },
            {
                "name": "FastAPI",
                "category": "Web Development",
                "difficulty": "Intermediate",
                "description": "Python framework for building high-performance APIs.",
            },
        ]

        session.run(
            """
            UNWIND $skills AS skill
            MERGE (s:Skill {name: skill.name})
            SET
                s.category = skill.category,
                s.difficulty = skill.difficulty,
                s.description = skill.description
            """,
            skills=skills,
        )

        # ---------------------------------------------------------
        # 4. Connect Skills to Topics
        # ---------------------------------------------------------
        skill_topics = [
            ("Python", "Programming"),
            ("JavaScript", "Programming"),
            ("Git", "Programming"),
            ("SQL", "Data Science"),
            ("NumPy", "Data Science"),
            ("Pandas", "Data Science"),
            ("Statistics", "Mathematics"),
            ("Linear Algebra", "Mathematics"),
            ("Machine Learning", "Machine Learning"),
            ("Scikit-learn", "Machine Learning"),
            ("PyTorch", "Deep Learning"),
            ("Neural Networks", "Deep Learning"),
            ("Deep Learning", "Deep Learning"),
            ("Transformers", "Deep Learning"),
            ("Natural Language Processing", "Deep Learning"),
            ("Docker", "Cloud & DevOps"),
            ("CI/CD", "Cloud & DevOps"),
            ("REST APIs", "Web Development"),
            ("React", "Web Development"),
            ("FastAPI", "Web Development"),
        ]

        session.run(
            """
            UNWIND $connections AS connection
            MATCH (s:Skill {name: connection[0]})
            MATCH (t:Topic {name: connection[1]})
            MERGE (s)-[:BELONGS_TO]->(t)
            """,
            connections=skill_topics,
        )

        # ---------------------------------------------------------
        # 5. Create prerequisite relationships
        # ---------------------------------------------------------
        prerequisites = [
            ("Python", "NumPy"),
            ("Python", "Pandas"),
            ("Python", "FastAPI"),
            ("Python", "Scikit-learn"),
            ("Python", "PyTorch"),
            ("Python", "Machine Learning"),

            ("Statistics", "Machine Learning"),
            ("Linear Algebra", "Machine Learning"),

            ("NumPy", "Machine Learning"),
            ("Pandas", "Machine Learning"),

            ("Machine Learning", "Scikit-learn"),
            ("Machine Learning", "Neural Networks"),

            ("Neural Networks", "Deep Learning"),
            ("PyTorch", "Deep Learning"),

            ("Deep Learning", "Transformers"),
            ("Natural Language Processing", "Transformers"),

            ("JavaScript", "React"),
            ("REST APIs", "React"),

            ("Git", "CI/CD"),
            ("Docker", "CI/CD"),
        ]

        session.run(
            """
            UNWIND $relationships AS relationship
            MATCH (from:Skill {name: relationship[0]})
            MATCH (to:Skill {name: relationship[1]})
            MERGE (from)-[:PREREQUISITE_FOR]->(to)
            """,
            relationships=prerequisites,
        )

        # ---------------------------------------------------------
        # 6. Create Careers
        # ---------------------------------------------------------
        careers = [
            {
                "name": "AI Engineer",
                "description": "Build and deploy AI and machine learning systems.",
                "category": "Artificial Intelligence",
            },
            {
                "name": "Machine Learning Engineer",
                "description": "Design, train and deploy machine learning models.",
                "category": "Artificial Intelligence",
            },
            {
                "name": "Data Scientist",
                "description": "Extract insights and build predictive models from data.",
                "category": "Data Science",
            },
            {
                "name": "Full-Stack Developer",
                "description": "Build complete web applications across frontend and backend.",
                "category": "Software Engineering",
            },
            {
                "name": "ML Engineer",
                "description": "Develop production-ready machine learning pipelines and systems.",
                "category": "Artificial Intelligence",
            },
        ]

        session.run(
            """
            UNWIND $careers AS career
            MERGE (c:Career {name: career.name})
            SET
                c.description = career.description,
                c.category = career.category
            """,
            careers=careers,
        )

        # ---------------------------------------------------------
        # 7. Connect Skills to Careers
        # ---------------------------------------------------------
        career_skills = {
            "AI Engineer": [
                "Python",
                "Git",
                "NumPy",
                "Statistics",
                "Linear Algebra",
                "Machine Learning",
                "PyTorch",
                "Deep Learning",
                "Transformers",
                "Docker",
                "REST APIs",
            ],
            "Machine Learning Engineer": [
                "Python",
                "Git",
                "NumPy",
                "Pandas",
                "Statistics",
                "Linear Algebra",
                "Machine Learning",
                "Scikit-learn",
                "PyTorch",
                "Docker",
                "CI/CD",
            ],
            "Data Scientist": [
                "Python",
                "SQL",
                "NumPy",
                "Pandas",
                "Statistics",
                "Linear Algebra",
                "Machine Learning",
                "Scikit-learn",
            ],
            "Full-Stack Developer": [
                "JavaScript",
                "React",
                "Python",
                "FastAPI",
                "REST APIs",
                "Git",
                "Docker",
                "CI/CD",
            ],
            "ML Engineer": [
                "Python",
                "Git",
                "NumPy",
                "Pandas",
                "Machine Learning",
                "PyTorch",
                "Deep Learning",
                "Docker",
                "CI/CD",
                "REST APIs",
            ],
        }

        session.run(
            """
            UNWIND $career_skills AS item
            MATCH (c:Career {name: item.career})
            MATCH (s:Skill {name: item.skill})
            MERGE (s)-[:REQUIRED_FOR]->(c)
            """,
            career_skills=[
                {"career": career, "skill": skill}
                for career, skills_list in career_skills.items()
                for skill in skills_list
            ],
        )

        print("✅ SkillPath database seeded successfully!")
        print("Created:")
        print("  • 7 topics")
        print("  • 20 skills")
        print("  • 5 careers")
        print("  • prerequisite relationships")
        print("  • career-skill relationships")


if __name__ == "__main__":
    try:
        seed_database()
    finally:
        driver.close()