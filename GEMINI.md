# Project Overview

This is a Next.js application with a Python FastAPI backend. The application, named "SentinelScan," is designed to scan domains for security vulnerabilities and generate reports.

**Frontend:**
- Framework: Next.js (React)
- Language: TypeScript
- Styling: Tailwind CSS
- Key Libraries: Radix UI, Lucide React, Supabase Client

**Backend:**
- Framework: FastAPI
- Language: Python
- Database: Supabase
- Key Libraries: `fastapi`, `uvicorn`, `httpx`, `supabase`, `python-dotenv`, `pydantic`

**Architecture:**
The application is a monorepo with a Next.js frontend and a Python FastAPI backend. The frontend and backend are in the `src` and `api` directories, respectively. The frontend communicates with the backend through API endpoints. The backend handles the scanning logic and interacts with a Supabase database to store scan results.

# Building and Running

**Prerequisites:**
- Node.js and npm (or yarn/pnpm/bun)
- Python and pip

**Installation:**
1. Install Node.js dependencies:
   ```bash
   npm install
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

**Running the application:**

The application can be run in development mode with a single command that starts both the frontend and backend concurrently:

```bash
npm run dev
```

Alternatively, you can run the frontend and backend separately:

- **Frontend (Next.js):**
  ```bash
  npm run dev:ui
  ```
- **Backend (FastAPI):**
  ```bash
  npm run dev:api
  ```

**Building for production:**

```bash
npm run build
```

**Starting the production server:**

```bash
npm run start
```

# Development Conventions

- **Linting:** The project uses ESLint for code linting. Run the linter with:
  ```bash
  npm run lint
  ```
- **Styling:** The project uses Tailwind CSS for styling. Utility classes are used for styling components.
- **Components:** Reusable UI components are located in the `src/components` directory.
- **API:** The backend API is defined in the `api` directory. The main API logic is in `api/index.py`.
- **Database:** The project uses Supabase for its database. Database interactions are handled in `api/db.py`.
- **Secrets:** The project uses a `.env` file for environment variables. A `.env.example` file should be created to show the required environment variables. (TODO: Create `.env.example` file).
