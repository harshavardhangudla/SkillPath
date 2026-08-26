from database import driver


def get_all_careers():
    """
    Return all available career paths.
    """
    query = """
    MATCH (c:Career)
    RETURN c.name AS name,
           c.description AS description,
           c.category AS category
    ORDER BY c.name
    """

    with driver.session() as session:
        result = session.run(query)
        return [record.data() for record in result]


def get_career_skills(career_name):
    """
    Return all skills directly required for a career.
    """
    query = """
    MATCH (s:Skill)-[:REQUIRED_FOR]->(c:Career {name: $career_name})
    RETURN s.name AS name,
           s.category AS category,
           s.difficulty AS difficulty,
           s.description AS description
    ORDER BY s.name
    """

    with driver.session() as session:
        result = session.run(query, career_name=career_name)
        return [record.data() for record in result]


def get_skill_prerequisites(skill_name):
    """
    Find prerequisite paths leading to a skill.

    This is a multi-hop graph traversal.
    """
    query = """
    MATCH path =
        (start:Skill)-[:PREREQUISITE_FOR*1..6]->
        (target:Skill {name: $skill_name})
    RETURN
        [node IN nodes(path) | node.name] AS path,
        length(path) AS hops
    ORDER BY hops
    """

    with driver.session() as session:
        result = session.run(query, skill_name=skill_name)
        return [record.data() for record in result]


def get_learning_path(known_skills, target_career):
    """
    Find skills required for a career that are not already known.

    The graph traversal follows prerequisite relationships
    and connects them to the target career.
    """
    query = """
    MATCH (target:Career {name: $target_career})

    MATCH path =
        (start:Skill)-[:PREREQUISITE_FOR*0..6]->
        (required:Skill)-[:REQUIRED_FOR]->(target)

    WHERE NOT start.name IN $known_skills

    WITH DISTINCT
        required,
        [node IN nodes(path) | node.name] AS path

    RETURN
        required.name AS skill,
        required.category AS category,
        required.difficulty AS difficulty,
        collect(path) AS paths

    ORDER BY required.name
    """

    with driver.session() as session:
        result = session.run(
            query,
            known_skills=known_skills,
            target_career=target_career,
        )
        return [record.data() for record in result]


def get_skill_graph(skill_name):
    """
    Return the local graph around a skill.

    Useful later for the graph visualization.
    """
    query = """
    MATCH (s:Skill {name: $skill_name})

    OPTIONAL MATCH (s)-[r1:PREREQUISITE_FOR]->(next:Skill)
    OPTIONAL MATCH (previous:Skill)-[r2:PREREQUISITE_FOR]->(s)

    RETURN
        s.name AS skill,
        collect(DISTINCT {
            name: next.name,
            relationship: type(r1)
        }) AS prerequisites_for,
        collect(DISTINCT {
            name: previous.name,
            relationship: type(r2)
        }) AS prerequisites
    """

    with driver.session() as session:
        result = session.run(query, skill_name=skill_name)
        record = result.single()

        return record.data() if record else None

def get_career_graph(career_name):
    """
    Build a graph of a career and its skill prerequisites.
    """

    query = """
    MATCH (career:Career {name: $career_name})
    MATCH (required:Skill)-[:REQUIRED_FOR]->(career)

    OPTIONAL MATCH path =
        (start:Skill)-[:PREREQUISITE_FOR*0..6]->(required)

    WITH collect(DISTINCT required) +
         collect(DISTINCT start) AS raw_nodes

    UNWIND raw_nodes AS node

    WITH collect(DISTINCT node) AS nodes

    UNWIND nodes AS source

    OPTIONAL MATCH (source)-[r:PREREQUISITE_FOR]->(target:Skill)

    WITH nodes,
         collect(
             DISTINCT CASE
                 WHEN target IN nodes
                 THEN {
                     source: source.name,
                     target: target.name
                 }
             END
         ) AS raw_edges

    RETURN
        [node IN nodes | {
            id: node.name,
            name: node.name,
            category: node.category,
            difficulty: node.difficulty
        }] AS nodes,

        [edge IN raw_edges
         WHERE edge IS NOT NULL] AS edges
    """

    with driver.session() as session:
        result = session.run(
            query,
            career_name=career_name
        )

        record = result.single()

        if not record:
            return {
                "nodes": [],
                "edges": []
            }

        return record.data()

if __name__ == "__main__":
    try:
        print("\n=== CAREERS ===")
        careers = get_all_careers()

        for career in careers:
            print(f"- {career['name']}")

        print("\n=== AI ENGINEER SKILLS ===")
        skills = get_career_skills("AI Engineer")

        for skill in skills:
            print(
                f"- {skill['name']} "
                f"({skill['difficulty']})"
            )

        print("\n=== PREREQUISITE PATHS TO TRANSFORMERS ===")
        paths = get_skill_prerequisites("Transformers")

        for path in paths[:10]:
            print(
                f"{' -> '.join(path['path'])} "
                f"({path['hops']} hops)"
            )

        print("\n=== LEARNING PATH ===")

        known = [
            "Python",
            "Git",
            "NumPy",
        ]

        learning_path = get_learning_path(
            known,
            "AI Engineer"
        )

        for item in learning_path:
            print(
                f"- {item['skill']} "
                f"({item['difficulty']})"
            )

    finally:
        driver.close()