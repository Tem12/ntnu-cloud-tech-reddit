# TODO: doc
# TODO: tests

seed-db:
	cd api/data-seed && python3 db-seeder.py

build-api:
	cd api && pip3 install .

test-api:
	cd api && PYTHONPATH=src/assignment2api python3 -m pytest

