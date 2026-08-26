from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from queries import (
    get_all_careers,
    get_career_skills,
    get_skill_prerequisites,
    get_learning_path,
    get_skill_graph,
    get_career_graph,
)


app = FastAPI(
    title="SkillPath API",
    description="Graph-powered career and skill dependency explorer",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LearningPathRequest(BaseModel):
    known_skills: list[str]
    target_career: str


@app.get("/")
def root():
    return {
        "message": "Welcome to SkillPath API",
        "status": "running",
    }


@app.get("/api/careers")
def careers():
    try:
        return get_all_careers()
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to the graph database.",
        )


@app.get("/api/careers/{career_name}/skills")
def career_skills(career_name: str):
    try:
        skills = get_career_skills(career_name)

        if not skills:
            raise HTTPException(
                status_code=404,
                detail=f"Career '{career_name}' not found.",
            )

        return skills

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve career skills.",
        )


@app.get("/api/skills/{skill_name}/prerequisites")
def skill_prerequisites(skill_name: str):
    try:
        paths = get_skill_prerequisites(skill_name)

        if not paths:
            raise HTTPException(
                status_code=404,
                detail=f"Skill '{skill_name}' not found or has no prerequisites.",
            )

        return {
            "skill": skill_name,
            "paths": paths,
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve prerequisite paths.",
        )


@app.post("/api/learning-path")
def learning_path(request: LearningPathRequest):
    try:
        result = get_learning_path(
            request.known_skills,
            request.target_career,
        )

        return {
            "target_career": request.target_career,
            "known_skills": request.known_skills,
            "learning_path": result,
        }

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to generate learning path.",
        )

@app.get("/api/careers/{career_name}/graph")
def career_graph(career_name: str):
    try:
        result = get_career_graph(career_name)

        if not result["nodes"]:
            raise HTTPException(
                status_code=404,
                detail=f"Career '{career_name}' not found."
            )

        return result

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve career graph."
        )
    
@app.get("/api/skills/{skill_name}/graph")
def skill_graph(skill_name: str):
    try:
        result = get_skill_graph(skill_name)

        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"Skill '{skill_name}' not found.",
            )

        return result

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve skill graph.",
        )