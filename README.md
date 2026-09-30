# Business Cards API

A REST API backend for a Business Cards application, built as the final project of a Node.js course.
Users can register and log in, business users can publish business cards, any registered user can like cards, and admins can manage users and cards.

## Technologies

- Node.js + TypeScript (ES Modules, `NodeNext`)
- Express 5
- MongoDB + Mongoose
- Joi – request validation
- bcryptjs – password hashing
- jose – JWT creation and verification
- Pino + pino-pretty – logging
- cors, dotenv

## Installation

Requirements: Node.js 20+ and a local MongoDB server running on `127.0.0.1:27017` (for development).

```bash
npm install
cp .env.example .env    # then fill in the values
npm run dev
```

The API runs on **http://localhost:3000**.

## npm Scripts

| Command         | Description                                      |
| --------------- | ------------------------------------------------ |
| `npm run dev`   | Start the development server with auto-reload    |
| `npm run build` | Compile TypeScript to `dist/`                    |
| `npm start`     | Run the compiled server from `dist/`             |

## Environment Variables

| Variable           | Description                                                        |
| ------------------ | ------------------------------------------------------------------ |
| `NODE_ENV`         | `development` (local MongoDB) or `production` (MongoDB Atlas)      |
| `PORT`             | Server port (default `3000`)                                       |
| `MONGODB_URI_DEV`  | Local MongoDB URI, e.g. `mongodb://127.0.0.1:27017/businesscard`   |
| `MONGODB_URI_PROD` | MongoDB Atlas connection string (required only in production)      |
| `JWT_SECRET`       | Secret used to sign tokens – use a long random string              |
| `JWT_EXPIRES_IN`   | Token lifetime, e.g. `1d`, `12h`                                   |
| `CORS_ORIGINS`     | Comma-separated list of allowed browser origins                    |

`.env` is ignored by Git. Never commit real credentials.

## Environments

- **Development** (`NODE_ENV=development`): connects to `MONGODB_URI_DEV` (local MongoDB) and prints colored, readable logs with pino-pretty.
- **Production** (`NODE_ENV=production`): connects to `MONGODB_URI_PROD` and prints JSON logs.

To run against MongoDB Atlas:

