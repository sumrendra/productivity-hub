# Docker Deployment Guide for Productivity Hub

This guide explains how to deploy the Productivity Hub application using Docker Compose in Portainer.

## Prerequisites

- Docker and Docker Compose installed on your server
- Portainer installed and running
- Access to Portainer web interface

## Files Created

- `docker-compose.yml` - Main orchestration file
- `Dockerfile` - Multi-stage build for the application
- `.dockerignore` - Excludes unnecessary files from build
- `.env.example` - Template for environment variables

## Deployment Steps

### Option 1: Deploy via Portainer UI

1. **Log into Portainer** at `http://your-server:9000`

2. **Navigate to Stacks**
   - Click on "Stacks" in the left sidebar
   - Click "+ Add stack"

3. **Configure the Stack**
   - Name: `productivity-hub`
   - Build method: Choose "Repository" or "Upload"

4. **If using Repository:**
   - Repository URL: Your git repository URL
   - Repository reference: `refs/heads/main` (or your branch)
   - Compose path: `docker-compose.yml`

5. **If using Upload:**
   - Copy the contents of `docker-compose.yml`
   - Paste into the web editor

6. **Environment Variables**
   - Click "Add an environment variable"
   - Add the following variables:
     ```
     DB_NAME=productivity-hub
     DB_USER=admin
     DB_PASSWORD=your_secure_password
     PORT=3070
     ```

7. **Deploy the Stack**
   - Click "Deploy the stack"
   - Wait for containers to build and start

### Option 2: Deploy via Command Line

1. **Clone your repository** (or upload files):
   ```bash
   cd /path/to/deployment
   git clone <your-repo-url>
   cd productivity-hub
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   nano .env  # Edit with your values
   ```

3. **Build and start the services**:
   ```bash
   docker-compose up -d --build
   ```

4. **Verify deployment**:
   ```bash
   docker-compose ps
   docker-compose logs -f
   ```

## Service Details

### Services

1. **postgres** (Database)
   - Image: `postgres:16-alpine`
   - Port: 5432 (internal only)
   - Volume: `postgres_data` for persistent storage
   - Health check enabled

2. **app** (Node.js Application)
   - Built from Dockerfile
   - Port: 3070 (exposed to host)
   - Depends on postgres service
   - Health check enabled

### Networks

- `productivity-network`: Bridge network for service communication

### Volumes

- `postgres_data`: Persistent storage for PostgreSQL data

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DB_NAME | productivity-hub | PostgreSQL database name |
| DB_USER | admin | PostgreSQL username |
| DB_PASSWORD | epaps0991g | PostgreSQL password (CHANGE THIS!) |
| PORT | 3070 | Application port |
| NODE_ENV | production | Node environment |

### Ports

- **3070**: Application HTTP port (mapped to host)
- You can change the host port by modifying the `.env` file

## Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Restart Services
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart app
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Access Database
```bash
docker-compose exec postgres psql -U admin -d productivity-hub
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U admin productivity-hub > backup.sql
```

### Restore Database
```bash
docker-compose exec -T postgres psql -U admin -d productivity-hub < backup.sql
```

## Monitoring in Portainer

1. **View Container Status**
   - Navigate to "Containers"
   - Check health status indicators

2. **View Logs**
   - Click on a container
   - Select "Logs" tab
   - Enable "Auto-refresh"

3. **Resource Usage**
   - Click on a container
   - Select "Stats" tab
   - Monitor CPU, Memory, Network usage

4. **Console Access**
   - Click on a container
   - Select "Console" tab
   - Click "Connect"

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Check if port is already in use
sudo lsof -i :3070

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Database connection issues
```bash
# Check if database is ready
docker-compose exec postgres pg_isready -U admin

# Check network connectivity
docker-compose exec app ping postgres
```

### Permission issues
```bash
# Check volume permissions
docker-compose exec postgres ls -la /var/lib/postgresql/data
```

### Reset everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all -v

# Start fresh
docker-compose up -d --build
```

## Security Recommendations

1. **Change default passwords**
   - Update `DB_PASSWORD` in `.env`

2. **Use secrets management**
   - Consider using Docker secrets for production

3. **Enable SSL/TLS**
   - Add a reverse proxy (Nginx/Traefik) for HTTPS

4. **Restrict network access**
   - Don't expose PostgreSQL port to host
   - Use firewall rules

5. **Regular backups**
   - Schedule automated database backups

6. **Update images regularly**
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## Accessing the Application

Once deployed, access your application at:
```
http://your-server-ip:3070
```

Or if using a domain:
```
http://your-domain.com:3070
```

## Support

For issues or questions:
- Check container logs: `docker-compose logs -f`
- Verify service health: `docker-compose ps`
- Review Portainer container stats and logs
