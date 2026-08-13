# Operational Guide: mcp-arabic-ms-word

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `WORKSPACE_ROOT` | Absolute path to allowed workspace directory | Current working directory (`process.cwd()`) |
| `DEFAULT_FONT` | Primary Arabic font family | `Amiri` |
| `DEFAULT_DIRECTION` | Default text direction (`rtl` or `ltr`) | `rtl` |
| `DEFAULT_PAGE_SIZE` | Default page size (`A4`, `Letter`, `A3`) | `A4` |
| `DEFAULT_MARGIN_CM` | Default page margin in cm | `2.54` |
| `LOG_LEVEL` | Logging verbosity (`debug`, `info`, `warn`, `error`) | `info` |

## Operational Commands

```bash
# Lint code
npm run lint

# Check TypeScript types
npm run typecheck

# Run test suite
npm test

# Build production bundle
npm run build

# Package inspection
npm pack --dry-run
```
