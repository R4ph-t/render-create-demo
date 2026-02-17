# Presets reference

Each preset section below contains the exact steps to scaffold that project type. Follow every step in order.

In all steps, replace `{{PROJECT_NAME}}` with the actual project name the user provided.

---

## next-fullstack

**Stack:** Next.js + Tailwind + Drizzle ORM + PostgreSQL

### 1. Create the Next.js app

```bash
npx create-next-app@latest {{PROJECT_NAME}} --yes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install additional dependencies

```bash
npm install drizzle-orm zod postgres
npm install -D drizzle-kit @biomejs/biome @tailwindcss/typography
```

### 4. Add scripts to package.json

Merge these scripts into the existing `scripts` section:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

### 5. Copy template files

Copy these files from the skill's `templates/` directory to the project, replacing `{{PROJECT_NAME}}` in file contents:

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `drizzle/db-index.ts` | `src/db/index.ts` |
| `drizzle/schema.ts` | `src/db/schema.ts` |
| `drizzle/drizzle.config.ts` | `drizzle.config.ts` |
| `styles/globals.css` | `src/app/globals.css` |
| `next/layout.tsx` | `src/app/layout.tsx` |
| `next/page-fullstack.tsx` | `src/app/page.tsx` |
| `assets/favicon.png` | `src/app/icon.png` |

### 6. Delete generated files that were replaced

```bash
rm -f src/app/favicon.ico
```

### 7. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 8. Copy Cursor rules

Rules: `general`, `typescript`, `nextjs`, `tailwind`, `drizzle`, `react`

```bash
mkdir -p .cursor/rules
```

Copy each rule file from `templates/cursor-rules/<rule>.mdc` to `.cursor/rules/<rule>.mdc`.

### 9. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "next-fullstack" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 10. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## next-frontend

**Stack:** Next.js + Tailwind (static export)

### 1. Create the Next.js app

```bash
npx create-next-app@latest {{PROJECT_NAME}} --yes --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install additional dev dependencies

```bash
npm install -D @biomejs/biome @tailwindcss/typography
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `next/next.config.static.ts` | `next.config.ts` |
| `styles/globals.css` | `src/app/globals.css` |
| `next/layout.tsx` | `src/app/layout.tsx` |
| `next/page.tsx` | `src/app/page.tsx` |
| `assets/favicon.png` | `src/app/icon.png` |

### 5. Delete generated files that were replaced

```bash
rm -f src/app/favicon.ico
```

### 6. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 7. Copy Cursor rules

Rules: `general`, `typescript`, `nextjs`, `tailwind`, `react`

```bash
mkdir -p .cursor/rules
```

### 8. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "next-frontend" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 9. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## vite-spa

**Stack:** Vite + React + Tailwind (static site)

### 1. Create the Vite app

```bash
npm create vite@latest {{PROJECT_NAME}} -- --template react-ts
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install dependencies

```bash
npm install
npm install -D tailwindcss @tailwindcss/vite @tailwindcss/typography @biomejs/biome
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `vite/vite.config.ts` | `vite.config.ts` |
| `styles/globals.css` | `src/index.css` |
| `assets/favicon.svg` | `public/favicon.svg` |

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 6. Copy Cursor rules

Rules: `general`, `typescript`, `vite`, `tailwind`, `react`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "vite-spa" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## fastify-api

**Stack:** Fastify + Drizzle ORM + Zod + PostgreSQL

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Create package.json

Write this file as `package.json`:

```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "biome check .",
    "format": "biome check --write .",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 3. Install dependencies