1. Create a cluster and a database user in MongoDB Atlas and allow your IP under *Network Access*.
2. Copy the connection string into `MONGODB_URI_PROD`, e.g.
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/businesscard`
3. Set `NODE_ENV=production`, then run `npm run build` and `npm start`.

## Authentication

`POST /users/login` returns a JWT signed with **jose** (HS256):

```json
{ "token": "eyJhbGciOiJIUzI1NiJ9..." }
```

The token payload contains `_id`, `isBusiness` and `isAdmin`.
Send the token on protected requests using one of these headers:

```
Authorization: Bearer <token>
x-auth-token: <token>
```

Missing or invalid tokens return **401**; valid tokens without permission return **403**.

## Endpoints

### Users

| Method | URL            | Authorization             | Action                        |
| ------ | -------------- | ------------------------- | ----------------------------- |
| POST   | `/users`       | Everyone                  | Register a user               |
| POST   | `/users/login` | Everyone                  | Login, returns a token        |
| GET    | `/users`       | Admin                     | Get all users                 |
| GET    | `/users/:id`   | The user himself or admin | Get a user                    |
| PUT    | `/users/:id`   | The user himself          | Edit a user                   |
| PATCH  | `/users/:id`   | The user himself          | Toggle `isBusiness` status    |
| DELETE | `/users/:id`   | The user himself or admin | Delete a user (and his cards) |

### Cards

| Method | URL                      | Authorization           | Action                   |
| ------ | ------------------------ | ----------------------- | ------------------------ |
| GET    | `/cards`                 | Everyone                | Get all cards            |
| GET    | `/cards/my-cards`        | Registered user         | Get the user's cards     |
| GET    | `/cards/:id`             | Everyone                | Get a card               |
| POST   | `/cards`                 | Business user           | Create a card            |
| PUT    | `/cards/:id`             | The card's creator      | Edit a card              |
| PATCH  | `/cards/:id`             | Registered user         | Like / unlike a card     |
| DELETE | `/cards/:id`             | The card's creator or admin | Delete a card        |
| PATCH  | `/cards/biz-number/:id`  | Admin (bonus)           | Change a card's bizNumber |

### Status codes

| Code | Meaning                                         |
| ---- | ----------------------------------------------- |
| 200  | Success                                         |
| 201  | Created                                         |
| 400  | Validation error / invalid id / invalid JSON    |
| 401  | Missing or invalid token, wrong login details   |
| 403  | No permission, CORS origin not allowed, login blocked |
| 404  | Resource or route not found                     |
| 409  | Duplicate email or bizNumber                    |
| 500  | Unexpected server error                         |

## Security Rules

- Passwords are hashed with bcryptjs and never returned in responses.
- Registration and user updates cannot set `isAdmin` (the field is rejected by Joi).
- A card's `user_id` is always taken from the token, never from the request body. `bizNumber` is generated by the server.
- All request bodies are validated with Joi before reaching the database.

## Initial Data

When the server starts it creates the following data if it is missing (it never creates duplicates):

| Role     | Email               | Password    |
| -------- | ------------------- | ----------- |
| Regular  | `regular@test.com`  | `Aa123456!` |
| Business | `business@test.com` | `Aa123456!` |
| Admin    | `admin@test.com`    | `Aa123456!` |

It also creates 3 cards owned by the business user (only if the cards collection is empty).
These are development test credentials – change them if you seed a production database.

## Logging

- Pino is the application logger (pretty output in development, JSON in production).
- Every request that ends with status **400 or higher** is logged with the date, method, URL, status code and error message.
- **Bonus:** the same failed requests are also written to `logs/YYYY-MM-DD.log` (one file per day). The `logs` folder is ignored by Git.

## Bonus Features

1. **Change bizNumber** – `PATCH /cards/biz-number/:id` (admin only) with `{ "bizNumber": 1234567 }`. Returns 409 if another card already uses that number.
2. **File logger** – failed requests are written to a daily log file in `logs/`.
3. **Login blocking** – 3 consecutive wrong passwords for the same email block login for that email for 24 hours (returns 403). A successful login resets the counter.

## Testing the API

The `rest/` folder contains requests for every endpoint, for the VS Code
[REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension:

- `rest/users.rest` – register, login, get all users, get user, update, change business status, delete
- `rest/cards.rest` – all cards, my cards, get card, create, update, like/unlike, change bizNumber, delete

Run the login requests at the top of each file first – the tokens and ids are stored in variables and reused by the other requests.

## Project Structure

```
businesscard-api/
├── rest/
│   ├── cards.rest
│   └── users.rest
├── src/
│   ├── config/
│   │   └── env.ts              # environment variables and DB selection
│   ├── database/
│   │   ├── models/
│   │   │   ├── Card.ts
│   │   │   ├── User.ts
│   │   │   └── sharedSchemas.ts
│   │   ├── connectToDb.ts
│   │   └── seed.ts             # initial users and cards
│   ├── error/
│   │   ├── AppError.ts
│   │   └── errorHandler.ts     # central error handler
│   ├── logger/
│   │   ├── fileLogger.ts       # daily log files (bonus)
│   │   └── logger.ts           # Pino logger
│   ├── middleware/
│   │   ├── auth.ts             # authentication and authorization
│   │   ├── cors.ts
│   │   ├── requestLogger.ts    # logs requests with status >= 400
│   │   └── validate.ts         # Joi validation middleware
│   ├── routes/
│   │   ├── cardsRouter.ts
│   │   └── usersRouter.ts
│   ├── services/
│   │   ├── cardsService.ts
│   │   ├── tokenService.ts     # jose sign/verify
│   │   └── usersService.ts
│   ├── validations/
│   │   ├── cardValidation.ts
│   │   ├── sharedValidation.ts
│   │   └── userValidation.ts
│   └── index.ts
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```
