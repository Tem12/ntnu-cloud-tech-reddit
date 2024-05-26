build: build-api build-cache build-frontend

seed: seed-db seed-cache

test: test-api test-cache

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