```bash
npm install fastify @fastify/cors @fastify/env drizzle-orm zod postgres
npm install -D typescript @types/node tsx drizzle-kit @biomejs/biome
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `fastify/index.ts` | `src/index.ts` |
| `drizzle/db-index.ts` | `src/db/index.ts` |
| `drizzle/schema.ts` | `src/db/schema.ts` |
| `drizzle/drizzle.config.ts` | `drizzle.config.ts` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Create tsconfig.json

Write this file as `tsconfig.json`:

```json
{
  "extends": "./node_modules/@biomejs/biome/configuration_schema.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### 6. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` |

### 7. Copy Cursor rules

Rules: `general`, `typescript`, `fastify`, `drizzle`

```bash
mkdir -p .cursor/rules
```

### 8. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "fastify-api" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 9. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## fastapi

**Stack:** FastAPI + SQLAlchemy + Pydantic + PostgreSQL

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Create requirements.txt

Write this file as `requirements.txt`:

```
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
pydantic
pydantic-settings
python-dotenv
alembic
```

### 3. Create a virtual environment and install dependencies

```bash
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `fastapi/main.py` | `main.py` |
| `fastapi/app/__init__.py` | `app/__init__.py` |
| `fastapi/app/config.py` | `app/config.py` |
| `fastapi/app/database.py` | `app/database.py` |
| `fastapi/app/models.py` | `app/models.py` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/ruff.toml` | `ruff.toml` |
| `gitignore/python.gitignore` | `.gitignore` |

### 6. Copy Cursor rules

Rules: `general`, `python`, `sqlalchemy`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "fastapi" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
uvicorn main:app --reload
```

---

## express-api

**Stack:** Express + Drizzle ORM + Zod + PostgreSQL

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Create package.json

Write this file as `package.json`:

```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "biome check .",
    "format": "biome check --write .",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 3. Install dependencies

```bash
npm install express cors zod drizzle-orm postgres
npm install -D typescript @types/node @types/express tsx drizzle-kit @biomejs/biome
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `express/index.ts` | `src/index.ts` |
| `drizzle/db-index.ts` | `src/db/index.ts` |
| `drizzle/schema.ts` | `src/db/schema.ts` |
| `drizzle/drizzle.config.ts` | `drizzle.config.ts` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Create tsconfig.json

Write this file as `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### 6. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` |

### 7. Copy Cursor rules

Rules: `general`, `typescript`, `express`, `drizzle`

```bash
mkdir -p .cursor/rules
```

### 8. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "express-api" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 9. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## hono-api

**Stack:** Hono + Drizzle ORM + Zod + PostgreSQL

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Create package.json

Write this file as `package.json`:

```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "biome check .",
    "format": "biome check --write .",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

### 3. Install dependencies

```bash
npm install hono @hono/node-server zod drizzle-orm postgres
npm install -D typescript @types/node tsx drizzle-kit @biomejs/biome
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `hono/index.ts` | `src/index.ts` |
| `drizzle/db-index.ts` | `src/db/index.ts` |
| `drizzle/schema.ts` | `src/db/schema.ts` |
| `drizzle/drizzle.config.ts` | `drizzle.config.ts` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Create tsconfig.json

Write this file as `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

### 6. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` |

### 7. Copy Cursor rules

Rules: `general`, `typescript`, `hono`, `drizzle`

```bash
mkdir -p .cursor/rules
```

### 8. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "hono-api" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 9. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## django

**Stack:** Django + PostgreSQL

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Create requirements.txt

Write this file as `requirements.txt`:

```
django
gunicorn
psycopg2-binary
django-environ
whitenoise
```

### 3. Create a virtual environment and install dependencies

```bash
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `django/manage.py` | `manage.py` |
| `django/project/__init__.py` | `project/__init__.py` |
| `django/project/settings.py` | `project/settings.py` |
| `django/project/urls.py` | `project/urls.py` |
| `django/project/wsgi.py` | `project/wsgi.py` |
| `django/app/__init__.py` | `app/__init__.py` |
| `django/app/views.py` | `app/views.py` |
| `django/app/models.py` | `app/models.py` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Run initial migrations

```bash
python manage.py migrate
```

### 6. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/ruff.toml` | `ruff.toml` |
| `gitignore/python.gitignore` | `.gitignore` |

### 7. Copy Cursor rules

Rules: `general`, `python`, `django`

```bash
mkdir -p .cursor/rules
```

### 8. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "django" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 9. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
python manage.py runserver
```

---

## remix-fullstack

**Stack:** Remix (React Router v7) + Tailwind + Drizzle ORM + PostgreSQL

### 1. Create the Remix app

```bash
npx create-react-router@latest {{PROJECT_NAME}} --yes
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install additional dependencies

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit @biomejs/biome tailwindcss @tailwindcss/vite @tailwindcss/typography
```

### 4. Add scripts to package.json

Merge these scripts into the existing `scripts` section:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio"
}
```

### 5. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `remix/root.tsx` | `app/root.tsx` |
| `remix/home.tsx` | `app/routes/home.tsx` |
| `styles/globals.css` | `app/app.css` |
| `drizzle/db-index.ts` | `app/db/index.ts` |
| `drizzle/schema.ts` | `app/db/schema.ts` |
| `drizzle/drizzle.config.ts` | `drizzle.config.ts` |

Replace `{{PROJECT_NAME}}` in file contents.

### 6. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 7. Copy Cursor rules

Rules: `general`, `typescript`, `remix`, `tailwind`, `drizzle`, `react`

```bash
mkdir -p .cursor/rules
```

### 8. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "remix-fullstack" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 9. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## astro-static

**Stack:** Astro (static site)

### 1. Create the Astro app

```bash
npm create astro@latest {{PROJECT_NAME}} -- --template minimal --yes
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install additional dev dependencies

```bash
npm install -D @biomejs/biome
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `styles/globals.css` | `src/styles/globals.css` |
| `astro/index.astro` | `src/pages/index.astro` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 6. Copy Cursor rules

Rules: `general`, `typescript`, `astro`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "astro-static" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## sveltekit-fullstack

**Stack:** SvelteKit + Tailwind

### 1. Create the SvelteKit app

```bash
npx sv create {{PROJECT_NAME}} --template minimal --types ts
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install dependencies

```bash
npm install
npm install @sveltejs/adapter-node
npm install -D @biomejs/biome tailwindcss @tailwindcss/vite @tailwindcss/typography
```

### 4. Update svelte.config.js

Replace `@sveltejs/adapter-auto` with `@sveltejs/adapter-node`:

```javascript
import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};
```

### 5. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `sveltekit/+layout.svelte` | `src/routes/+layout.svelte` |
| `sveltekit/+page.svelte` | `src/routes/+page.svelte` |
| `styles/globals.css` | `src/app.css` |

Replace `{{PROJECT_NAME}}` in file contents.

### 6. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/biome.json` | `biome.json` |
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 7. Copy Cursor rules

