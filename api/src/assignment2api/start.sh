sleep 20
alembic upgrade head
python3 /app/data-seed/db-seeder.py
python3 /app/data-seed/cache-seeder.py
uvicorn main:app --host 0.0.0.0 --port 8000