# @render-examples/create-demo

CLI tool to scaffold Render demo projects with Cursor rules, linting configs, and templates.

## Installation

### Team Setup (one-time)

1. Create a GitHub Personal Access Token with `read:packages` scope
2. Create or edit `~/.npmrc`:

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
@render-examples:registry=https://npm.pkg.github.com
```

### Usage

```bash
# Initialize a new project
npx @render-examples/create-demo init

# Sync local rules with the latest version
npx @render-examples/create-demo sync

# Check if rules are up to date
npx @render-examples/create-demo check
```

## Commands

### `init`

Interactive setup for new projects:

```
$ npx @render-examples/create-demo init

? Select a stack preset:
  > Next.js Full Stack (Next.js + Tailwind + Drizzle + Zod)
    Next.js Frontend (Next.js + Tailwind)
    Vite SPA (Vite + React + Tailwind)
    Fastify API (Fastify + Drizzle + Zod)
    FastAPI (FastAPI + SQLAlchemy + Pydantic)
    Custom (pick individual components)
```

Options:
- `-p, --preset <name>` - Use a preset directly (skip prompts)
- `-y, --yes` - Accept all defaults

### `sync`

Update local rules to match the latest package version:

```bash
npx @render-examples/create-demo sync
```

Options:
- `-f, --force` - Overwrite without prompting
- `--dry-run` - Show changes without applying

### `check`

Verify rules are in sync (useful in CI):

```bash
npx @render-examples/create-demo check --ci
```

Options:
- `--ci` - Exit with code 1 if out of sync

## Available Presets

| Preset | Stack |
|--------|-------|
| `next-fullstack` | Next.js + Tailwind + Drizzle + Zod |
| `next-frontend` | Next.js + Tailwind |
| `vite-spa` | Vite + React + Tailwind |
| `fastify-api` | Fastify + Drizzle + Zod |
| `fastapi` | FastAPI + SQLAlchemy + Pydantic |

## What Gets Installed

### Cursor Rules (`.cursor/rules/`)

- `general.mdc` - General conventions, latest library rules, dotenv, Docker Compose
- `typescript.mdc` - TypeScript conventions, Zod validation
- `python.mdc` - Python conventions, Pydantic validation
- `react.mdc` - React patterns + brutalist UI style + required footer
- `tailwind.mdc` - Tailwind CSS conventions, brutalist defaults
- `nextjs.mdc` - Next.js App Router conventions
- `fastify.mdc` - Fastify API conventions
- `drizzle.mdc` - Drizzle ORM patterns (PostgreSQL)
- `sqlalchemy.mdc` - SQLAlchemy patterns (PostgreSQL, async)
- `vite.mdc` - Vite SPA conventions

### Config Files

- `biome.json` - TypeScript linting/formatting
- `ruff.toml` - Python linting/formatting
- `tsconfig.base.json` - Strict TypeScript settings
- `.gitignore` - Standard ignores
- `.env.example` - Environment variables template
- `docker-compose.yml` - Multi-service template (optional)

### GitHub Templates

- `PULL_REQUEST_TEMPLATE.md`
- `ISSUE_TEMPLATE/bug_report.md`
- `ISSUE_TEMPLATE/feature_request.md`
- `CODEOWNERS`

## Default UI Style

All frontend presets use a **brutalist design** by default:
- Black background (`bg-black`)
- White text/accents (`text-white`, `border-white`)
- No rounded corners (`rounded-none`)
- No gradients
- Required footer with Render docs + GitHub links

## Development

```bash
# Clone the repo
git clone https://github.com/render-examples/create-demo.git
cd create-demo

# Install dependencies
npm install

# Build TypeScript
npm run build

# Test locally
npm link
create-demo init
```

## Publishing

```bash
# Authenticate (one-time)
npm login --registry=https://npm.pkg.github.com

# Publish
npm version patch  # or minor/major
npm publish
```

## Adding New Presets

Edit `templates/presets.json`:

```json
{
  "presets": {
    "my-new-preset": {
      "name": "My New Preset",
      "description": "Description here",
      "rules": ["general", "typescript", "..."],
      "configs": ["biome", "tsconfig", "gitignore-node"]
    }
  }
}
```

Then publish a new version.

## License

MIT