Rules: `general`, `typescript`, `svelte`, `tailwind`

```bash
mkdir -p .cursor/rules
```

### 8. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "sveltekit-fullstack" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 9. Validate and initialize git

```bash
render blueprints validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## flask-api

**Stack:** Flask + SQLAlchemy + PostgreSQL

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Create requirements.txt

Write this file as `requirements.txt`:

```
flask
gunicorn
sqlalchemy
flask-sqlalchemy
flask-migrate
psycopg2-binary
python-dotenv
```

### 3. Create a virtual environment and install dependencies

```bash
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `flask/main.py` | `main.py` |
| `flask/app/__init__.py` | `app/__init__.py` |
| `flask/app/config.py` | `app/config.py` |
| `flask/app/database.py` | `app/database.py` |
| `flask/app/models.py` | `app/models.py` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `configs/ruff.toml` | `ruff.toml` |
| `gitignore/python.gitignore` | `.gitignore` |

### 6. Copy Cursor rules

Rules: `general`, `python`, `flask`, `sqlalchemy`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "flask-api" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
flask run --debug
```

---

## rails-fullstack

**Stack:** Ruby on Rails + PostgreSQL

### 1. Create the Rails app

```bash
rails new {{PROJECT_NAME}} --database=postgresql --skip-bundle --skip-test
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install dependencies

```bash
bundle install
```

### 4. Copy template files

These files override Rails defaults for Render deployment:

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `rails/database.yml` | `config/database.yml` |
| `rails/puma.rb` | `config/puma.rb` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `gitignore/ruby.gitignore` | `.gitignore` (overwrite) |

### 6. Copy Cursor rules

Rules: `general`, `rails`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "rails-fullstack" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
rails server
```

---

## phoenix-fullstack

**Stack:** Phoenix + PostgreSQL

### 1. Create the Phoenix app

```bash
mix phx.new {{PROJECT_NAME}} --no-install
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install dependencies

```bash
mix deps.get
```

### 4. Copy template files

These files override Phoenix defaults for Render deployment:

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `phoenix/runtime.exs` | `config/runtime.exs` |
| `phoenix/prod.exs` | `config/prod.exs` |

