# Quick Deployment Guide

## Using Existing PostgreSQL Database

The main `docker-compose.yml` is configured to use your **existing PostgreSQL** database running in Portainer.

### Current Configuration:
- **Database Host**: `192.168.1.4` (your existing PostgreSQL server)
- **Database Port**: `5432`
- **Database Name**: `productivity-hub`
- **App Port**: `3070`

### Deploy in Portainer:

1. **Navigate to Stacks** → **+ Add stack**

2. **Name**: `productivity-hub`

3. **Build Method**: Choose one:
   - **Git Repository**: Paste your repo URL
   - **Web Editor**: Copy contents of `docker-compose.yml`

4. **Environment Variables** (in Portainer):
   ```
   DB_HOST=192.168.1.4
   DB_PORT=5432
   DB_NAME=productivity-hub
   DB_USER=admin
   DB_PASSWORD=epaps0991g
   PORT=3070
   ```
   
   > **Note**: These match your existing database configuration

5. **Click "Deploy the stack"**

6. **Wait for build** (~3-5 minutes first time)

7. **Access your app**: `http://your-server:3070`

### What Gets Deployed:

✅ **Only the Node.js application**
- Connects to your existing PostgreSQL at `192.168.1.4`
- No new database container created
- Runs on port 3070
- Production optimized build

### Database Tables:

The app will automatically create these tables if they don't exist:
- `notes`
- `links`
- `tasks`
- `expenses`

### Troubleshooting:

**Cannot connect to database?**
- Verify PostgreSQL is running in Portainer
- Check if `192.168.1.4` is accessible from the app container
- Verify database credentials match your PostgreSQL setup
- Check PostgreSQL allows connections from Docker network

**Port already in use?**
- Change `PORT=3070` to another value in environment variables
- Update both the PORT variable and the port mapping

**Need logs?**
```bash
# In Portainer: Containers → productivity-hub-app → Logs
# Or via CLI:
docker logs productivity-hub-app -f
```

## Alternative: Full Stack Deployment

If you want to deploy with a **new dedicated PostgreSQL** instance:

1. Use `docker-compose.full.yml` instead:
   ```bash
   # Rename it or specify it in Portainer
   docker-compose -f docker-compose.full.yml up -d
   ```

2. This will create:
   - New PostgreSQL container
   - App container
   - Persistent volume for database
   - Internal network

## Files Overview:

- **`docker-compose.yml`**: App only (uses existing DB) ← **USE THIS**
- **`docker-compose.full.yml`**: App + PostgreSQL (new DB)
- **`Dockerfile`**: Application build instructions
- **`.dockerignore`**: Files to exclude from build
- **`vite.config.prod.ts`**: Production build configuration

## Health Checks:

The app includes health monitoring:
- **Endpoint**: `http://localhost:3070/api/notes`
- **Interval**: Every 30 seconds
- **Status**: Check in Portainer Containers view

## Next Steps:

1. Deploy the stack
2. Check logs for "Connected to PostgreSQL database"
3. Verify tables are created
4. Test the app in browser
5. Configure reverse proxy (Nginx/Traefik) for HTTPS if needed

## Updates:

To update the application:
```bash
# Pull latest code
git pull

# In Portainer: Stacks → productivity-hub → Editor → Pull and Redeploy
# Or via CLI:
docker-compose pull
docker-compose up -d --build
```

---

**Quick Start Command** (if SSH access):
```bash
cd /path/to/productivity-hub
docker-compose up -d --build
```

Access at: **http://your-server:3070** 🚀
