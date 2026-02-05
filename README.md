# @render-examples/render-demo

CLI tool to scaffold Render demo projects with Cursor rules, linting configs, and templates. Supports both preset-based and composable project creation.

## Installation

### Team setup (one-time)

1. Create a GitHub Personal Access Token with `read:packages` scope
2. Create or edit `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@render-examples:registry=https://npm.pkg.github.com
```

### Usage

```bash
# Initialize a new project (interactive)
npx @render-examples/render-demo init

# Use a preset directly
npx @render-examples/render-demo init -p fastify-api

# Composable mode (pick components)
npx @render-examples/render-demo init --composable

# Sync local rules with the latest version
npx @render-examples/render-demo sync

# Check if rules are up to date
npx @render-examples/render-demo check
```

## Commands

### `init`

Interactive setup for new projects. Supports two modes:

**Preset mode** (default): Choose a preconfigured stack

```
$ npx @render-examples/render-demo init

? Select a stack preset:
  > Next.js Full Stack (Next.js + Tailwind + Drizzle + Zod)
    Next.js Frontend (Next.js + Tailwind, static export)
    Vite SPA (Vite + React + Tailwind)
    Fastify API (Fastify + Drizzle + Zod)
    FastAPI (FastAPI + SQLAlchemy + Pydantic)
    Multi-Backend API (Node.js + Python side-by-side)
```

**Composable mode**: Mix and match frontends, APIs, and workers

```
$ npx @render-examples/render-demo init --composable

? Select frontends: Next.js
? Select APIs: Fastify (Node.js), FastAPI (Python)
? Select workers: Background Worker (TypeScript), Cron Job (Python)
? Add a shared PostgreSQL database? Yes
? Include optional files: .env.example, docker-compose.yml
```

Options:
- `-p, --preset <name>`: Use a preset directly (skip prompts)
- `-c, --composable`: Enable composable mode
- `-y, --yes`: Accept all defaults

### `sync`

Update local rules to match the latest package version:

```bash
npx @render-examples/render-demo sync
```

Options:
- `-f, --force`: Overwrite without prompting
- `--dry-run`: Show changes without applying

### `check`

Verify rules are in sync (useful in CI):

```bash
npx @render-examples/render-demo check --ci
```

Options:
- `--ci`: Exit with code 1 if out of sync

## Available presets

| Preset | Stack | Database |
|--------|-------|----------|
| `next-fullstack` | Next.js + Tailwind + Drizzle + Zod | PostgreSQL |
| `next-frontend` | Next.js + Tailwind (static export) | None |
| `vite-spa` | Vite + React + Tailwind | None |
| `fastify-api` | Fastify + Drizzle + Zod | PostgreSQL |
| `fastapi` | FastAPI + SQLAlchemy + Pydantic | PostgreSQL |
| `multi-api` | Node.js (Fastify) + Python (FastAPI) | None |

## Composable components

Mix and match these components in composable mode:

### Frontends

| Component | Description | Deploy type |
|-----------|-------------|-------------|
| `nextjs` | Next.js + Tailwind + React | Static or web service |
| `vite` | Vite + React + Tailwind | Static site |

### APIs

| Component | Description | Runtime |
|-----------|-------------|---------|
| `fastify` | Fastify + Drizzle + Zod | Node.js |
| `fastapi` | FastAPI + SQLAlchemy + Pydantic | Python |

### Workers

| Component | Description | Runtime |
|-----------|-------------|---------|
| `worker-ts` | Background worker | Node.js |
| `worker-py` | Background worker | Python |
| `cron-ts` | Cron job | Node.js |
| `cron-py` | Cron job | Python |
| `workflow-ts` | Render Workflow with SDK | Node.js |
| `workflow-py` | Render Workflow with SDK | Python |

### Optional extras (composable mode only)

| Extra | Description |
|-------|-------------|
| `.env.example` | Environment variables template |
| `docker-compose.yml` | Local development with PostgreSQL and Redis |

## What gets installed

### Cursor rules (`.cursor/rules/`)

| Rule | Description |
|------|-------------|
| `general.mdc` | General conventions, dotenv, Docker Compose |
| `typescript.mdc` | TypeScript conventions, Zod validation |
| `python.mdc` | Python conventions, Pydantic validation |
| `react.mdc` | React patterns, brutalist UI style |
| `tailwind.mdc` | Tailwind CSS conventions, brutalist defaults |
| `nextjs.mdc` | Next.js App Router conventions |
| `fastify.mdc` | Fastify API conventions |
| `drizzle.mdc` | Drizzle ORM patterns (PostgreSQL) |
| `sqlalchemy.mdc` | SQLAlchemy patterns (PostgreSQL, async) |
| `vite.mdc` | Vite SPA conventions |

### Config files

| File | Description |
|------|-------------|
| `biome.json` | TypeScript/JavaScript linting and formatting |
| `ruff.toml` | Python linting and formatting |
| `tsconfig.json` | Strict TypeScript settings (API presets) |
| `.gitignore` | Standard ignores (Node.js or Python) |
| `render.yaml` | Render Blueprint for deployment |

## Default UI style

All frontend presets use a **brutalist design** by default:

- Black background (`bg-black`)
- White text and accents (`text-white`, `border-white`)
- No rounded corners (`rounded-none`)
- No gradients
- Required footer with Render docs and GitHub links

## Example project structures

### Preset: `next-fullstack`

```
my-app/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── db/
│       ├── index.ts
│       └── schema.ts
├── .cursor/rules/
├── render.yaml
└── package.json
```

### Composable: Frontend + API + Worker

```
my-project/
├── frontend/           # Next.js
│   ├── src/
│   └── package.json
├── node-api/           # Fastify
│   ├── src/
│   └── package.json
├── worker-ts/          # Background worker
│   ├── src/
│   └── package.json
├── .cursor/rules/
└── render.yaml
```

## Development

```bash
# Clone the repo
git clone https://github.com/render-examples/render-demo.git
cd render-demo

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Test locally
npm link
render-demo init
```

## Publishing

```bash
# Authenticate (one-time)
npm login --registry=https://npm.pkg.github.com

# Publish
npm version patch  # or minor/major
npm publish
```

## Adding new presets

Edit `templates/presets.json`:

```json
{
  "presets": {
    "my-new-preset": {
      "name": "My New Preset",
      "description": "Description here",
      "rules": ["general", "typescript"],
      "configs": ["biome", "tsconfig", "gitignore-node"],
      "packageManager": "npm",
      "blueprint": {
        "services": [
          {
            "type": "web",
            "runtime": "node",
            "buildCommand": "npm install && npm run build",
            "startCommand": "npm start"
          }
        ]
      }
    }
  }
}
```

Then publish a new version.

## Adding new components

Edit the `components` section in `templates/presets.json`:

```json
{
  "components": {
    "apis": {
      "my-api": {
        "name": "My API",
        "description": "Description here",
        "subdir": "my-api",
        "runtime": "node",
        "rules": ["typescript"],
        "configs": ["biome"],
        "blueprint": {
          "type": "web",
          "runtime": "node",
          "buildCommand": "npm install",
          "startCommand": "npm start"
        }
      }
    }
  }
}
```

## License

MIT