Replace `{{PROJECT_NAME}}` in file contents (use Elixir atom format, e.g., `:my_app`).

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `gitignore/elixir.gitignore` | `.gitignore` (overwrite) |

### 6. Copy Cursor rules

Rules: `general`, `phoenix`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "phoenix-fullstack" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
mix phx.server
```

---

## gin-api

**Stack:** Gin + pgx + PostgreSQL

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Initialize Go module

```bash
go mod init {{PROJECT_NAME}}
```

### 3. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `gin/main.go` | `main.go` |

Replace `{{PROJECT_NAME}}` in file contents.

### 4. Install dependencies

```bash
go get github.com/gin-gonic/gin
go get github.com/jackc/pgx/v5
go get github.com/joho/godotenv
```

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `gitignore/go.gitignore` | `.gitignore` |

### 6. Copy Cursor rules

Rules: `general`, `go`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "gin-api" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
go run main.go
```

---

## nestjs-api

**Stack:** NestJS + TypeORM + PostgreSQL

### 1. Create the NestJS app

```bash
npx @nestjs/cli@latest new {{PROJECT_NAME}} --strict --skip-git --package-manager npm
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install additional dependencies

```bash
npm install @nestjs/typeorm typeorm pg class-validator class-transformer
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `nestjs/main.ts` | `src/main.ts` |
| `nestjs/app.module.ts` | `src/app.module.ts` |
| `nestjs/data-source.ts` | `src/data-source.ts` |

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 6. Copy Cursor rules

Rules: `general`, `typescript`, `nestjs`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "nestjs-api" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run start:dev
```

---

## nuxt-fullstack

**Stack:** Nuxt SSR

### 1. Create the Nuxt app

```bash
npx nuxi@latest init {{PROJECT_NAME}}
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Install dependencies

```bash
npm install
```

### 4. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `nuxt/nuxt.config.ts` | `nuxt.config.ts` |
| `nuxt/app.vue` | `app.vue` |
| `nuxt/pages/index.vue` | `pages/index.vue` |

Replace `{{PROJECT_NAME}}` in file contents.

### 5. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 6. Copy Cursor rules

Rules: `general`, `typescript`, `nuxt`

```bash
mkdir -p .cursor/rules
```

### 7. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "nuxt-fullstack" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 8. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm run dev
```

---

## docs-site

**Stack:** Docusaurus (static site)

### 1. Create the Docusaurus app

```bash
npx create-docusaurus@latest {{PROJECT_NAME}} classic --typescript
```

### 2. Enter the project directory

```bash
cd {{PROJECT_NAME}}
```

### 3. Copy template files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `docusaurus/docusaurus.config.ts` | `docusaurus.config.ts` |

Replace `{{PROJECT_NAME}}` in file contents.

### 4. Copy config files

| Source (in templates/) | Destination (in project) |
|------------------------|--------------------------|
| `gitignore/node.gitignore` | `.gitignore` (overwrite) |

### 5. Copy Cursor rules

Rules: `general`, `typescript`

```bash
mkdir -p .cursor/rules
```

### 6. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "docs-site" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details.

### 7. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev command

```bash
npm start
```

---

## vite-fastapi

**Stack:** Vite + React frontend + FastAPI + SQLAlchemy backend + PostgreSQL

This is a composite preset that scaffolds two components in subdirectories.

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Scaffold the frontend

Follow the **vite** component steps from [components.md](components.md) to scaffold a Vite frontend into `frontend/`.

### 3. Scaffold the backend

Follow the **fastapi** component steps (with database) from [components.md](components.md) to scaffold a FastAPI backend into `python-api/`.

### 4. Copy Cursor rules

Rules: `general`, `typescript`, `vite`, `tailwind`, `react`, `python`, `sqlalchemy`

```bash
mkdir -p .cursor/rules
```

### 5. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "vite-fastapi" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details. Add `rootDir: frontend` and `rootDir: python-api` to the respective services.

### 6. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev commands

```bash
# Frontend
cd frontend && npm run dev

