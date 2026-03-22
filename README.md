# Movies API

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![Sequelize](https://img.shields.io/badge/Sequelize-6-52B0E7?style=flat-square&logo=sequelize)
![Jest](https://img.shields.io/badge/Jest-29-C21325?style=flat-square&logo=jest)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)
![CI](https://github.com/AdrianMalmierca/Api-with-testing/actions/workflows/ci.yml/badge.svg)

A production-ready REST API built with Node.js and TypeScript, providing a movie catalog with user ratings, personal watchlists, and API key authentication — fully tested with Jest and Supertest, containerized with Docker, and integrated with GitHub Actions CI/CD.

---

## Problem Statement

Modern applications (web or mobile) often require:
- A movie catalog with aggregated metrics (average ratings).
- User-specific actions (ratings, watchlists).
- Controlled access to private resources.
- Pagination for scalable data retrieval.

This API solves those requirements by providing structured relational data models, enforcing business rules at controller and model level, implementing API key authentication, returning paginated responses with metadata, and computing aggregated ratings directly at the database level for efficiency.

---

## What This API Provides

- Paginated movie catalog with average rating per movie.
- User-based rating system (one rating per user per movie).
- Authenticated watchlist management.
- API key–based authentication.
- Request validation and structured error handling.

---

## Screenshots

### GET all movies
```bash
curl http://localhost:3000/movies
```
![GET movies](assets/GET%20movies.png)

### GET ratings by movie
```bash
curl http://localhost:3000/movies/1/ratings
```
![GET ratings](assets/Rating%20movie.png)

### Add a rating (authenticated)
```bash
curl -X POST http://localhost:3000/movies/5/ratings \
  -H "x-api-key: api_key_john_12345" \
  -H "Content-Type: application/json" \
  -d '{"rating": 8, "comment": "Great movie"}'
```
![Add rating](assets/Add%20rating.png)

### Watchlist
```bash
curl http://localhost:3000/watchlist/1 \
  -H "x-api-key: api_key_john_12345"
```
![GET watchlist](assets/GET%20watchlist.png)

### Unauthorized request
![Bad auth](assets/Bad%20auth.png)

---

## Features

### Authentication
- API key–based authentication via `x-api-key` header.
- Middleware validates key and attaches `userId` to the request.
- Public endpoints: GET movies, GET ratings.
- Protected endpoints: create/update/delete ratings, all watchlist operations.

### Movie Catalog
- Paginated list with average rating computed at database level using `AVG()`.
- Single movie retrieval with rating aggregation.
- Efficient and scalable — no post-processing in application code.

### Ratings
- One rating per user per movie (enforced at database level).
- Users can only modify or delete their own ratings.
- Paginated rating listing per movie.

### Watchlist
- Personal watchlist per user
- Add, update watched status, and remove items.
- Users can only access their own watchlist.

### Validation & Error Handling
- Joi schema validation on request bodies — returns `422 Unprocessable Entity`.
- `406 Not Acceptable` for non-JSON requests.
- Centralized 500 error handler.
- 404 fallback handler.

---

## API Endpoints

### Movies

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/movies` | No | Paginated movie list with average ratings |
| GET | `/movies/:movieId` | No | Single movie with average rating |

### Ratings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/movies/:movieId/ratings` | No | All ratings for a movie (paginated) |
| POST | `/movies/:movieId/ratings` | Required | Create a rating (one per user) |
| PATCH | `/movies/:movieId/ratings/:ratingId` | Required | Update own rating |
| DELETE | `/movies/:movieId/ratings/:ratingId` | Required | Delete own rating |

### Watchlist

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/watchlist/:userId` | Required | Get user's watchlist (paginated) |
| POST | `/watchlist/:userId/items` | Required | Add movie to watchlist |
| PATCH | `/watchlist/:userId/items/:itemId` | Required | Update watched status |
| DELETE | `/watchlist/:userId/items/:itemId` | Required | Remove from watchlist |

### Pagination

All list endpoints support:
```
?page=1&limit=10
```

Response format:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Response Codes

`200 OK` · `201 Created` · `204 No Content` · `400 Bad Request` · `401 Unauthorized` · `403 Forbidden` · `404 Not Found` · `409 Conflict` · `422 Validation Error` · `500 Internal Server Error`

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Runtime | Node.js 20 | Fast, non-blocking I/O |
| Language | TypeScript | Static typing, safer refactoring |
| Framework | Express 4 | Minimal, middleware-based HTTP framework |
| ORM | Sequelize 6 | Associations, aggregations, pagination |
| Database | SQLite | Zero-config for dev and testing |
| Validation | Joi | Declarative schema validation |
| Testing | Jest + Supertest | Unit and integration tests |
| CI/CD | GitHub Actions | Automated test and build pipeline |
| Containerization | Docker | Portable, reproducible environment |

---

## Architecture

```
Request → Route → Middleware → Controller → Model → Database
```

```
src/
├── config.ts
├── db.ts
├── models/
│   ├── user.ts
│   ├── movie.ts
│   ├── rating.ts
│   └── watchlistItem.ts
├── app.ts
├── controllers/
│   ├── movies.ts
│   ├── ratings.ts
│   └── watchlist.ts
├── middlewares/
│   ├── errorHandler.ts
│   ├── notFoundHandler.ts
│   ├── verifyToken.ts
│   ├── respondTo.ts
│   └── validatePayload.ts
├── routes/
│   ├── movies.ts
│   ├── ratings.ts
│   └── watchlist.ts
├── schemas/
│   ├── rating.ts
│   └── watchlist.ts
└── utils/
    ├── pagination.ts
    └── serializers.ts
scripts/
├── seed.ts
└── reset.ts
doc/
└── mimo_movies.json     # OpenAPI spec
index.ts
```

### Key Design Decisions

**Average rating at database level** — computed using `Sequelize.fn("AVG", Sequelize.col("ratings.rating"))` rather than in application code, keeping queries efficient and scalable.

**Layered architecture** — routes define endpoints, middleware handles cross-cutting concerns (auth, validation, error handling), controllers contain business logic, models abstract data access.

**Business rules enforced at multiple levels** — unique constraints at the database level + checks in controllers (e.g., a user cannot rate the same movie twice, cannot modify another user's rating).

---

## Database Design

### Tables
- `users` — `id`, `username`, `apiKey`
- `movies` — `id`, `title`, `genre`, `year`
- `ratings` — `id`, `userId`, `movieId`, `rating`, `comment` · unique on `(userId, movieId)`
- `watchlist_items` — `id`, `userId`, `movieId`, `watched` · unique on `(userId, movieId)`

### Relationships
- User → has many Ratings
- User → has many WatchlistItems
- Movie → has many Ratings
- Movie → has many WatchlistItems

---

## CI/CD Pipeline

Built with GitHub Actions — runs on every push and pull request to `main`.

Pipeline steps:
1. Install dependencies.
2. TypeScript compilation check.
3. Run unit and integration tests (Jest + Supertest).
4. Build Docker image.
5. Health check — verifies the API starts correctly.

---

## Running Locally

### Without Docker

```bash
# Clone the repository
git clone https://github.com/AdrianMalmierca/Api-with-testing
cd Api-with-testing

# Install dependencies
npm install

# Seed the database
npm run db:seed

# Start the development server
npm run dev
```

### With Docker

```bash
# Clone the repository
git clone https://github.com/AdrianMalmierca/Api-with-testing
cd Api-with-testing

# Build the image
docker build -t movies-api .

# Run the container (SQLite persisted in ./data)
docker run -p 3000:3000 -v "$PWD/data:/app/data" movies-api
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start server in development mode with hot-reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start the compiled server |
| `npm run db:seed` | Create and populate the database with test data |
| `npm run db:reset` | Delete the database (start from scratch) |
| `npm test` | Run all tests |

---

## Demo Users

After running `npm run db:seed` or the Docker command:

| Username | API Key |
|----------|---------|
| john_doe | `api_key_john_12345` |
| jane_smith | `api_key_jane_67890` |
| bob_wilson | `api_key_bob_11111` |

---

## API Specification

Full OpenAPI spec available in `doc/mimo_movies.json`. Import it into [Swagger Editor](https://editor.swagger.io/) to explore all endpoints interactively.

---

## What I Learned Building This

**Layered architecture in practice** — separating routes, middleware, controllers, and models made the codebase easier to test and reason about. Each layer has a single responsibility, which also made writing integration tests much cleaner.

**Testing at multiple levels** — writing both unit tests and integration tests with Supertest taught me the difference between testing business logic in isolation vs. testing the full HTTP request/response cycle. Integration tests caught several edge cases that unit tests missed.

**Database-level aggregations** — computing average ratings with `AVG()` via Sequelize rather than in application code was a key architectural decision. It keeps the logic close to the data and scales better as the dataset grows.

**CI/CD from scratch** — setting up the GitHub Actions pipeline reinforced how much value automated testing adds even on small projects. Catching regressions on every push is a habit worth building early.

**Docker for reproducibility** — containerizing the app taught me to think about environment dependencies explicitly. The SQLite volume mount pattern for persisting data across container restarts was a practical lesson in stateful containerization.

---

## License

MIT — free to use, modify, and deploy.

---

## Author

**Adrián Martín Malmierca**  
Computer Engineer & Mobile Applications Master's Student  
[GitHub](https://github.com/AdrianMalmierca) · [LinkedIn](https://www.linkedin.com/in/adri%C3%A1n-mart%C3%ADn-malmierca-4aa6b0293/)