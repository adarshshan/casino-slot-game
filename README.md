# Slot Game Platform

This is a basic but well-structured slot game platform that works locally and uses **WebSockets** (not REST APIs) for all gameplay and balance interactions. The focus is on backend functionality, real-time communication, and clean code. You're expected to use Docker locally with MongoDB and Redis, and implement proper authentication, caching, and metrics.

---

### Tech Stack

- **Backend**: Node.js (TypeScript), Express, Socket.IO
- **Frontend**: React (Vite)
- **Database**: MongoDB (local, Dockerized)
- **Cache**: Redis (local, Dockerized)
- **Containerization**: Docker Compose
- **Auth**: JWT + Refresh Tokens

---

### Setup Instructions

1.  Clone the repository.
2.  Make sure you have Docker and Docker Compose installed.
3.  Create a `.env` file in the root of the project with the following content:

```
MONGO_URI=mongodb://mongo:27017/casino
JWT_SECRET=myjwtsecret
REFRESH_SECRET=myrefreshsecret
REDIS_HOST=redis
REDIS_PORT=6379
RATE_LIMIT_WINDOW=60
RATE_LIMIT_SPINS=10
```

4.  Run the following command to start the application:

```
docker-compose up --build
```

5.  The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

---

### Authentication Flow

1.  Register a new user using the registration form.
2.  Login with the newly created user.
3.  On successful login, an access token and a refresh token are issued.
4.  The access token is used to authenticate the WebSocket connection.
5.  The refresh token can be used to get a new access token.

---

### WebSocket Event Structure

-   **`spin`**: `(wager: number)` - Simulates a spin, processes the wager, and returns the result.
-   **`balance`**: `()` - Responds with the user’s current balance.
-   **`transactions`**: `({ page: number, limit: number })` - Sends paginated spin history on request.

---

### Spin Logic + Payout Rules

-   The slot machine has 3 reels.
-   The symbols and their weights are defined in `backend/src/controllers/game.controller.ts`.
-   A win is achieved when all three reels have the same symbol.
-   The payout is determined by the symbol and the wager amount.
# casino-slot-game
