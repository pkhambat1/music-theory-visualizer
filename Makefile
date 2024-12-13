.DEFAULT_GOAL := update

APP_NAME=flask-app
PORT=5001

freeze:
	pip freeze > requirements.txt

build:
	docker build -t $(APP_NAME) .

run-docker:
	docker run --rm -e PYTHONUNBUFFERED=1 -e FLASK_ENV=production -p $(PORT):5001 $(APP_NAME)

run-local:
	FLASK_ENV=development flask --app app.py --debug run --port=$(PORT)

# Default target
run: run-local

update: freeze build run
