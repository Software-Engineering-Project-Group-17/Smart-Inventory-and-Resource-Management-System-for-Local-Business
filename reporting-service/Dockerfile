FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY reporting-service/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY reporting-service/ .

EXPOSE 5000

# Example: FastAPI with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
