FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Allow the port to be specified by the environment (Render sets $PORT)
ENV PORT=8000
EXPOSE ${PORT}

# Use shell form so environment variable expansion works for the port
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"
