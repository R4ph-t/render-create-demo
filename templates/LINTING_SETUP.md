# Linting and formatting setup

Standard configuration for consistent code style across projects. Uses fast, Rust-based tools for both TypeScript and Python.

## Tools

| Language | Tool | Purpose |
|----------|------|---------|
| TypeScript | [Biome](https://biomejs.dev/) | Linting + formatting |
| Python | [Ruff](https://docs.astral.sh/ruff/) | Linting + formatting |

## TypeScript setup (Biome)

### 1. Create `biome.json` at project root

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": {
        "noNonNullAssertion": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  },
  "files": {
    "includes": ["src/**/*.ts", "src/**/*.tsx"]
  }
}
```

Adjust `files.includes` based on your project structure.

### 2. Add Biome to each TypeScript package

In each `package.json`:

```json
{
  "scripts": {
    "lint": "biome lint src/",
    "format": "biome format --write src/",
    "check": "biome check --write src/"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.0.0"
  }
}
```

### 3. Install and run

```bash
npm install
npm run check
```

## Python setup (Ruff)

### 1. Create `ruff.toml` at project root

```toml
# Ruff configuration for Python linting and formatting
# https://docs.astral.sh/ruff/

line-length = 100
target-version = "py312"

[lint]
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # Pyflakes
    "I",      # isort
    "B",      # flake8-bugbear
    "C4",     # flake8-comprehensions
    "UP",     # pyupgrade
    "SIM",    # flake8-simplify
]
ignore = [
    "E501",   # line too long (handled by formatter)
    "B008",   # do not perform function calls in argument defaults
    "SIM108", # ternary operator (can reduce readability)
]

[lint.isort]
known-first-party = ["your-package-name"]

[format]
quote-style = "double"
indent-style = "space"
line-ending = "auto"
```

### 2. Add Ruff to requirements

In each `requirements.txt`:

```
ruff>=0.8.0
```

### 3. Run Ruff

```bash
# Check for issues
ruff check .

# Auto-fix issues
ruff check --fix .

# Format code
ruff format .

# Or run both
ruff check --fix . && ruff format .
```

## What the tools enforce

| Category | Enforced | Examples |
|----------|----------|----------|
| Formatting | Yes | Indentation, quotes, semicolons, line length |
| Import sorting | Yes | Alphabetical, grouped by type |
| Unused code | Yes | Unused variables, unreachable code |
| Bug prevention | Yes | Type coercion issues, null checks |
| Comments | No | See [STYLE_GUIDE.md](./STYLE_GUIDE.md) |
| Function style | No | See [STYLE_GUIDE.md](./STYLE_GUIDE.md) |
| Code organization | No | See [STYLE_GUIDE.md](./STYLE_GUIDE.md) |

## Formatting defaults

| Setting | Value |
|---------|-------|
| Indentation | 2 spaces (TS), 4 spaces (Python) |
| Line length | 100 characters |
| Quotes | Double quotes |
| Semicolons | Always (TypeScript) |
| Trailing commas | Yes |

For code style conventions (comments, functions, naming, etc.), see **[STYLE_GUIDE.md](./STYLE_GUIDE.md)**.

## IDE integration

### VS Code

Install extensions:
- **Biome**: `biomejs.biome`
- **Ruff**: `charliermarsh.ruff`

Both extensions provide format-on-save and inline error highlighting.

### Cursor

Biome and Ruff extensions work the same as VS Code.

## CI integration (optional)

Add to your CI pipeline:

```yaml
# TypeScript
- name: Lint TypeScript
  run: npx @biomejs/biome check src/

# Python
- name: Lint Python
  run: |
    pip install ruff
    ruff check .
    ruff format --check .
```

## Migrating existing projects

1. Install the tools
2. Run with auto-fix enabled
3. Review changes
4. Commit

```bash
# TypeScript
npm install @biomejs/biome --save-dev
npx @biomejs/biome check --write .

# Python
pip install ruff
ruff check --fix .
ruff format .
```
