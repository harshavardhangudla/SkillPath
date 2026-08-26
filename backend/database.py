import os
from pathlib import Path

from dotenv import load_dotenv
from neo4j import GraphDatabase


# Load .env from the project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


COGNODB_URI = os.getenv("COGNODB_URI")
COGNODB_USERNAME = os.getenv("COGNODB_USERNAME")
COGNODB_PASSWORD = os.getenv("COGNODB_PASSWORD")


if not all([COGNODB_URI, COGNODB_USERNAME, COGNODB_PASSWORD]):
    raise RuntimeError("CognoDB environment variables are missing.")


driver = GraphDatabase.driver(
    COGNODB_URI,
    auth=(COGNODB_USERNAME, COGNODB_PASSWORD)
)


def verify_connection():
    driver.verify_connectivity()
    print("Successfully connected to CognoDB!")


def close_driver():
    driver.close()