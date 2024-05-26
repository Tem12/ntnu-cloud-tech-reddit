FROM python:3

# Set working directory
WORKDIR /app

# Copy content of the api
COPY . .

RUN echo "DB_URL=postgresql://postgres:postgres@postgres:5432/reddit\nJWT_SECRET=secret\nREDIS_HOST=redis" > .env

# Install all dependencies
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app/src/assignment2api

# Expose API port
EXPOSE 8000

CMD ["bash", "start.sh"]