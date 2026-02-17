# Blueprint patterns reference

This document describes how to generate `render.yaml` Blueprints using composable fragments, plus validation and multi-service merging guidance.

All examples use `{{PROJECT_NAME}}` as a placeholder—replace it with the actual project name.

## How Blueprint generation works

Blueprints are assembled using the [Fragments API](https://render-fragments.onrender.com). Instead of manually composing templates, you:

1. Call `POST https://render-fragments.onrender.com/v1/compose` with a recipe name or capabilities list
2. The API loads fragments, applies framework overrides, and wires services together
3. Write the response `blueprint` object as `render.yaml`
4. Validate

For add mode or custom adaptations, fetch individual fragments via `GET /v1/fragments/{category}/{name}` and merge manually.

## Validation

Always validate the generated `render.yaml` if the Render CLI is installed:

```bash
render blueprint validate --path render.yaml
```

- If the command succeeds, the Blueprint is valid.
- If it fails, read the error output carefully. Common issues:
  - Missing required fields (`name`, `type`, `runtime`)
  - Invalid `type` values (must be `web`, `worker`, `cron`, `pserv`, `keyvalue`)
  - Invalid `runtime` values (must be `node`, `python`, `go`, `rust`, `ruby`, `docker`, `elixir`, `static`, `image`)
  - Key Value services missing `ipAllowList`
  - YAML syntax errors (indentation, missing colons)
- Fix the issues and re-run validation until it passes.
- If the Render CLI isn't installed, skip validation.

## Schema reference

The full render.yaml JSON Schema is hosted at:

```
https://render.com/schema/render.yaml.json
```

The official Blueprint spec documentation:

```
https://render.com/docs/blueprint-spec
```

Use these as the source of truth for field names, types, and allowed values.

---

## Top-level render.yaml structure

```yaml
# Single-service (flat structure)
services: []     # web, worker, pserv, cron, keyvalue
databases: []    # PostgreSQL only

# Multi-service (project structure)
projects:
  - name: {{PROJECT_NAME}}
    environments:
      - name: production
        services: []
        databases: []
```

**Key rules:**
- `services` contains ALL non-PostgreSQL resources (including Key Value stores)
- `databases` contains ONLY PostgreSQL instances
- Use flat structure for single-service projects
- Switch to `projects`/`environments` when adding a second service

---

## Fragment-based service patterns

Each pattern below shows the **fragment** to fetch from the API and the **framework override** applied by the recipe.

### Web services

| Framework | Fragment | Key overrides |
|-----------|----------|---------------|
| Fastify | [`services/web-service-node`](https://render-fragments.onrender.com/v1/fragments/services/web-service-node) | healthCheckPath: `/health`, PORT: `10000`, HOST: `0.0.0.0` |
| Express | [`services/web-service-node`](https://render-fragments.onrender.com/v1/fragments/services/web-service-node) | healthCheckPath: `/health`, PORT: `10000`, HOST: `0.0.0.0` |
| Hono | [`services/web-service-node`](https://render-fragments.onrender.com/v1/fragments/services/web-service-node) | healthCheckPath: `/health`, PORT: `10000`, HOST: `0.0.0.0` |
| FastAPI | [`services/web-service-python`](https://render-fragments.onrender.com/v1/fragments/services/web-service-python) | startCommand: `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Django | [`services/web-service-python`](https://render-fragments.onrender.com/v1/fragments/services/web-service-python) | buildCommand includes `collectstatic` + `migrate`, startCommand: `gunicorn`, extra: `SECRET_KEY` generateValue |
| Next.js SSR | [`services/web-service-node`](https://render-fragments.onrender.com/v1/fragments/services/web-service-node) | healthCheckPath: `/`, startCommand: `npm start` |
| Remix | [`services/web-service-node`](https://render-fragments.onrender.com/v1/fragments/services/web-service-node) | healthCheckPath: `/api/health` |
| SvelteKit | [`services/web-service-node`](https://render-fragments.onrender.com/v1/fragments/services/web-service-node) | startCommand: `node build`, healthCheckPath: `/api/health` |

### Static sites

| Framework | Fragment | Key overrides |
|-----------|----------|---------------|
| Next.js static | [`services/static-site`](https://render-fragments.onrender.com/v1/fragments/services/static-site) | staticPublishPath: `out` |
| Vite | [`services/static-site`](https://render-fragments.onrender.com/v1/fragments/services/static-site) | staticPublishPath: `dist` |
| Astro | [`services/static-site`](https://render-fragments.onrender.com/v1/fragments/services/static-site) | staticPublishPath: `dist` |

**Important:** Static sites use `type: web` with `runtime: static` — NOT a separate type.

### Background tasks

| Type | Fragment | Key overrides |
|------|----------|---------------|
| Worker (Node.js) | [`services/worker-node`](https://render-fragments.onrender.com/v1/fragments/services/worker-node) | — |
| Worker (Python) | [`services/worker-python`](https://render-fragments.onrender.com/v1/fragments/services/worker-python) | — |
| Cron (Node.js) | [`services/cron-node`](https://render-fragments.onrender.com/v1/fragments/services/cron-node) | schedule: `"0 * * * *"` |
| Cron (Python) | [`services/cron-python`](https://render-fragments.onrender.com/v1/fragments/services/cron-python) | schedule: `"0 * * * *"` |
| Workflow (Node.js) | [`services/worker-node`](https://render-fragments.onrender.com/v1/fragments/services/worker-node) | extra: `RENDER_WORKFLOW_AUTO_START: true` |
| Workflow (Python) | [`services/worker-python`](https://render-fragments.onrender.com/v1/fragments/services/worker-python) | extra: `RENDER_WORKFLOW_AUTO_START: true` |

---

## Database and cache patterns

### PostgreSQL

Fragment: [`databases/postgres`](https://render-fragments.onrender.com/v1/fragments/databases/postgres)

```yaml
databases:
  - name: {{PROJECT_NAME}}-db
    plan: free
```

**Databases live under the top-level `databases` key, NOT under `services`.**

To connect a service to the database, add to the service's `envVars`:

```yaml
      - key: DATABASE_URL
        fromDatabase:
          name: {{PROJECT_NAME}}-db
          property: connectionString
```

### Key Value (Redis-compatible)

Fragment: [`services/keyvalue`](https://render-fragments.onrender.com/v1/fragments/services/keyvalue)

```yaml
services:
  - type: keyvalue
    name: {{PROJECT_NAME}}-kv
    plan: free
    maxmemoryPolicy: allkeys-lru
    ipAllowList: []
```

**Key Value is a service with `type: keyvalue`, NOT a database. The `ipAllowList` field is required** — set to `[]` for internal-only access, or `[{ source: "0.0.0.0/0" }]` for public.

To connect a service to Key Value, add to the service's `envVars`:

```yaml
      - key: REDIS_URL
        fromService:
          name: {{PROJECT_NAME}}-kv
          type: keyvalue
          property: connectionString
```

---

## Env var wiring reference

How services reference each other in render.yaml:

```yaml
# Reference a PostgreSQL database
- key: DATABASE_URL
  fromDatabase:
    name: my-db
    property: connectionString    # also: host, port, user, password, database

# Reference a Key Value store
- key: REDIS_URL
  fromService:
    name: my-kv
    type: keyvalue
    property: connectionString    # also: host, port, hostport

# Reference a private service
- key: SERVICE_HOST
  fromService:
    name: my-pserv
    type: pserv
    property: host                # also: port, hostport

# Reference another service's env var
- key: SHARED_SECRET
  fromService:
    name: my-service
    type: web
    envVarKey: MY_SECRET

# Generate a random value
- key: SECRET_KEY
  generateValue: true
```

---

## Multi-service patterns

When combining multiple services in one Blueprint, use the `projects`/`environments` structure to group services, databases, and caches under a single project. Use `rootDir` to point each service to its subdirectory.

```yaml
projects:
  - name: {{PROJECT_NAME}}
    environments:
      - name: production
        services:
          - type: web
            runtime: node
            name: {{PROJECT_NAME}}-node-api
            repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
            rootDir: node-api
            plan: free
            buildCommand: npm install && npm run build
            startCommand: npm run start
            healthCheckPath: /health
            envVars:
              - key: NODE_ENV
                value: production
              - key: DATABASE_URL
                fromDatabase:
                  name: {{PROJECT_NAME}}-db
                  property: connectionString

          - type: web
            runtime: python
            name: {{PROJECT_NAME}}-python-api
            repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
            rootDir: python-api
            plan: free
            buildCommand: pip install -r requirements.txt
            startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
            healthCheckPath: /health
            envVars:
              - key: PYTHON_VERSION
                value: "3.13"
              - key: DATABASE_URL
                fromDatabase:
                  name: {{PROJECT_NAME}}-db
                  property: connectionString

        databases:
          - name: {{PROJECT_NAME}}-db
            plan: free
```

Key rules for multi-service Blueprints:

- Use `projects` → `environments` to group all resources under one project
- Each service must have a unique `name`
- Use `rootDir` when services live in subdirectories
- All services share the same `repo` URL
- `databases` and Key Value instances go inside the same environment as the services that reference them
- Any service in the environment can reference shared resources (e.g., `{{PROJECT_NAME}}-db`)
- Single-service Blueprints can use the flat root-level `services`/`databases` structure — switch to `projects`/`environments` when adding a second service

---

## Merging into an existing render.yaml

When adding a component to an existing project (add mode), merge the new service into the existing `render.yaml` instead of overwriting it.

### Steps

1. **Read the existing `render.yaml`** and note what's already defined: services, databases, caches, and whether it uses `projects`/`environments` or the flat structure.
2. **Convert to `projects`/`environments`** if the existing file uses the flat `services`/`databases` structure. When adding a second service, the Blueprint should use the `projects`/`environments` structure.
3. **Fetch the fragment** from the [Fragments API](https://render-fragments.onrender.com/v1/fragments) for the new component: `GET /v1/fragments/{category}/{name}`.
4. **Append the new service** to the environment's `services` array. Give it a unique name by appending a suffix (e.g., `{{PROJECT_NAME}}-python-api`, `{{PROJECT_NAME}}-worker`).
5. **Add `rootDir`** to the new service entry pointing to its subdirectory (e.g., `rootDir: python-api`). Also add `rootDir` to the existing service if it didn't have one before.
6. **Reuse existing resources:**
   - If the environment already has a `databases` section and the new service needs a database, reference the existing database name in the new service's `DATABASE_URL` env var (use `fromDatabase` with the existing database name). Do not create a duplicate.
   - Same for Key Value — if a `keyvalue` service already exists, reference it instead of adding another.
7. **Add new resources** only if they don't already exist. For example, if the new service needs PostgreSQL and there is no `databases` section, add one inside the environment.
8. **Validate** the merged result:

```bash
render blueprint validate --path render.yaml
```

---

## Adaptation guidance

When the user's project doesn't exactly match a recipe:

1. **Start from the closest fragment** (fetch from the [Fragments API](https://render-fragments.onrender.com/v1/fragments)) and apply custom overrides
2. **Add or remove services** as needed
3. **Adjust environment variables** for the user's specific setup
4. **Change build/start commands** if the project uses different tooling
5. **Add `rootDir`** if the service lives in a subdirectory of a monorepo
6. **Always validate** the result with `render blueprint validate`

Common adaptations:

| Change | What to modify |
|--------|---------------|
| Add database | Fetch [`databases/postgres`](https://render-fragments.onrender.com/v1/fragments/databases/postgres) + add `DATABASE_URL` fromDatabase envVar |
| Add Key Value | Fetch [`services/keyvalue`](https://render-fragments.onrender.com/v1/fragments/services/keyvalue) + add `REDIS_URL` fromService envVar |
| Change port | Update `PORT` env var value |
| Monorepo | Add `rootDir` to each service |
| Multi-service | Convert to `projects`/`environments` structure |
| Custom domain | Add `domains` array to the service |
| Auto-deploy off | Add `autoDeploy: false` to the service |
| Different plan | Change `plan` from `free` to `starter`, `standard`, etc. |
