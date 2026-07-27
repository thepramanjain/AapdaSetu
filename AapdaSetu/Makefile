# AapdaSetu - Development Makefile
# Shortcuts for common tasks in development cycle

.PHONY: help setup run test docker-up docker-down clean

help:
	@echo "AapdaSetu Short-commands:"
	@echo "  setup        - Create virtual environment and install dependencies"
	@echo "  run          - Run the FastAPI application locally using uvicorn"
	@echo "  test         - Run pytest suite (unit and integration tests)"
	@echo "  docker-up    - Build and launch all containers (FastAPI & Postgres) in background"
	@echo "  docker-down  - Stop and clean docker-compose services"
	@echo "  clean        - Purge python cached binary files and temporary folders"

setup:
	python -m venv .venv
	.venv/Scripts/pip install --upgrade pip
	.venv/Scripts/pip install -r requirements.txt

run:
	.venv/Scripts/python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

test:
	.venv/Scripts/pytest

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down -v

clean:
	rm -rf .venv
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -rf .coverage
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
