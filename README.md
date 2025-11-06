# GearUp (Payment)

GearUp is a small full-stack demo that showcases a Node/Express + MongoDB backend and a React frontend. The project implements product listing, cart management, customer creation, and order creation (with a simple email helper). It includes a seeder to populate example products.

## Live demo (deployed)

- Visit the live front-end deployment: **https://gear-up-ashy-nine.vercel.app/**

> Note: after a fresh deployment the frontend may attempt to contact the backend immediately. Please wait up to **50 seconds** for the backend to start and become reachable — this is especially relevant when the backend was just (re)deployed or cold-started on the hosting provider.

This README documents how to get the project running locally, environment variables, available npm scripts, a short API overview, and troubleshooting steps.

## Tech stack

- Backend: Node.js (ES modules), Express, Mongoose
- Frontend: React (Create React App), Axios
- Database: MongoDB (Atlas)
- Email: Nodemailer (SMTP)

## Repository layout

- `backend/` - Express API server
  - `server.js` - API entry point (starts server, mounts routes)
  - `config/db.js` - MongoDB connection helper
  - `controllers/` - route handlers (products, orders, carts, customers)
  - `models/` - Mongoose models
  - `routes/` - API routes
  - `seeder/seedProducts.js` - script to import sample products
  - `utils/sendEmail.js` - simple nodemailer wrapper

- `frontend/` - React single-page application
  - `src/api.js` - Axios instance + exported API helper functions
  - `src/components` - React components used in the UI

## Prerequisites

- Node.js (v16+ recommended)
- npm (comes with Node.js)
- MongoDB (local `mongod` or a cloud instance like MongoDB Atlas)

## Environment variables (backend)

Create a `.env` file in the `backend/` directory. The project reads these variables at runtime. A `backend/.env.example` file is included in the repository to get you started.

- MONGO_URI - MongoDB connection string (required)
- PORT - Optional. Server port (defaults to `5001` in the current codebase)
- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS - SMTP credentials used by `utils/sendEmail.js` (optional)
- FROM_EMAIL - Optional. Default sender address used by `sendEmail`.

Example `backend/.env` (do NOT commit this file):

MONGO_URI="mongodb://localhost:27017/gearup"
PORT=5001
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=supersecret
FROM_EMAIL="GearUp <no-reply@example.com>"

## Backend: install & run

1. Change to the backend folder and install dependencies:

```bash
cd backend
npm install
```

2. Start the backend server:

```bash
npm start
```

The backend entrypoint mounts its routes under `/api` and listens on the port set by `PORT` (defaults to `5001`). You should see a console log like `Server running on port 5001` and `MongoDB Connected: <host>` when the DB connects.

### Seed sample products

To populate the `products` collection with sample data, run this from the `backend/` folder:

```bash
npm run seed:products
```

This script connects to the DB, clears the `products` collection, and inserts several items (name, description, price, stock, category, imageUrl, slug).

## Frontend: install & run

1. Change to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

2. Start the React development server:

```bash
npm start
```

The frontend uses an Axios instance in `frontend/src/api.js` with a base URL defaulting to `http://localhost:5001/api`. You can override it in development by setting `REACT_APP_API_URL` in `.env` at the project root (or in `frontend/.env`).

## Running the full app locally

- Ensure MongoDB is running and `MONGO_URI` points to it.
- Start the backend: `cd backend && npm start`
- (Optional) Seed products: `cd backend && npm run seed:products`
- Start the frontend: `cd frontend && npm start`

The React app will request the API at `${REACT_APP_API_URL || 'http://localhost:5001'}/api` by default. If you run the backend on a different port, set `REACT_APP_API_URL` in the frontend environment.

## API overview (key endpoints)

All endpoints are mounted under `/api`.

- Products (`/api/products`)
  - GET `/api/products` — list products
  - GET `/api/products/:id` — get product by id
  - POST `/api/products` — create product
  - PUT `/api/products/:id` — update product
  - DELETE `/api/products/:id` — delete product

- Orders (`/api/orders`)
  - POST `/api/orders/:customerId` — create new order for customer (request body must include `delivery` details)
  - GET `/api/orders/:id` — get order by id
  - GET `/api/orders/customer/:customerId` — list orders for a customer

- Carts (`/api/carts`)
  - (frontend uses helper endpoints for cart operations; see `frontend/src/api.js` for exact calls)

- Customers (`/api/customers`)
  - endpoints for creating and fetching customers (see backend controllers)

