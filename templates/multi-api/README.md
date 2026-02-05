# {{PROJECT_NAME}}

A multi-backend API demo showcasing both **Node.js** and **Python** implementations.

## Project Structure

```
├── node-api/          # Fastify + Drizzle ORM
│   ├── src/
│   │   ├── index.ts   # API entry point
│   │   └── db/        # Database connection & schema
│   └── package.json
├── python-api/        # FastAPI + SQLAlchemy
│   ├── main.py        # API entry point
│   ├── app/           # Config, models, database
│   └── requirements.txt
└── render.yaml        # Render Blueprint (both services + shared DB)
```

## Local Development

### Node API

```bash
cd node-api
npm install
npm run dev
# Runs on http://localhost:3001
```

### Python API

```bash
cd python-api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 3002
# Runs on http://localhost:3002
```

## API Endpoints

Both APIs expose the same endpoints for comparison:

| Endpoint    | Description           |
|-------------|-----------------------|
| `GET /`     | API info              |
| `GET /health` | Health check        |
| `GET /users`  | List all users      |

## Deploy to Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or manually:
1. Push this repo to GitHub
2. Connect to Render
3. Use the `render.yaml` Blueprint

The Blueprint creates:
- **node-api** - Node.js web service
- **python-api** - Python web service  
- **{{PROJECT_NAME}}-db** - Shared PostgreSQL database
