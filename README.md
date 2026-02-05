# create-render-app

CLI tool to scaffold Render projects with Cursor rules, linting configs, and templates. Supports both preset-based and composable project creation.

## Quick Start

> **Note:** While this package is pending npm publication, you can run directly from GitHub:
>
> ```bash
> npx github:render-oss/create-render-app my-app
> ```

```bash
npx create-render-app my-app
```

That's it. You'll get an interactive prompt to choose your stack, and a fully configured project ready to deploy.

## Features

- **One command setup** - Go from zero to deployed in minutes
- **Infrastructure as Code** - Auto-generated `render.yaml` Blueprint
- **AI-ready** - Cursor rules for intelligent code assistance
- **Modern stacks** - Next.js, Fastify, FastAPI, and more
- **Composable** - Mix frontends, APIs, workers, and databases
- **Best practices** - Linting, TypeScript, and sensible defaults

## Usage

```bash
# Interactive mode (recommended)
npx create-render-app my-app

# Use a preset directly
npx create-render-app my-app --preset fastify-api

# Composable mode - pick your own stack
npx create-render-app my-app --composable

# Keep existing project rules in sync
npx create-render-app sync

# Check if rules are up to date (CI-friendly)
npx create-render-app check --ci
```

## Available Presets

| Preset           | Stack                          | Database   |
| ---------------- | ------------------------------ | ---------- |
| `next-fullstack` | Next.js + Tailwind + Drizzle   | PostgreSQL |
| `next-frontend`  | Next.js + Tailwind (static)    | -          |
| `vite-spa`       | Vite + React + Tailwind        | -          |
| `fastify-api`    | Fastify + Drizzle + Zod        | PostgreSQL |
| `fastapi`        | FastAPI + SQLAlchemy           | PostgreSQL |
| `multi-api`      | Fastify + FastAPI side-by-side | -          |

## Composable Mode

Build exactly what you need by mixing components:

```bash
npx create-render-app my-app --composable
```

### Frontends

- **Next.js** - React framework with App Router
- **Vite** - Fast React SPA

### APIs

- **Fastify** - Node.js with Drizzle ORM
- **FastAPI** - Python with SQLAlchemy

### Workers

- **Background workers** - TypeScript or Python
- **Cron jobs** - Scheduled tasks
- **Workflows** - Render Workflows with SDK

### Infrastructure

- **PostgreSQL** - Managed database
- **Redis** - Managed cache

## What You Get

Every project includes:

```
my-app/
├── src/                    # Your application code
├── .cursor/rules/          # AI coding assistance rules
├── render.yaml             # Infrastructure as Code
├── biome.json / ruff.toml  # Linting configuration
└── package.json            # Dependencies
```

### Render Blueprint

The generated `render.yaml` defines your entire infrastructure:

```yaml
services:
  - type: web
    name: my-app
    runtime: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: my-app-db
          property: connectionString

databases:
  - name: my-app-db
    postgresMajorVersion: 16
```

### Cursor Rules

AI-assisted development with framework-specific guidance:

| Rule             | Description                      |
| ---------------- | -------------------------------- |
| `general.mdc`    | Project conventions and patterns |
| `typescript.mdc` | TypeScript best practices        |
| `react.mdc`      | React and component patterns     |
| `nextjs.mdc`     | Next.js App Router conventions   |
| `fastify.mdc`    | Fastify API patterns             |
| `drizzle.mdc`    | Drizzle ORM usage                |
| `workflows.mdc`  | Render Workflows SDK             |

## Deploy to Render

After scaffolding, deploy in one click:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or connect your repo to Render and it will automatically detect the `render.yaml` Blueprint.

## Commands

### `create-render-app [name]`

Create a new project. If no name is provided, you'll be prompted.

Options:

- `-p, --preset <name>` - Use a preset (skip prompts)
- `-c, --composable` - Enable composable mode
- `-y, --yes` - Accept defaults

### `create-render-app sync`

Update Cursor rules to the latest version.

Options:

- `-f, --force` - Overwrite without prompting
- `--dry-run` - Preview changes

### `create-render-app check`

Verify rules are in sync.

Options:

- `--ci` - Exit code 1 if out of sync

## Contributing

We welcome contributions! See our [contributing guide](CONTRIBUTING.md) for details.

```bash
# Clone and setup
git clone https://github.com/render-oss/create-render-app.git
cd create-render-app
npm install

# Build and test
npm run build
npm test

# Test locally
npm link
create-render-app my-test-app
```

## License

MIT - see [LICENSE](LICENSE) for details.