# Backend (in separate terminal)
cd python-api && source venv/bin/activate && uvicorn main:app --reload
```

---

## vite-go

**Stack:** Vite + React frontend + Gin (Go) backend + PostgreSQL

This is a composite preset that scaffolds two components in subdirectories.

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Scaffold the frontend

Follow the **vite** component steps from [components.md](components.md) to scaffold a Vite frontend into `frontend/`.

### 3. Scaffold the backend

Follow the **gin** component steps (with database) from [components.md](components.md) to scaffold a Gin backend into `go-api/`.

### 4. Copy Cursor rules

Rules: `general`, `typescript`, `vite`, `tailwind`, `react`, `go`

```bash
mkdir -p .cursor/rules
```

### 5. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "vite-go" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details. Add `rootDir: frontend` and `rootDir: go-api` to the respective services.

### 6. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev commands

```bash
# Frontend
cd frontend && npm run dev

# Backend (in separate terminal)
cd go-api && go run main.go
```

---

## react-express

**Stack:** Vite + React frontend + Express backend + Drizzle ORM + PostgreSQL

This is a composite preset that scaffolds two components in subdirectories.

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Scaffold the frontend

Follow the **vite** component steps from [components.md](components.md) to scaffold a Vite frontend into `frontend/`.

### 3. Scaffold the backend

Follow the **express** component steps (with database) from [components.md](components.md) to scaffold an Express backend into `node-api/`.

### 4. Copy Cursor rules

Rules: `general`, `typescript`, `vite`, `tailwind`, `react`, `express`, `drizzle`

```bash
mkdir -p .cursor/rules
```

### 5. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "react-express" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details. Add `rootDir: frontend` and `rootDir: node-api` to the respective services.

### 6. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev commands

```bash
# Frontend
cd frontend && npm run dev

# Backend (in separate terminal)
cd node-api && npm run dev
```

---

## monorepo

**Stack:** Node.js API + Worker + shared PostgreSQL

This is a composite preset that scaffolds multiple services in subdirectories.

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Scaffold the API

Follow the **fastify** component steps (with database) from [components.md](components.md) to scaffold a Fastify API into `node-api/`.

### 3. Scaffold the worker

Follow the **worker-ts** component steps from [components.md](components.md) to scaffold a TypeScript worker into `worker/`.

### 4. Copy Cursor rules

Rules: `general`, `typescript`, `fastify`, `drizzle`

```bash
mkdir -p .cursor/rules
```

### 5. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "monorepo" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details. Add `rootDir: node-api` and `rootDir: worker` to the respective services. Wire the worker's `DATABASE_URL` to the shared database.

### 6. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev commands

```bash
# API
cd node-api && npm run dev

# Worker (in separate terminal)
cd worker && npm run dev
```

---

## microservices

**Stack:** Node.js API gateway + private service + PostgreSQL + Key Value

This is a composite preset that scaffolds multiple services in subdirectories.

### 1. Create the project directory

```bash
mkdir {{PROJECT_NAME}} && cd {{PROJECT_NAME}}
```

### 2. Scaffold the API gateway

Follow the **fastify** component steps (with database) from [components.md](components.md) to scaffold a Fastify API into `gateway/`.

### 3. Scaffold the private service

Scaffold a Node.js private service into `internal/`:

1. Create `internal/` directory with `package.json` (same structure as a Fastify API)
2. Install Fastify dependencies
3. Copy template files from `fastify/index.ts`
4. The service will be deployed as a `pserv` type (no public URL)

### 4. Copy Cursor rules

Rules: `general`, `typescript`, `fastify`

```bash
mkdir -p .cursor/rules
```

### 5. Generate render.yaml

Generate `render.yaml` by calling the [Fragments API](https://render-fragments.onrender.com/docs):

```bash
curl -X POST https://render-fragments.onrender.com/v1/compose \
  -H 'Content-Type: application/json' \
  -d '{ "projectName": "{{PROJECT_NAME}}", "recipe": "microservices" }'
```

Write the response `yaml` field directly to `render.yaml`. See [blueprint-patterns.md](blueprint-patterns.md) for details. Add `rootDir: gateway` and `rootDir: internal` to the respective services. Wire the gateway's `INTERNAL_SERVICE_URL` to the private service using `fromService`.

### 6. Validate and initialize git

```bash
render blueprint validate --path render.yaml  # if Render CLI is available
git init && git add -A && git commit -m "Initial commit"
```

### Dev commands

```bash
# Gateway
cd gateway && npm run dev

# Internal service (in separate terminal)
cd internal && npm run dev
```