Note: This README lists the main endpoints implemented by the current code. For full details, check the route files under `backend/routes/` and the controllers under `backend/controllers/`.

## Data models (summary)

- Product (fields visible in the seeder):
  - name, description, price (number), stock (number), category, imageUrl, slug, createdAt

- Order / Cart / Customer
  - Models live in `backend/models`. They follow typical e-commerce shapes (customer info, cart items with product refs, orders with delivery details). Inspect model files for the exact schemas.

## Email sending

The backend includes `utils/sendEmail.js`, a tiny wrapper around Nodemailer that reads SMTP config from environment variables. If you want order confirmation emails, set `EMAIL_*` variables and `FROM_EMAIL`.

## Scripts

Backend (`backend/package.json`):
- `start` — runs `node server.js` (starts the API)
- `seed:products` — runs `node seeder/seedProducts.js` (import sample products)

Frontend (`frontend/package.json`):
- `start` — starts CRA dev server
- `build` — builds production assets

## Tests

- Frontend: run `cd frontend && npm test` (uses Create React App's test runner)
- Backend: no automated tests are included by default.

## Development tips

- Use `REACT_APP_API_URL` to point the frontend at a non-default backend address.
- For local development you can run the backend and frontend in two terminals. If you want a single command, consider adding `concurrently` to run both with one npm script.

## Troubleshooting

- "MongoDB Connected" not showing / server exits: confirm `MONGO_URI` is correct and the DB is reachable.
- Port conflicts: change `PORT` (backend) or `REACT_APP_PORT`/CRA settings (frontend).
- Email failures: verify `EMAIL_*` credentials, ports, and that your SMTP provider allows sending from your host.

## Security and deployment notes

- Do not commit `.env` files with secrets.
- For production, use a proper process manager (PM2, systemd) and configure secure environment variables.
- Consider adding input validation and authentication for any public endpoints before deploying.

## Next steps (suggested)

- Add test coverage for backend controllers and models.
- Add a `backend/.env.example` (this repository now includes one).
- Add CI (GitHub Actions) to lint, test, and run build steps.

## Contributing

If you'd like to contribute, open an issue first to discuss changes. Pull requests should be small and focused.

## License

Add your preferred license or remove this section. This repository currently has no LICENSE file.

---

If you'd like, I can also:
- Add `backend/.env.example` to the repo (I will create it now),
# GearUp (Payment)

GearUp is a small full-stack demo that showcases a Node/Express + MongoDB backend and a React frontend. The project implements product listing, cart management, customer creation, and order creation (with a simple email helper). It includes a seeder to populate example products.

This README documents how to get the project running locally, environment variables, available npm scripts, a short API overview, and testing instructions added to the project.

## Tech stack

- Backend: Node.js (ES modules), Express, Mongoose
- Frontend: React (Create React App), Axios
- Database: MongoDB (Atlas )
- Email: Nodemailer (SMTP)

## What changed (testing & test-friendly server)

Recent changes were made to make the backend testable and to add unit/integration tests:

- Tests added (backend): Jest + Supertest + mongodb-memory-server. These tests run entirely in memory and do not touch your real database.
- `server.js` now exports the Express `app` and only connects to MongoDB and starts listening when `NODE_ENV !== 'test'`. This allows tests to import the app without starting the network listener.
- `utils/sendEmail.js` uses a noop transporter when `NODE_ENV === 'test'` to avoid sending real emails or leaving network handles open in tests.
- `productController` was updated to use `deleteOne()` instead of the removed `remove()` document method (Mongoose v8 compatibility).

Test files added under `backend/test/`: `product.test.js`, `customer.test.js`, `cart.test.js`, `order.test.js` and `setup.js` (Jest setup to run an in-memory MongoDB).

## Repository layout (relevant parts)

- `backend/` - Express API server
  - `server.js` - API entry point (exports `app`; starts server only when not testing)
  - `config/db.js` - MongoDB connection helper
  - `controllers/` - route handlers (products, orders, carts, customers)
  - `models/` - Mongoose models
  - `routes/` - API routes
  - `seeder/seedProducts.js` - script to import sample products
  - `utils/sendEmail.js` - nodemailer wrapper (test-mode safe)
  - `test/` - backend Jest tests and test setup

- `frontend/` - React single-page application

## Prerequisites

- Node.js (v16+ recommended)
- npm (comes with Node.js)
- MongoDB (local `mongod` or cloud instance) for running the app (not required for tests)

## Environment variables (backend)

Create a `.env` file in the `backend/` directory. The project reads these variables at runtime.

- MONGO_URI - MongoDB connection string (required for running the real server)
- PORT - Optional. Server port (defaults to `5001`)
- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS - SMTP credentials used by `utils/sendEmail.js` (optional)
- FROM_EMAIL - Optional. Default sender address used by `sendEmail`.

Example `backend/.env` (do NOT commit this file):

MONGO_URI="mongodb://localhost:27017/gearup"
PORT=5001
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=you@example.com
EMAIL_PASS=supersecret
FROM_EMAIL="GearUp <no-reply@example.com>"

## Backend: install & run

1. Change to the backend folder and install dependencies:

```bash
cd backend
npm install
```

2. Start the backend server in development/production mode:

```bash
npm start
```

When not testing, `server.js` will call `connectDB()` and `app.listen(PORT)`; expect logs like `Server running on port 5001` and `MongoDB Connected`.

### Seed sample products

To populate the `products` collection with sample data, run this from the `backend/` folder:

```bash
npm run seed:products
```

## Running backend tests (Jest + Supertest)

The backend tests use Jest + Supertest and run against an in-memory MongoDB provided by `mongodb-memory-server`. Tests are located in `backend/test/` and include:

- `test/setup.js` — test setup that starts/stops the in-memory MongoDB and clears collections between tests
- `test/product.test.js`, `test/customer.test.js`, `test/cart.test.js`, `test/order.test.js`

To run the tests locally:

```bash
cd backend
# install deps (if not already)
npm install

# run tests
NODE_OPTIONS=--experimental-vm-modules NODE_ENV=test npm test
```

Notes:
- `NODE_OPTIONS=--experimental-vm-modules` is required in some Node.js/Jest ESM configurations used by this project. If your environment or CI provides an ESM-aware Jest setup, you may not need this flag.
- `NODE_ENV=test` ensures the test-only codepaths are used (in-memory SMTP stub, skip starting server listener, etc.).

## API overview (key endpoints)

All endpoints are mounted under `/api`.

- Products (`/api/products`)
  - GET `/api/products` — list products
  - GET `/api/products/:id` — get product by id
  - POST `/api/products` — create product
  - PUT `/api/products/:id` — update product
  - DELETE `/api/products/:id` — delete product

- Orders (`/api/orders`)
  - POST `/api/orders/:customerId` — create new order for customer (request body must include `delivery` details)
  - GET `/api/orders/:id` — get order by id
  - GET `/api/orders/customer/:customerId` — list orders for a customer

- Carts (`/api/carts`)
  - GET `/api/carts/:customerId` — get cart
  - POST `/api/carts/:customerId/items` — add/update item
  - DELETE `/api/carts/:customerId/items/:productId` — remove item
  - DELETE `/api/carts/:customerId` — clear cart

- Customers (`/api/customers`)
  - POST `/api/customers` — create or update a customer record
  - GET `/api/customers/:id` — get customer by id
  - GET `/api/customers` — list customers

## Data models (summary)

- Product: name, slug, description, category, price, stock, imageUrl, createdAt
- Customer: name, email, phone, address
- Cart: customer (ref), items [{ product (ref), qty, price }]
- Order: customer (ref), items, totalAmount, delivery, status, emailSent

Full schemas are available under `backend/models/`.

## Email sending

`utils/sendEmail.js` wraps Nodemailer. Tests use a noop transporter to avoid sending real emails. To enable real email sending in development/production, set the `EMAIL_*` environment variables described above.

## Scripts

Backend (`backend/package.json`):
- `start` — runs `node server.js` (starts the API)
- `seed:products` — runs `node seeder/seedProducts.js` (import sample products)
- `test` — runs the Jest test suite (configured in `package.json`)

Frontend (`frontend/package.json`):
- `start` — starts CRA dev server
- `build` — builds production assets

## .gitignore

This repo includes a `.gitignore` at the project root. Common items ignored include `node_modules`, `.env` files, build artifacts, editor settings, and test coverage output.

## Next steps (suggested)

- Replace the small placeholder model test with focused schema/unit tests for models.
- Add CI (GitHub Actions) to run tests on pushes and PRs. If you want I can add a workflow that installs deps and runs `npm test` in `backend/`.
- Add linting and pre-commit hooks (husky + lint-staged) for consistent style.

## Contributing

If you'd like to contribute, open an issue first to discuss changes. Pull requests should be small and focused. Please avoid committing secrets such as `.env` files or credentials.

---

If you'd like, I can now add model-level unit tests or a GitHub Actions workflow to run tests automatically — tell me which and I'll implement it.
