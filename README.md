# Live Auction System (NestJS)

This is a production-grade, real-time auction platform built with NestJS. It is designed to solve complex backend challenges including **concurrency (race conditions)**, **real-time updates**, **performance caching**, and **reliable background jobs**.

This project serves as a demonstration of a senior-level, microservice-style architecture, proving a deep understanding of modern backend engineering principles.

---

## 🚀 Key Features

* **Real-time Bidding:** Instant bid updates pushed to all clients via WebSockets (Socket.IO).
* **Concurrency Safe:** Bulletproof bidding system using **PostgreSQL pessimistic locking** to prevent race conditions.
* **High Performance:** Sub-100ms response times for "hot" auctions using a **Redis cache-aside strategy**.
* **Reliable Auction Closure:** Guaranteed, on-time auction closures using a **BullMQ background job queue**.
* **Secure:** JWT-based authentication (Passport.js) and authorization (custom guards).
* **Observable:** Includes ` /health` checks for monitoring.
* **Documented:** Fully interactive API documentation via Swagger (`/api/docs`).

---

## 🏗️ System Architecture

This application follows a modern, decoupled architecture.

```ascii
      +------------------+
      |      Client      |
      |   (Browser/App)  |
      +--------+---------+
         |     |
 (HTTP)  |     | (WebSocket)
         |     |
      +--v-----v---------+
      |                  |
      |  NestJS Server   |
      |  (API / Gateway) |
      |                  |
      +--+------+--------+
         |      |
         |      |
+--------v-+  +-v--------+  +--------------+
|          |  |          |  |              |
| PostgreSQL |  |   Redis  |  |    BullMQ    |
| (Database) |  | (Cache)  |  | (Job Queue)  |
| - Users  |  | - Auction|  | - close-job  |
| - Auctions|  |   Cache  |  | - ...        |
| - Bids   |  |          |  |              |
+----------+  +----------+  +--------------+
````

**Request Flow (New Bid):**

1.  Client sends `POST /bids` to the NestJS API.
2.  `BidsService` begins a **PostgreSQL transaction**.
3.  It acquires a **pessimistic lock** on the auction row to block other bids.
4.  It validates the bid and saves the new `Bid` and updates the `Auction`.
5.  It **invalidates the Redis cache** for that auction.
6.  The transaction is committed.
7.  `BidsService` calls the `AuctionsGateway` to broadcast the new bid.
8.  `AuctionsGateway` emits the `new-bid` event to all clients in that auction's "room."

-----

## 🛠️ Tech Stack

  * **Backend:** NestJS, TypeScript
  * **Database:** PostgreSQL (with TypeORM)
  * **Caching:** Redis (with `cache-manager`)
  * **Queues:** BullMQ (backed by Redis)
  * **Real-time:** WebSockets (Socket.IO)
  * **Auth:** Passport.js, JWT, bcrypt
  * **Validation:** `class-validator`
  * **API Docs:** Swagger
  * **Testing:** Jest, Supertest
  * **DevOps:** Docker, Docker Compose

-----

## 🏆 Senior Engineering Highlights

This project was built to solve specific, high-value engineering problems:

### 1\. Concurrency Control (Race Condition Prevention)

  * **Problem:** Two users bidding on the same item at the same millisecond can lead to a race condition, where the database state becomes inconsistent.
  * **Solution:** The bidding logic is wrapped in a `DataSource.transaction()`. Inside this transaction, we use a **pessimistic write lock** (`.setLock('pessimistic_write')`) on the specific auction row. This forces concurrent bid requests to serialize, guaranteeing data integrity at scale.

### 2\. Real-Time Broadcasting (WebSockets)

  * **Problem:** A user shouldn't have to refresh their browser to see a new bid.
  * **Solution:** We use a **WebSocket Gateway** (`AuctionsGateway`). Clients join a specific "room" for each auction (e.g., `auction:<id>`). When a bid is successfully processed, the `BidsService` calls the gateway to `emit('new-bid', ...)` to *only* the clients in that room.

### 3\. Performance (Caching)

  * **Problem:** A popular auction's `GET /auctions/:id` endpoint will be "hot," causing massive database load.
  * **Solution:** We use a **cache-aside** strategy. The `findOne` controller is decorated with `@UseInterceptors(CacheInterceptor)`, which automatically caches the result in Redis.
  * **Cache Invalidation:** To prevent stale data, the `BidsService` **explicitly deletes the cache key** (`cacheManager.del(...)`) inside the database transaction, guaranteeing that the cache is invalidated *if and only if* the new bid is successful.

### 4\. Reliability (Background Jobs)

  * **Problem:** Auctions must close reliably at their `endTime`, even if the server restarts. A simple cron job that scans the DB is fragile and inefficient.
  * **Solution:** We use a **Producer/Consumer** pattern. When an auction is created, the `AuctionsService` (Producer) adds a **delayed job** to a **BullMQ** queue. A separate `AuctionProcessor` (Consumer) listens for these jobs and processes them at the scheduled time, ensuring reliable closure.

-----

## 🚀 Quick Start (Local Setup)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/psyberpath/nestjs-auction-system.git
    cd auction-service
    ```

2.  **Create your environment file:**
    Copy the `example.env` to `.env` and fill in the values (the defaults will work with the `docker-compose.yml` file).

    ```bash
    cp example.env .env
    ```

3.  **Start the infrastructure (Database & Cache):**

    ```bash
    docker-compose up -d
    ```

4.  **Install dependencies:**

    ```bash
    npm install
    ```

5.  **Run database migrations:**
    This will create all the tables in your PostgreSQL container.

    ```bash
    npm run migration:run
    ```

6.  **Run the application:**

    ```bash
    npm run start:dev
    ```

Your server is now running on `http://localhost:3000`.

-----

## 🧪 Testing

This project includes a comprehensive end-to-end test suite that simulates a full, multi-user flow.

1.  Make sure your Docker containers are running (`docker-compose up -d`).
2.  Run the E2E test suite:
    ```bash
    npm run test:e2e
    ```

-----

## 📖 API Documentation

Once the server is running, the full, interactive API documentation (powered by Swagger) is available at:

**`http://localhost:3000/api/docs`**

```