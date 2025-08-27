# Reporting Service (FastAPI + MongoDB)

Implements Reporting & Analytics microservice (FR5.1–FR5.5).

## Run
```bash
cp .env.example .env
docker compose up --build
# or
uvicorn app.main:app --reload --port 9000
```
