# Backend deployment (Render)

This service is a FastAPI app containerized with Docker.

Important notes
- The Dockerfile respects the `PORT` environment variable (Render sets this automatically).
- Render's managed containers do not support `--network host` for security reasons. If you *require* host network mode for IPv6 egress to Supabase, deploy the container on a VM or provider that supports host networking (or expose IPv6 egress via the provider's network settings). Render may provide IPv6 egress in many cases—contact Render support if IPv6 egress is required.

Required environment variables (set in Render dashboard / Environment):

- `DATABASE_URL` — SQLAlchemy connection string for Postgres (e.g. `postgresql+psycopg2://user:pass@host:5432/dbname`). If omitted, the app falls back to SQLite.
- `JWT_SECRET` — Secret key for signing JWT tokens. Set to a long random value in production.
- `SUPABASE_URL` — (optional) URL for Supabase project if using Supabase services.
- `SUPABASE_ANON_KEY` — (optional) public anon key for Supabase client usage.
- `SUPABASE_SERVICE_ROLE_KEY` — (optional) server-side service role key for privileged Supabase operations.
- `PORT` — (optional) port to listen on. Render sets this automatically; default is `8000`.

Docker build & run locally (example):

```bash
docker build -t inventrack-backend .
docker run -p 8000:8000 --env-file .env inventrack-backend
```

Render deployment
1. Create a new Web Service on Render and choose "Docker".
2. Connect your repository and select the `backend` folder as the root (or set the Dockerfile path accordingly).
3. In Environment settings, add the variables listed above.
4. Deploy. If you encounter IPv6 egress issues to Supabase, consult Render docs or consider a host that supports host-networking.
