# Cursor rules reference

Copy Cursor rules from `templates/cursor-rules/` into the project's `.cursor/rules/` directory.

## Rules by stack

| Rule file | Used by |
|-----------|---------|
| `general.mdc` | All projects |
| `typescript.mdc` | All TypeScript projects |
| `python.mdc` | All Python projects |
| `go.mdc` | All Go projects |
| `fastify.mdc` | Fastify API projects |
| `express.mdc` | Express API projects |
| `hono.mdc` | Hono API projects |
| `nestjs.mdc` | NestJS API projects |
| `flask.mdc` | Flask API projects |
| `rails.mdc` | Ruby on Rails projects |
| `phoenix.mdc` | Phoenix (Elixir) projects |
| `nextjs.mdc` | Next.js projects |
| `nuxt.mdc` | Nuxt projects |
| `remix.mdc` | Remix / React Router v7 projects |
| `react.mdc` | React projects (Next.js, Vite, Remix) |
| `tailwind.mdc` | Tailwind CSS projects |
| `vite.mdc` | Vite SPA projects |
| `astro.mdc` | Astro projects |
| `svelte.mdc` | SvelteKit projects |
| `django.mdc` | Django projects |
| `drizzle.mdc` | Drizzle ORM projects |
| `sqlalchemy.mdc` | SQLAlchemy projects (FastAPI/Flask + DB) |
| `workflows.mdc` | Render Workflow projects |

## Rules per preset

| Preset | Rules |
|--------|-------|
| `next-fullstack` | general, typescript, nextjs, tailwind, drizzle, react |
| `next-frontend` | general, typescript, nextjs, tailwind, react |
| `vite-spa` | general, typescript, vite, tailwind, react |
| `fastify-api` | general, typescript, fastify, drizzle |
| `express-api` | general, typescript, express, drizzle |
| `hono-api` | general, typescript, hono, drizzle |
| `nestjs-api` | general, typescript, nestjs |
| `fastapi` | general, python, sqlalchemy |
| `flask-api` | general, python, flask, sqlalchemy |
| `django` | general, python, django |
| `rails-fullstack` | general, rails |
| `phoenix-fullstack` | general, phoenix |
| `gin-api` | general, go |
| `nuxt-fullstack` | general, typescript, nuxt |
| `remix-fullstack` | general, typescript, remix, tailwind, drizzle, react |
| `astro-static` | general, typescript, astro |
| `sveltekit-fullstack` | general, typescript, svelte, tailwind |
| `docs-site` | general, typescript |
| `vite-fastapi` | general, typescript, vite, tailwind, react, python, sqlalchemy |
| `vite-go` | general, typescript, vite, tailwind, react, go |
| `react-express` | general, typescript, vite, tailwind, react, express, drizzle |
| `monorepo` | general, typescript, fastify, drizzle |
| `microservices` | general, typescript, fastify |

## How to copy

1. Create `.cursor/rules/` in the project directory
2. For each rule in the preset's list, copy `templates/cursor-rules/<rule>.mdc` to `<project>/.cursor/rules/<rule>.mdc`
3. No variable substitution is needed—rule files are copied as-is
