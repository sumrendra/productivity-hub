# FlowSpace

Self-hosted AI productivity workspace: notes, tasks, links, finance, and assistant.

## Deploy on Portainer (labz-server)

Database and app URL defaults are in `docker-compose.yml` (labz-server / `productivity-hub` DB).

**Set only these in Portainer stack environment variables:**

| Variable | Notes |
|----------|--------|
| `BETTER_AUTH_SECRET` | Output of `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Google AI Studio key |

Optional overrides: `DB_PASSWORD`, `APP_URL`, `BETTER_AUTH_URL`, `DB_HOST`, etc.

1. Pull and redeploy the stack in Portainer (builds from Dockerfile on the server — no registry pull).
2. Open `http://192.168.1.4:3070`, register the first account (inherits existing workspace data).

Health check: `GET /api/health`
