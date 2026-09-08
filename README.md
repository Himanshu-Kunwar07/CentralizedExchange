# 📈 Centralized Crypto Exchange (CEX)

A high-performance, real-time centralized cryptocurrency exchange platform. This application features a live order book, an in-memory order matching engine, secure custodial wallets, and an intuitive trading dashboard designed specifically to optimize the user experience for beginner traders.

## ✨ Key Features

- **Real-Time Order Matching Engine**: An ultra-fast, in-memory matching engine that processes Bids and Asks, maintaining strict price-time priority.
- **Live Market Data**: WebSocket integration for pushing real-time order book depth, price updates, and recent trades directly to the frontend.
- **Secure Custodial Wallets**: Secure fund-management workflow that securely holds and manages users' fiat and crypto balances, tracking both "available" and "locked" funds during open trades.
- **Beginner-Friendly Dashboard**: An intuitive, responsive UI featuring simple buy/sell interfaces without the overwhelming clutter of advanced pro-trading terminals.
- **Robust API Design**: RESTful endpoints for user authentication (JWT), order placement, market depth querying, and balance management.

## 🛠️ Technology Stack

### Frontend
* **React & TypeScript**: For a dynamic, strongly-typed, and scalable trading interface.
* **WebSocket API**: For consuming live market streams without polling overhead.

### Backend & Infrastructure
* **Bun & Express.js**: High-speed JavaScript runtime powering the backend REST APIs and matching engine logic.
* **PostgreSQL (Neon Serverless)**: Scalable relational database for persistent storage of user profiles, transaction histories, and finalized orders.
* **Prisma ORM (with Neon Adapter)**: Type-safe database interactions and connection pooling.
* **Redis**: Used for pub/sub architecture to broadcast trade events across multiple WebSocket server instances.

## ⚙️ Core Architecture: The Matching Engine

The exchange utilizes a hybrid architecture to balance persistence and speed:
1. **Order Validation**: Incoming orders check PostgreSQL via Prisma to ensure sufficient *available* balance (Total - Locked = Available).
2. **Transaction Locking**: Funds are instantly locked in a database transaction to prevent double-spending.
3. **In-Memory Order Book**: The order is then pushed to an in-memory array (`bids` or `asks`), sorted by price (Bids descending, Asks ascending) to facilitate microsecond matching.
4. **Fulfillment**: Matched trades update the database asynchronously while immediately notifying clients via WebSockets.

## 🚀 Getting Started

### Prerequisites
* [Bun](https://bun.sh/) (v1.0+)
* [PostgreSQL](https://www.postgresql.org/) (or a [Neon](https://neon.tech/) serverless DB)
* [Redis](https://redis.io/) (Running locally or via Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Himanshu-022001/centralized-exchange.git
   cd centralized-exchange
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Database Connections
   DATABASE_URL="postgres://user:password@ep-cool-db.region.aws.neon.tech/cex_db?sslmode=require"
   
   # Security
   JWT_SECRET="your_jwt_secret"
   ```

4. **Initialize the Database**
   Push the Prisma schema to your database:
   ```bash
   bunx prisma db push
   bunx prisma generate
   ```

5. **Start the Servers**
   ```bash
   # Run the REST API and Matching Engine
   bun run dev:api
   
   # Run the WebSocket server
   bun run dev:ws
   
   # Run the React Frontend (in a separate terminal)
   bun run dev:client
   ```

## 🔒 Security Practices Implemented
* **Balance Locking**: User funds are logically partitioned into `total` and `locked`. Open orders lock funds to strictly prevent overdrafts.
* **Neon Connection Pooling**: Integrates `@prisma/adapter-neon` to handle high-concurrency database connections safely in a serverless environment.
* **JWT Authentication**: Routes are protected via custom `authmiddleware` extracting and verifying user identities.
