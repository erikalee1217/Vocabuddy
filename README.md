# Vocabuddy

## Overview
**Vocabuddy** is a vocabulary app for people studying for the GRE and TOEFL. You can look up words with their definitions and word stems, keep track of how many you’ve learned, pick the schools you’re aiming for and see how your progress stacks up against your friends’.

We built it with a team for UIUC’s CS411 (Database Systems). The frontend is React, the backend runs on Node.js and Express, and everything is stored in MySQL. Most of our work went into the database side: designing the schema, writing the SQL queries and stored procedures, and hooking it all up to the web app.

## Installation
This is a historical academic project. The original GCP deployment is not maintained.

Use Node.js 20.19 or later and a separate local MySQL database with the [documented schema](doc/DatabaseDesign.md). The 2026 checks used MySQL 8.0.40 and Node.js 23.7.0. Do not reuse historical credentials or import historical account records. Local database initialization and verification fixtures are not included here.

1. **Clone the repository:**

   ```bash
   git clone https://github.com/erikalee1217/Vocabuddy.git
   cd Vocabuddy
   ```

2. **Backend setup:**

   Set the following variables in your shell before starting the backend. The application does not load a `.env` file automatically. Keep credential values out of Git.

   | Variable | Value |
   |----------|-------|
   | `DB_HOST` | `127.0.0.1` (required; remote hosts are rejected) |
   | `DB_NAME` | `vocabuddy_local` (required) |
   | `DB_PORT` | Your local MySQL port; defaults to `3307` |
   | `DB_USER` | Your local database user, with permission to create/drop the application's procedures |
   | `DB_PASSWORD` | That local user's password |
   | `PORT` | Optional API port; defaults to `3001` |

   ```bash
   cd backend
   npm ci
   npm start
   ```

   The API listens on `127.0.0.1:3001` by default. Its startup creates the stored procedures from `server.js`; it does not create the database or tables. The local-only host and database-name checks are intentional.

3. **Frontend setup** (in another terminal, from the repository root):

   ```bash
   cd react
   npm install
   npm start
   ```

   React runs at http://localhost:3000 and defaults to the API at `http://127.0.0.1:3001/`. If you change the API port, set `REACT_APP_API_URL` before starting React. Never put database credentials in frontend variables.

## Tech Stack

- Frontend: React, TypeScript
- Backend: Node.js, Express
- Database: MySQL
- Data Processing: Python
- Original deployment: Google Cloud Platform (GCP)

## 2026 Maintenance
This update fixes a handful of backend bugs: startup failures are now handled properly, stored procedures initialize correctly, the word JOIN on the composite key works, progress shows the right units, and registration only checks email. I also removed the unused activity trigger and the hardcoded database credentials, and narrowed what auth errors get logged.

I tested against a throwaway MySQL database with synthetic data. 52 local tests, one integration test, and 21 extra database/API checks all passed. 

## Team Information

| Role    | Name                  | Email                 |
|---------|-----------------------|-----------------------|
| Captain | Jack Chen             | zihengc2@illinois.edu |
| Member1 | Erika Lee             | ihsuanl2@illinois.edu |
| Member2 | Joanne Chou           | yenchou2@illinois.edu |

## Personal Contributions
- Designed and implemented the MySQL database schema for vocabulary storage and tracking
- Developed RESTful backend APIs using Node.js and Express for vocabulary lookup and user progress features
- Contributed to data parsing scripts using Python to clean and import GRE/TOEFL word lists
