# Code Style Guide

Style conventions for projects. These patterns are **not enforced by tooling** and must be followed manually.

For automated linting/formatting setup, see [LINTING_SETUP.md](./LINTING_SETUP.md).

## Functions

### TypeScript: Use named functions for exports

```typescript
// Good
export function handleRequest(req: Request): Response {
  // ...
}

export async function fetchUserData(userId: string): Promise<User> {
  // ...
}

// Avoid
export const handleRequest = (req: Request): Response => {
  // ...
};
```

Arrow functions are fine for:
- Callbacks: `items.map((item) => item.id)`
- Simple internal helpers: `const clean = (s: string) => s.trim()`

### Python: Use regular function definitions

```python
# Good
def handle_request(request: Request) -> Response:
    ...

async def fetch_user_data(user_id: str) -> User:
    ...
```

## Comments and documentation

### When to add comments

Add comments **liberally to help future readers**, but focus on explaining context and reasoning rather than restating code.

```typescript
// Good: Explains WHY
const timeout = 30000; // Extended timeout for slow upstream API

// Good: Provides context
// pMap limits concurrency to avoid overwhelming the API
const results = await pMap(items, processItem, { concurrency: 5 });

// Avoid: Restates the code
const timeout = 30000; // Set timeout to 30000
```

### JSDoc / Docstrings

Add documentation **when behavior is non-obvious**. Self-explanatory functions don't need docs.

**TypeScript:**
```typescript
// Needs doc: Non-obvious behavior
/** Fetches title, trying og:title, twitter:title, then <title> tag. */
export function fetchBlogTitle(url: string): Promise<string> {
  // ...
}

// No doc needed: Self-explanatory
export function getHealthStatus(): HealthStatus {
  return { status: "ok" };
}
```

**Python:**
```python
# Needs doc: Non-obvious behavior
def fetch_blog_title(url: str) -> str:
    """Fetch title, trying og:title, twitter:title, then <title> tag."""
    ...

# No doc needed: Self-explanatory
def get_health_status() -> dict:
    return {"status": "ok"}
```

### File headers

Add a header comment **only to main entry files** (`index.ts`, `app.py`, `main.py`):

```typescript
/**
 * Project Name API
 * Entry point: server setup, middleware, and routes.
 */
```

```python
"""
Project Name API
Entry point: server setup, middleware, and routes.
"""
```

Other files should have self-explanatory names (e.g., `storage.ts`, `handlers.py`).

## Error handling

Use **both patterns** depending on context:

### Early return for validation

```typescript
export function processRequest(data: unknown): Result {
  if (!data) {
    return { error: "Data is required" };
  }
  if (!isValid(data)) {
    return { error: "Invalid data format" };
  }
  
  // Main logic here
  return { success: true, result: transform(data) };
}
```

### Try-catch for external operations

```typescript
export async function fetchData(url: string): Promise<Data> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    logFullError("Fetch failed", error);
    throw error;
  }
}
```

## Async code

### Always use async/await

```typescript
// Good
async function fetchAndProcess(url: string): Promise<Result> {
  const response = await fetch(url);
  const data = await response.json();
  return processData(data);
}

// Avoid
function fetchAndProcess(url: string): Promise<Result> {
  return fetch(url)
    .then((response) => response.json())
    .then((data) => processData(data));
}
```

## Logging

### Use prefixed log messages

Include the module/component name in brackets:

```typescript
console.log("[API] Starting server on port 8080");
console.log("[storage] Creating bucket: thumbnails");
console.error("[handler] Failed to process request:", error);
```

```python
print("[API] Starting server on port 8080")
print("[storage] Creating bucket: thumbnails")
print(f"[handler] Failed to process request: {error}")
```

## Naming

### Balanced verbosity

Names should be clear but not excessively long:

```typescript
// Good: Balanced
const accountStatus = getAccountStatus();
const blogTitle = await fetchBlogTitle(url);
const taskResult = await runTask(input);

// Too verbose
const userAccountStatusFromDatabase = getUserAccountStatusFromDatabase();

// Too terse
const s = getStatus();
const t = fetchTitle(u);
```

### Conventions by language

**TypeScript:**
- Variables/functions: `camelCase`
- Types/interfaces/classes: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

**Python:**
- Variables/functions: `snake_case`
- Classes: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

## Imports

Let **Biome (TypeScript)** and **Ruff (Python)** handle import organization automatically. Run:

```bash
# TypeScript
npm run check

# Python
ruff check --fix . && ruff format .
```

## Summary

| Aspect | Convention |
|--------|------------|
| Functions | Named exports (TS), regular defs (Python) |
| Comments | Liberal, explain WHY and context |
| Docs | Only when non-obvious |
| File headers | Only entry files |
| Error handling | Early return + try-catch |
| Async | Always async/await |
| Logging | Prefixed: `[module] message` |
| Naming | Balanced verbosity |
| Imports | Let tooling handle |
