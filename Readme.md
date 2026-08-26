Persona-Driven Document Intelligence
A robust, generic, and efficient pipeline for extracting and ranking the most relevant sections from multiple PDFs—tailored to a given persona’s needs and job-to-be-done, as required for the Adobe India Hackathon.

Overview
This system ingests a collection of 3-10 PDFs, a persona description, and a specific job-to-be-done. It analyzes and ranks document sections according to their relevance to the persona’s requirements, outputting detailed structured results for downstream consumption.

Inputs: 3-10 PDFs, persona, job-to-be-done/task.

Outputs: JSON with top sections, refined text, and analysis conforming to the challenge specification.

Features
Highly Generic: Adapts to a wide variety of documents (academic, financial, educational, business, etc.) and user personas (students, researchers, analysts, entrepreneurs, etc.).

Persona-Driven: Adjusts ranking and analysis according to supplied persona and job context.

Efficient: Runs on CPU only, with model size <1GB and execution <60 seconds for 3-5 docs.

Self-contained: No internet is required at runtime.

Project Structure
text
persona-document-intelligence/
├── src/
│   ├── pdf_processor.py     # PDF text extraction
│   ├── nlp_engine.py        # Text/embedding engine
│   ├── persona_matcher.py   # Persona-specific ranking
│   ├── output_formatter.py  # Output JSON logic
│   └── main.py              # Orchestrator
├── models/                  # Downloaded models
├── input/                   # Place PDFs here
├── output/                  # JSON outputs
├── tests/                   # Unit/integration tests
├── requirements.txt
├── Dockerfile
├── approach_explanation.md
├── README.md                # [this file]
└── run.py                   # Entry-point script
Installation
Requirements:

Python 3.8+

Docker (optional/recommended for deployment)

Clone and Install Dependencies:

bash
git clone <repo-url>
cd persona-document-intelligence
pip install -r requirements.txt
python -m spacy download en_core_web_sm
Pretrained Models
No downloads at runtime required. Models are preloaded during Docker build/local setup:

en_core_web_sm (spaCy for NER, preprocessing)

all-MiniLM-L6-v2 (Sentence Transformers - efficient semantic similarity)

Usage
1. Prepare The Inputs
Place your PDF files in the /input folder (or specify paths).

Define the persona and job-to-be-done in run.py or via the interface.

2. Run Locally
bash
python run.py
3. Run with Docker
bash
docker build -t persona-doc-intelligence .
docker run -v $(pwd)/input:/app/input \
           -v $(pwd)/output:/app/output \
           persona-doc-intelligence
4. Configuration
Edit run.py to specify:

List of PDF paths

Persona description

Job-to-be-done sentence

Output file path

Output
A single JSON file per run, matching the challenge schema:

metadata: Documents, persona, job, timestamp.

extracted_sections: Ranked section list (document, page, section title, rank).

sub_section_analysis: Top 10 detailed analyzed/extractive summaries.

See included sample and refer to approach_explanation.md for schema.

Testing
Run all tests with:

bash
python -m unittest discover tests/
This invokes integration/unit tests to ensure consistent outputs and formats.

Performance
Model size: ≤200MB

Processing time: <60 seconds for 3-5 typical documents (CPU)

Robust error handling: Graceful fallback to TF-IDF if deep embeddings fail.

Container-optimized: Fast cold start via Docker.

Troubleshooting
PDF not parsing correctly? Try both pdfplumber and PyPDF2 backends.

Timeouts? Check logs for bottlenecks; reduce document count or page length.

Output validation failed? Ensure inputs and requirements are followed and test input files are valid PDFs.

Approach
Please see approach_explanation.md for a full technical methodology and decision rationale.

Authors & Attribution
Built for Adobe India Hackathon 2025

Contact:

Team HAS
