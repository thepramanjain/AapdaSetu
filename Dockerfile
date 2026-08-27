# Stage 1: Build the React Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# Copy frontend packages and install
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source files
COPY frontend/ ./

# Set the API URL to be relative so it routes to the same container
ENV VITE_BACKEND_URL=""

# Build production React bundles
RUN npm run build


# Stage 2: Serve the full-stack App from the Python Backend
FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies and install
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Copy built frontend assets from the node builder stage
COPY --from=frontend-builder /frontend/dist /app/frontend/dist

# Build the initial vector database index (runs on build time)
RUN python scripts/preprocess.py

# Run the application (binds dynamically to Render's PORT or defaults to 7860)
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]
