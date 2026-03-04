# Movies API
## This API provides:
1. A paginated movie catalog
2. Average rating calculation per movie
3. User-based rating system (one rating per user per movie)
4. Authenticated watchlist management
5. API key–based authentication
6. Request validation and structured error handling

It simulates a production-ready backend for a movie platform where users can rate movies and maintain personal watchlists.

## Problem it solves
Modern applications (web or mobile) often require:
- A movie catalog with aggregated metrics (e.g., average ratings)
- User-specific actions (ratings, watchlists)
- Controlled access to private resources
- Pagination for scalable data retrieval

This project solves those requirements by:
- Providing structured relational data models
- Enforcing business rules at controller and model level
- Implementing API key authentication
- Returning paginated responses with metadata
- Computing aggregated ratings directly at database level

## Architecture and design
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
  ├── mimo_movies.json  
index.ts              
```

### Routing layer
Defines HTTP endpoints using Express routers:
- `/movies`
- `/movies/:movieId/ratings`
- `/watchlist/:userId`

### Controllers
Contain application logic:
- Validate route parameters
- Apply business rules
- Handle authorization checks
- Format JSON responses
- Set correct HTTP status codes

For example:
- A user cannot rate the same movie twice
- A user can only modify their own ratings
- A user can only access their own watchlist

### Models
Implemented using **Sequelize ORM**.

Responsibilities:
1. Query abstraction
2. Pagination handling
3. Aggregation (AVG rating calculation)
4. Association management

Notable feature:

#### Average rating calculation
Movies are retrieved with:
```ts
Sequelize.fn("AVG", Sequelize.col("ratings.rating"))
```

This ensures average ratings are computed at database level (efficient and scalable).

### Middleware layer

####  `verifyToken`
- Reads `x-api-key` header
- Validates user existence
- Attaches `userId` to request

#### `validatePayload`
- Uses Joi for request body validation
- Returns `422 Unprocessable Entity` on invalid input

#### `respondTo`
- Enforces `application/json` responses
- Returns `406 Not Acceptable` otherwise

#### Error handling
- Centralized 500 handler
- 404 fallback handler

### Authentication strategy
The API uses **API Key authentication**:
- Users have a unique `apiKey`
- The client must send:
```
x-api-key: YOUR_API_KEY
```

Protected endpoints:
- Create / Update / Delete ratings
- All watchlist endpoints

Public endpoints:
- GET movies
- GET ratings

## Technologies Used

### TypeScript
- Static typing
- Better maintainability
- Safer refactoring

### Express
- Minimal and flexible HTTP framework
- Middleware-based architecture

### Sequelize
- ORM abstraction
- Associations
- Aggregations
- Pagination support

### SQLite
- Lightweight file-based database
- Ideal for local development and testing

### Joi
- Declarative schema validation
- Clean error reporting

## Database Design

### Tables
- `users`
- `movies`
- `ratings`
- `watchlist_items`

### Relationships
- User → has many Ratings
- User → has many WatchlistItems
- Movie → has many Ratings
- Movie → has many WatchlistItems

### Constraints
- Unique rating per user per movie
- Unique watchlist item per user per movie

## Pagination
Supported via query parameters:
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

## Database seeding
The project includes scripts to:
- Reset database
- Populate test data

### Reset database
- Deletes SQLite file
- Recreates schema

If you want to run alone:
```bash
npm run db:reset
```

### Seed database
Creates:
- 3 users
- 25 movies
- 10 ratings
- 9 watchlist items

It also prints test API keys in the console.

If you want to run alone:
```bash
npm run db:seed
```

## API endpoints

### Movies
| Method | Endpoint           | Authentication | Description                                       |
| ------ | ------------------ | -------------- | ------------------------------------------------- |
| GET    | `/movies`          |   No           | Paginated list of movies including average rating |
| GET    | `/movies/:movieId` |   No           | Retrieve a single movie with its average rating   |

### Ratings
| Method | Endpoint                             | Authentication     | Description                                      |
| ------ | ------------------------------------ | ------------------ | ------------------------------------------------ |
| GET    | `/movies/:movieId/ratings`           |   No               | Get all ratings for a specific movie (paginated) |
| POST   | `/movies/:movieId/ratings`           |   API Key required | Create a rating for a movie (one per user)       |
| PATCH  | `/movies/:movieId/ratings/:ratingId` |   API Key required | Update a user’s own rating                       |
| DELETE | `/movies/:movieId/ratings/:ratingId` |   API Key required | Delete a user’s own rating                       |


### Watchlist
| Method | Endpoint                           | Authentication     | Description                               |
| ------ | ---------------------------------- | ------------------ | ----------------------------------------- |
| GET    | `/watchlist/:userId`               |   API Key required | Get paginated watchlist for a user        |
| POST   | `/watchlist/:userId/items`         |   API Key required | Add a movie to the user’s watchlist       |
| PATCH  | `/watchlist/:userId/items/:itemId` |   API Key required | Update watched status of a watchlist item |
| DELETE | `/watchlist/:userId/items/:itemId` |   API Key required | Remove a movie from the watchlist         |

## Architecture

The application follows a layered architecture:

Request → Route → Middleware → Controller → Model → Database

- Routes: Define the endpoints.

- Middleware: Authentication, validation, and error handling.

- Controllers: Contain the business logic.

- Models: Access data using Sequelize.

## Run without docker

```bash
#Instal dependencies
npm install

