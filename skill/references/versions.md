# Package versions reference

Use these version ranges when installing dependencies. Pin to the major version with `^` to allow patch and minor updates.

Update this file when adopting new major versions.

## Runtimes

| Runtime | Version |
|---------|---------|
| Node.js | Don't pin — use Render's default (22) |
| Python | 3.14 |
| Go | 1.25 |
| Ruby | 3.4 |
| Elixir | 1.18 |
| Rust | stable |

## Frameworks and create commands

| Package | Version | Install |
|---------|---------|---------|
| Next.js | ^16 | `npx create-next-app@latest` |
| Vite | latest | `npm create vite@latest` |
| Remix (React Router) | ^7 | `npx create-react-router@latest` |
| Astro | ^5 | `npm create astro@latest` |
| SvelteKit | ^2 | `npx sv create` |
| Nuxt | ^3 | `npx nuxi@latest init` |
| Docusaurus | ^3 | `npx create-docusaurus@latest` |
| Fastify | ^5 | `npm install fastify@^5` |
| Express | ^5 | `npm install express@^5` |
| Hono | ^4 | `npm install hono@^4` |
| NestJS | ^11 | `npx @nestjs/cli@latest new` |
| FastAPI | ^0.128 | `pip install fastapi>=0.128` |
| Flask | ^3 | `pip install flask>=3` |
| Django | ^5.1 | `pip install django>=5.1,<6` |
| Rails | ^8 | `gem install rails && rails new` |
| Phoenix | ^1.7 | `mix phx.new` |
| Gin | latest | `go get github.com/gin-gonic/gin` |

## Node.js dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `fastify` | ^5 | |
| `@fastify/cors` | latest | Follows Fastify major |
| `@fastify/env` | latest | Follows Fastify major |
| `express` | ^5 | |
| `cors` | latest | CORS middleware for Express |
| `hono` | ^4 | |
| `@hono/node-server` | latest | Node.js adapter for Hono |
| `@nestjs/core` | ^11 | NestJS core |
| `@nestjs/common` | ^11 | NestJS common |
| `@nestjs/platform-express` | ^11 | NestJS Express adapter |
| `@nestjs/typeorm` | latest | TypeORM integration for NestJS |
| `typeorm` | latest | ORM for NestJS projects |
| `pg` | latest | PostgreSQL driver for TypeORM |
| `class-validator` | latest | DTO validation for NestJS |
| `class-transformer` | latest | DTO transformation for NestJS |
| `@sveltejs/adapter-node` | latest | SvelteKit Node.js adapter |
| `drizzle-orm` | ^0.45 | Still pre-1.0 |
| `drizzle-kit` | latest | Matches drizzle-orm |
| `zod` | latest | |
| `postgres` | latest | postgres.js driver |

## Node.js dev dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `typescript` | ^5 | |
| `@types/node` | latest | Matches Node.js version |
| `@types/express` | latest | Only for Express projects |
| `@nestjs/cli` | latest | NestJS CLI (dev only) |
| `tsx` | latest | |
| `@biomejs/biome` | ^2 | |
| `tailwindcss` | ^4 | CSS-first config |
| `@tailwindcss/vite` | ^4 | Matches tailwindcss |
| `@tailwindcss/typography` | latest | |

## Python dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `fastapi` | >=0.128 | |
| `uvicorn[standard]` | latest | |
| `flask` | >=3 | |
| `gunicorn` | latest | WSGI server for Django/Flask |
| `django` | >=5.1,<6 | |
| `django-environ` | latest | Environment variable handling |
| `whitenoise` | latest | Static file serving |
| `sqlalchemy` | ^2 | |
| `psycopg2-binary` | latest | |
| `pydantic` | ^2 | |
| `pydantic-settings` | latest | Matches Pydantic major |
| `python-dotenv` | latest | |
| `alembic` | latest | |
| `flask-sqlalchemy` | latest | SQLAlchemy integration for Flask |
| `flask-migrate` | latest | Alembic migrations for Flask |

## Go dependencies

| Package | Module path | Notes |
|---------|------------|-------|
| Gin | `github.com/gin-gonic/gin` | HTTP framework |
| pgx | `github.com/jackc/pgx/v5` | PostgreSQL driver |
| godotenv | `github.com/joho/godotenv` | .env file loading |

## Ruby dependencies

| Gem | Version | Notes |
|-----|---------|-------|
| `rails` | ~> 8.0 | |
| `pg` | latest | PostgreSQL adapter |
| `puma` | latest | Web server |

## Elixir dependencies

| Package | Version | Notes |
|---------|---------|-------|
| `phoenix` | ~> 1.7 | |
| `phoenix_ecto` | ~> 4.6 | Ecto integration |
| `ecto_sql` | ~> 3.12 | SQL adapter |
| `postgrex` | latest | PostgreSQL driver |

## Render SDK

| Package | Version | Notes |
|---------|---------|-------|
| `render_sdk` (Python) | ^0.2.0 | Workflows — early access, expect breaking changes |
| `@renderinc/sdk` (TypeScript) | ^0.2.1 | Workflows — early access, expect breaking changes |

## How to use

When the agent runs install commands, append the version range from this table:

- **npm:** `npm install fastify@^5 drizzle-orm@^0.45`
- **pip:** Pin in `requirements.txt` with `fastapi>=0.128` or `sqlalchemy>=2,<3`
- **"latest"** means don't pin — just use the bare package name
