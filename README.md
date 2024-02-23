# Hack the North Backend Challenge

### By Evan Howie

This README provides an overview of my submission for the Hack the North Backend Challenge 2024. The application is built using TypeScript and Express for the server framework.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js >= v18.11 (v20.10.0 recommended)
- npm (Node Package Manager)

### Installing

To get the application running, follow these steps:

1. **Clone the repository**

   Use Git to clone the repository

   ```
   git clone git@github.com:evan-howie/htn-be-challenge.git
   cd htn-be-challenge
   ```

2. **Install dependencies**

   ```
   npm install
   ```

3. **Start the development server**

   ```
   npm run dev
   ```

   This command runs the server in development mode with live reloading enabled.

**OR**

4. **Build the application**

   To compile the TypeScript code to JavaScript, run:

   ```
   npm run build
   ```

5. **Serve the production build**

   After building the project, you can serve the production build using:

   ```
   npm run serve
   ```

### Initializing database

To (optionally) initialize the database simply run from the project's root directory:

```bash
npx prisma migrate dev
npx ts-node src/initialize_db.ts
```

### API Endpoints

The application provides the following RESTful API endpoints:

- **GET `/users/`**

  Retrieves a list of all users.

- **GET `/users/:id`**

  Retrieves a specific user by their unique ID.

- **POST `/users/`**

  Creates one or multiple new users with the data provided in the request body.

- **PUT `/users/:id`**

  Updates an existing user's information by their unique ID with the data provided in the request body.

- **GET `/skills/`**

  Retrieves a list of all skills. Optionally, the query parameters min_frequency, max_frequency, and name can be used to narrow the results
