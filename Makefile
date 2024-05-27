build: build-api build-cache build-frontend

doc: python3 -m md2pdf --css=doc/style.css README.md README.pdf

init-db: cd api/src/assignment2api && alembic upgrade head

seed: seed-db seed-cache

test: test-api test-cache

build-images: image-frontend image-api image-cache image-nginx

docker-compose:
	sudo docker compose up -d

init-db:
	cd api/src/assignment2api && alembic upgrade head

seed-db:
	cd api/data-seed && python3 db-seeder.py

seed-cache:
	cd api/data-seed && python3 cache-seeder.py

build-api:
	cd api && pip3 install .

build-cache:
	cd cache-service && pip3 install .

build-frontend:
	cd frontend && yarn build

test-api:
	cd api && PYTHONPATH=src/assignment2api python3 -m pytest

test-cache:
	cd cache-service && PYTHONPATH=src/assignment2cache python3 -m pytest

image-frontend:
	cd frontend && sudo docker build -t cloudtech-2-frontend:latest .

image-api:
	cd api && sudo docker build -t cloudtech-2-api:latest .

image-cache:
	cd cache-service && sudo docker build -t cloudtech-2-cache:latest .

image-nginx:
	cd nginx && sudo docker build -t cloudtech-2-nginx:latest .
