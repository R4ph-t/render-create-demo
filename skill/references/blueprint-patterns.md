# Blueprint patterns reference

This document describes `render.yaml` patterns for every service type, plus validation and adaptation guidance.

All examples use `{{PROJECT_NAME}}` as a placeholder—replace it with the actual project name.

## Validation

Always validate the generated `render.yaml` if the Render CLI is installed:

```bash
render blueprint validate --path render.yaml
```

- If the command succeeds, the Blueprint is valid.
- If it fails, read the error output carefully. Common issues:
  - Missing required fields (`name`, `type`, `runtime`)
  - Invalid `type` values (must be `web`, `worker`, `cron`, `redis`)
  - Invalid `runtime` values (must be `node`, `python`, `go`, `rust`, `ruby`, `docker`, `elixir`, `static`, `image`)
  - YAML syntax errors (indentation, missing colons)
- Fix the issues and re-run validation until it passes.
- If the Render CLI isn't installed, skip validation. The templates in `templates/render-yaml/` are known-good patterns.

## Schema reference

The full render.yaml JSON Schema is hosted at:

```
https://render.com/schema/render.yaml.json
```

Use this as the source of truth for field names, types, and allowed values.

---

## Service patterns

### Next.js web service (SSR)

```yaml
services:
  - type: web
    runtime: node
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: {{PROJECT_NAME}}-db
          property: connectionString
```

### Next.js static site

```yaml
services:
  - type: web
    runtime: static
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    staticPublishPath: out
    envVars:
      - key: NODE_ENV
        value: production
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Vite static site

```yaml
services:
  - type: web
    runtime: static
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: NODE_ENV
        value: production
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### Node.js web service (Fastify, Express, etc.)

```yaml
services:
  - type: web
    runtime: node
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "10000"
      - key: HOST
        value: 0.0.0.0
```

### Python web service (FastAPI, Flask, etc.)

```yaml
services:
  - type: web
    runtime: python
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: PYTHON_VERSION
        value: "3.13"
```

### Django web service (gunicorn)

```yaml
services:
  - type: web
    runtime: python
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
    startCommand: gunicorn project.wsgi:application --bind 0.0.0.0:$PORT
    healthCheckPath: /health
    envVars:
      - key: PYTHON_VERSION
        value: "3.13"
      - key: SECRET_KEY
        generateValue: true
```

### Remix web service (SSR)

```yaml
services:
  - type: web
    runtime: node
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
```

### Astro static site

```yaml
services:
  - type: web
    runtime: static
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    staticPublishPath: dist
    envVars:
      - key: NODE_ENV
        value: production
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

### SvelteKit web service (adapter-node)

```yaml
services:
  - type: web
    runtime: node
    name: {{PROJECT_NAME}}
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    startCommand: node build
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
```

### Background worker (Node.js)

```yaml
services:
  - type: worker
    runtime: node
    name: {{PROJECT_NAME}}-worker
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NODE_ENV
        value: production
```

### Background worker (Python)

```yaml
services:
  - type: worker
    runtime: python
    name: {{PROJECT_NAME}}-worker
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: python worker.py
    envVars:
      - key: PYTHON_VERSION
        value: "3.13"
```

### Cron job (Node.js)

```yaml
services:
  - type: cron
    runtime: node
    name: {{PROJECT_NAME}}-cron
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm run start
    schedule: "0 * * * *"
    envVars:
      - key: NODE_ENV
        value: production
```

### Cron job (Python)

```yaml
services:
  - type: cron
    runtime: python
    name: {{PROJECT_NAME}}-cron
    repo: https://github.com/YOUR_ORG/{{PROJECT_NAME}}
    plan: free
    buildCommand: pip install -r requirements.txt
    startCommand: python cron.py
    schedule: "0 * * * *"
    envVars:
      - key: PYTHON_VERSION
        value: "3.13"
```

---

## Database and cache patterns

### PostgreSQL

```yaml
databases:
  - name: {{PROJECT_NAME}}-db
    plan: free
```

To connect a service to the database, add to the service's `envVars`:

```yaml
      - key: DATABASE_URL
        fromDatabase:
          name: {{PROJECT_NAME}}-db
          property: connectionString
```

### Redis (KeyVal)

```yaml
services:
  - type: redis
    name: {{PROJECT_NAME}}-cache
    plan: free
    maxmemoryPolicy: allkeys-lru
    ipAllowList: []
```

To connect a service to Redis, add to the service's `envVars`:

```yaml
      - key: REDIS_URL
        fromService:
          name: {{PROJECT_NAME}}-cache
          type: redis
          property: connectionString
```

---

## Multi-service patterns

When combining multiple services in one Blueprint, use `rootDir` to point each service to its subdirectory:

```yaml
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
```

Key rules for multi-service Blueprints:

- Each service must have a unique `name`
- Use `rootDir` when services live in subdirectories
- All services share the same `repo` URL
- Database and cache references work across services (any service can reference `{{PROJECT_NAME}}-db`)

---

## Adaptation guidance

When the user's project doesn't exactly match a template:

1. **Start from the closest matching template** in `templates/render-yaml/`
2. **Add or remove services** as needed
3. **Adjust environment variables** for the user's specific setup
4. **Change build/start commands** if the project uses different tooling
5. **Add `rootDir`** if the service lives in a subdirectory of a monorepo
6. **Always validate** the result with `render blueprint validate`

Common adaptations:

| Change | What to modify |
|--------|---------------|
| Add database | Add `databases` section + `DATABASE_URL` env var |
| Add Redis | Add redis service + `REDIS_URL` env var |
| Change port | Update `PORT` env var value |
| Monorepo | Add `rootDir` to each service |
| Custom domain | Add `domains` array to the service |
| Auto-deploy off | Add `autoDeploy: false` to the service |
| Different plan | Change `plan` from `free` to `starter`, `standard`, etc. |
