# render-create

An AI agent skill that scaffolds applications for deployment on [Render](https://render.com), with best-practice project structure, linting, Cursor rules, and `render.yaml` Infrastructure as Code Blueprints.

## How it works

This is a **pure skill**—markdown instructions and template files that guide an AI coding agent (Cursor, Claude Code, Codex, etc.) through scaffolding a project. No CLI, no build step, no server.

1. The agent reads `skill/SKILL.md` for the orchestration workflow
2. It walks you through a category funnel: project type, framework, extras
3. It copies template files, runs shell commands, and generates a `render.yaml`
4. It validates the Blueprint with `render blueprint validate` (if the Render CLI is installed)

## Supported frameworks

### Frontends

| Framework | Preset |
|-----------|--------|
| Next.js (SSR) | `next-fullstack` |
| Next.js (static) | `next-frontend` |
| Vite + React | `vite-spa` |
| Remix (React Router v7) | `remix-fullstack` |
| Astro | `astro-static` |
| SvelteKit | `sveltekit-fullstack` |

### APIs

| Framework | Preset |
|-----------|--------|
| Fastify (Node.js) | `fastify-api` |
| Express (Node.js) | `express-api` |
| Hono (Node.js) | `hono-api` |
| FastAPI (Python) | `fastapi` |
| Django (Python) | `django` |

### Workers and infrastructure

- Background workers, cron jobs, workflows (TypeScript or Python)
- PostgreSQL, Redis

## Composable mode

Build exactly what you need by mixing components. The agent walks you through each category and asks "Need anything else?" after each one, so you can combine a Next.js frontend with a Fastify API and a cron job in one project.

## What you get

Every scaffolded project includes:

```
my-app/
├── src/                    # Application code
├── .cursor/rules/          # AI coding assistance rules
├── render.yaml             # Infrastructure as Code Blueprint
├── biome.json / ruff.toml  # Linting configuration
└── package.json            # Dependencies
```

## Installation

### Cursor

Install the skill by symlinking into your Cursor skills directory:

```bash
mkdir -p ~/.cursor/skills
ln -s /path/to/render-create-demo/skill ~/.cursor/skills/render-create
```

### Claude Code / Codex

Copy or symlink the `skill/` directory to wherever your agent reads skills from.

## Usage

Once installed, ask your AI agent:

> Create a Fastify API called my-service

The agent will walk you through the scaffolding process.

## Skill structure

```
skill/
├── SKILL.md                      # Orchestration workflow
├── references/
│   ├── presets.md                # Step-by-step for each preset
│   ├── components.md             # Step-by-step for composable components
│   ├── blueprint-patterns.md     # render.yaml patterns and validation
│   ├── cursor-rules.md          # Cursor rule selection guide
│   └── versions.md              # Package version pins
└── templates/
    ├── cursor-rules/             # .mdc rule files
    ├── configs/                  # biome.json, tsconfig, ruff.toml
    ├── fastify/, express/, hono/ # Node.js API templates
    ├── fastapi/, django/         # Python API templates
    ├── drizzle/                  # Drizzle ORM setup
    ├── next/, vite/, remix/      # Frontend overrides
    ├── astro/, sveltekit/        # Non-React frontend overrides
    ├── worker/                   # Workers, crons, workflows
    ├── render-yaml/              # render.yaml per preset
    ├── gitignore/                # .gitignore templates
    ├── assets/                   # Favicons
    └── extras/                   # env.example, docker-compose
```

## License

MIT