#Populate the database with test data
npm run db:seed
```

## Run with docker
Build a Docker image named "movies-api" from the Dockerfile in the current directory:
```bash
 docker build -t movies-api .
```

Run the "movies-api" container, mapping port 3000 and persisting the SQLite database in the local `data` folder:
```bash
docker run -p 3000:3000 -v "$PWD/data:/app/data" movies-api
```

## Scripts Disponibles

| Script             | Descripción                                          |
| ------------------ | ---------------------------------------------------- |
| `npm run dev`      | Inicia el servidor en modo desarrollo con hot-reload |
| `npm run build`    | Compila TypeScript a JavaScript                      |
| `npm start`        | Inicia el servidor compilado                         |
| `npm run db:seed`  | Crea y pobla la base de datos con datos de prueba    |
| `npm run db:reset` | Elimina la base de datos (para empezar de cero)      |
| `npm test`         | Ejecuta los tests                                    |

## Users
After run `npm run db:seed` or `MIMO Movies % docker run -p 3000:3000 -v "$PWD/data:/app/data" movies-api`, you'll have:

| User       | API Key              |
| ---------- | -------------------- |
| john_doe   | `api_key_john_12345` |
| jane_smith | `api_key_jane_67890` |
| bob_wilson | `api_key_bob_11111`  |

## Especificación de la API
Check the file `doc/mimo_movies.json` to see the full OpenAPI. You can see it in: [Swagger Editor](https://editor.swagger.io/).

## Response codes
- 200 OK
- 201 Created
- 204 No Content
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 422 Validation Error
- 500 Internal Server Error

## Testing
To test you can use;
- [Postman](https://www.postman.com/)
- curl desde terminal

## Example:
```bash
#Movies list
curl http://localhost:3000/movies

#GET movie by id
curl http://localhost:3000/movies/1

#Create rating (with api key)
curl -X POST http://localhost:3000/movies/1/ratings \
  -H "Content-Type: application/json" \
  -H "x-api-key: api_key_john_12345" \
  -d '{"rating": 4.5, "comment": "Excelente película"}'

#GET watchlist (with api key)
curl http://localhost:3000/watchlist/1 \
  -H "x-api-key: api_key_john_12345"
```

## What did I learn?
This project has helped me learn how to create an API from scratch, using tests to check all the endpoints and implementing docker.

## Author
Adrián Martín Malmierca 

Computer Engineer & Mobile Applications Master's Student
