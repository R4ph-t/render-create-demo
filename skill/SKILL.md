---
name: render-create
description: Scaffold and configure applications for deployment on Render with best-practice project structure, linting, Cursor rules, and render.yaml Blueprints. Use when the user wants to create a new project, scaffold a demo app, generate a render.yaml, or set up Cursor rules for Render.
---

# render-create

Scaffold and configure applications for deployment on [Render](https://render.com), with best-practice project structure, linting, Cursor rules, and a `render.yaml` Infrastructure as Code Blueprint.

## Workflow

### Step 1: Understand what the user wants

If the user's request already implies a stack and name (e.g., "create a Fastify API called my-service"), confirm and proceed. Otherwise, walk through these questions one at a time.

**1. Project name**

Ask: "What should the project be called?" Valid characters: `[a-z0-9-]`

**2. What kind of project?**

| Category | What it creates |
|----------|----------------|
| **Frontend** | Static site or SPA |
| **API** | Backend service |
| **Full-stack** | Frontend + API + database (bundled) |
| **Background tasks** | Workflows, workers, or cron jobs |

**3. Which framework?**

Show only the options for the chosen category:

| Category | Frameworks |
|----------|-----------|
| Frontend | Next.js, Vite, Astro, SvelteKit |
| API | Fastify, Express, Hono, FastAPI, Django |
| Full-stack | Next.js, Remix, SvelteKit, Django |
| Background tasks | TypeScript or Python → workflow / worker / cron |

For **API** projects, also ask: "Need a database?" (adds PostgreSQL + ORM setup).

For **Frontend** projects using Next.js, ask: "Static export or server-rendered?"

**4. Need anything else?**

After scaffolding the first component, ask if the user wants to add more:

- Another API (different language/framework)
- A frontend
- A workflow, worker, or cron job
- A database or cache
- Done

Repeat until the user says "Done." This lets users compose multi-service projects naturally.

### Step 2: Scaffold the project

Read the appropriate reference doc for step-by-step instructions:

- For standard stacks → Read [references/presets.md](references/presets.md), find the matching preset, follow every step.
- For individual components → Read [references/components.md](references/components.md), follow the instructions for each selected component.

The general flow is:

1. Create the project directory
2. Run create commands or create `package.json`/`requirements.txt` manually
3. Install dependencies
4. Copy template files from `templates/`, substituting `{{PROJECT_NAME}}`
5. Copy config files (biome.json, tsconfig.json, ruff.toml)
6. Copy Cursor rules to `.cursor/rules/`
7. Generate `render.yaml` (see Step 3)
8. Initialize git: `git init && git add -A && git commit -m "Initial commit"`

**Important:**
- When copying template files, read the file from `templates/` in this skill's directory, replace `{{PROJECT_NAME}}` placeholders, and write the result to the target location.
- Before running install commands, read [references/versions.md](references/versions.md) and use the pinned version ranges.

### Step 3: Generate and validate render.yaml

Read [references/blueprint-patterns.md](references/blueprint-patterns.md) for render.yaml patterns.

1. Copy the appropriate template from `templates/render-yaml/`
2. Replace `{{PROJECT_NAME}}` with the actual project name
3. For multi-service projects, combine patterns and add `rootDir` for subdirectories
4. Validate with the Render CLI if available:

```bash
render blueprint validate --path render.yaml
```

If validation fails, fix the Blueprint and re-run until it passes. If the Render CLI isn't installed, skip validation.

### Step 4: Summarize and guide

After scaffolding, tell the user:

1. What was created (project structure, key files)
2. How to start developing (`cd <project> && npm run dev` or equivalent)
3. That the project includes a `render.yaml` Blueprint ready for deployment

Then suggest using the **render-deploy** skill to deploy the project to Render:

> Your project is ready! It includes a `render.yaml` Blueprint. When you're ready to deploy, just ask me to deploy it to Render and I'll walk you through it using the render-deploy skill.

## Templates

All template files live in `templates/` relative to this skill, organized by category:

| Directory | Contents |
|-----------|----------|
| `cursor-rules/` | `.mdc` rule files for `.cursor/rules/` |
| `configs/` | `biome.json`, `tsconfig.base.json`, `ruff.toml` |
| `render-yaml/` | One `render.yaml` per preset |
| `fastify/`, `express/`, `hono/` | Node.js API source files |
| `fastapi/`, `django/` | Python API/fullstack source files |
| `drizzle/` | Drizzle ORM setup files |
| `next/`, `vite/`, `remix/`, `astro/`, `sveltekit/` | Frontend/fullstack overrides |
| `worker/ts/`, `worker/py/` | Workflows, workers, cron jobs |
| `gitignore/` | `node.gitignore`, `python.gitignore` |
| `assets/` | Favicons |
| `extras/` | `env.example`, `docker-compose.example.yml` |

## Reference docs

- [references/presets.md](references/presets.md) — Step-by-step scaffolding for each preset
- [references/components.md](references/components.md) — Step-by-step for composable components
- [references/blueprint-patterns.md](references/blueprint-patterns.md) — render.yaml patterns and validation
- [references/cursor-rules.md](references/cursor-rules.md) — Cursor rule selection per stack
- [references/versions.md](references/versions.md) — Package version pins

## Extras

When the user asks for extras, include these optional files:

- **env** → Copy `templates/extras/env.example` to `.env.example`
- **docker** → Copy `templates/extras/docker-compose.example.yml` to `docker-compose.yml`
