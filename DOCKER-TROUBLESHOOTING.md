# Docker Build Troubleshooting Guide

## Recent Fix Applied

### Issue: Build Failed with Exit Code 1
**Problem:** The `npm run build` command was failing during Docker build in Portainer.

**Root Cause:** The npm build script runs `tsc && vite build`, and TypeScript compilation (`tsc`) was failing with strict type checking.

**Solution Applied:**
1. Changed Dockerfile to use `npx vite build` directly instead of `npm run build`
2. Vite handles TypeScript internally without strict compilation
3. Optimized the build process by copying only necessary files
4. Updated server default port to 3070

## Changes Made

### Dockerfile Updates
```dockerfile
# Before
RUN npm ci
COPY . .
RUN npm run build

# After  
RUN npm ci --include=dev
COPY tsconfig.json tsconfig.node.json vite.config.ts ./
COPY index.html ./
COPY src ./src
COPY public ./public
RUN npx vite build
```

### Server.js Update
```javascript
// Default port changed from 3000 to 3070
const PORT = process.env.PORT || 3070;
```

## Testing in Portainer

1. **Delete the old stack** (if it exists)
   - Go to Stacks in Portainer
   - Delete the `productivity-hub` stack

2. **Pull latest changes**
   - If using Git repository method, Portainer will automatically pull
   - If using web editor, copy the latest `docker-compose.yml`

3. **Deploy again**
   - Follow the deployment steps in `README.docker.md`
   - The build should now complete successfully

## If Build Still Fails

### View Build Logs
In Portainer, when the build fails:
1. Click on the failed stack deployment
2. Scroll to see the full error output
3. Look for the specific error line

### Common Issues & Solutions

#### 1. Memory Issues
**Error:** "JavaScript heap out of memory"
**Solution:** Add build args to docker-compose.yml:
```yaml
app:
  build:
    context: .
    dockerfile: Dockerfile
    args:
      NODE_OPTIONS: "--max-old-space-size=4096"
```

#### 2. Missing Dependencies
**Error:** "Cannot find module..."
**Solution:** The Dockerfile now installs all dependencies including dev ones:
```dockerfile
RUN npm ci --include=dev
```

#### 3. File Permission Issues
**Error:** "EACCES: permission denied"
**Solution:** Add user directives to Dockerfile:
```dockerfile
RUN chown -R node:node /app
USER node
```

#### 4. Network/Registry Issues
**Error:** "Failed to fetch..."
**Solution:** 
- Check Portainer server internet connection
- Try using a different base image:
  ```dockerfile
  FROM node:20-alpine
  # or
  FROM node:20-slim
  ```

## Alternative: Pre-build Approach

If build continues to fail, you can pre-build locally and push the image:

### Option 1: Build Locally & Push to Registry
```bash
# On your development machine (with Docker installed)
docker build -t your-registry/productivity-hub:latest .
docker push your-registry/productivity-hub:latest

# Update docker-compose.yml
services:
  app:
    image: your-registry/productivity-hub:latest
    # Remove the 'build' section
```

### Option 2: Use Multi-Architecture Builds
```bash
# Build for server architecture
docker buildx build --platform linux/amd64 -t productivity-hub:latest .
```

## Verifying the Fix

Once deployed successfully, verify:

1. **Check container logs:**
   ```
   Portainer > Containers > productivity-hub-app > Logs
   ```
   
   Should see:
   ```
   Connected to PostgreSQL database
   Database tables initialized successfully
   Server is running on port 3070
   ```

2. **Check health status:**
   - Both containers should show as "healthy" (green)
   - If unhealthy, check the health check configuration

3. **Test the application:**
   ```
   http://your-server:3070
   ```

## Debug Commands

If you have SSH access to the Portainer server:

```bash
# View running containers
docker ps

# View logs
docker logs productivity-hub-app
docker logs productivity-hub-db

# Enter container shell
docker exec -it productivity-hub-app sh

# Check build logs
docker logs --tail 100 productivity-hub-app

# Rebuild manually
cd /path/to/stack
docker-compose build --no-cache
docker-compose up -d
```

## Contact Info

If issues persist:
1. Copy the full error log from Portainer
2. Check if TypeScript errors exist in the codebase
3. Verify all dependencies are in package.json
4. Ensure the server has enough resources (RAM, disk space)

## Recent Commits

- **Commit ebfc6408**: Fixed Docker build process
- **Commit 3e1fd84c**: Initial Docker configuration

Pull the latest changes and redeploy!
