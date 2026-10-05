# Document Manager

React + TypeScript · Spring Boot · Spring Data JPA · PostgreSQL · Docker · JUnit

Database: `document_manager` · user `postgres` · password `jonjones`

## Option A: everything in Docker
    docker compose up --build
- UI: http://localhost:3000
- API: http://localhost:8080/api/documents
- Postgres from your machine: localhost:5433 (inside Docker it is db:5432)

## Option B: your own local PostgreSQL (port 5432)
1. Create the database once:  `psql -U postgres -f init-local-db.sql`
2. Backend (needs JDK 21 + Maven):  `cd backend && mvn spring-boot:run`
3. Frontend (needs Node 18+):  `cd frontend && npm install && npm run dev` → http://localhost:5173

The `documents` table is created automatically on first start.

## Tests (no database needed)
    cd backend && mvn test

## API
| Method | Path | Purpose |
|---|---|---|
| POST | /api/documents | Upload (multipart field `file`, max 10 MB) |
| GET | /api/documents | List metadata |
| GET | /api/documents/{id} | One document's metadata |
| GET | /api/documents/{id}/content[?download=true] | View or download |
| DELETE | /api/documents/{id} | Delete |

## Troubleshooting
- `password authentication failed`: your local Postgres uses a different password for `postgres`. Change it with `ALTER USER postgres PASSWORD 'jonjones';` or edit `backend/src/main/resources/application.yml`.
- `database "document_manager" does not exist`: run step 1 of Option B.
- `port 5432 already in use` with Docker: the compose file already maps Postgres to 5433, so check ports 3000 and 8080 instead.
