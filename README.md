# Vocabuddy

## Overview

**Vocabuddy** is a UIUC CS411 Database Systems team project for GRE and TOEFL vocabulary learning. The application provides word lookup, definitions and stems, learning progress, target-school selection, and a view of friends' progress.

Interactive quizzes and advanced recommendations were proposed during the course but are not implemented in the final application.

## Installation

This is a historical academic project, not a production-ready service. The original GCP deployment is not maintained.

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

The maintenance changes fix backend startup failure handling, stored-procedure initialization, a composite-key word JOIN, progress display units, and the email-only registration check. They also remove the unused activity trigger and hardcoded database credentials, and narrow authentication error logging.

Verification used an isolated MySQL 8.0.40 database with synthetic data: 52 local tests, one integration test, and 21 additional database/API checks passed. That verification tooling is kept separately from this repository update; no public test command is provided here.

Plaintext password handling, credentials in GET requests, missing resource authorization, vulnerable dependencies, and learning-state/concurrency issues remain. Do not deploy this backend for real users. Removing credentials from current source does not revoke credentials exposed in history.

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
