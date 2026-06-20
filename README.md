# FlowSpace

Self-hosted AI productivity workspace: notes, tasks, links, finance, and assistant.

## Deploy on Portainer (labz-server)

1. Clone or pull this repo on the server.
2. Copy `.env.example` to `.env` and set:
   - `DB_PASSWORD`
   - `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
   - `GEMINI_API_KEY`
   - `APP_URL` and `BETTER_AUTH_URL` to your public URL (e.g. `http://192.168.1.4:3070`)
3. From the stack directory:

```bash
docker compose up -d --build
```

4. Open the app URL, register the first account (claims existing workspace data), then sign in.

Health check: `GET /api/health`
