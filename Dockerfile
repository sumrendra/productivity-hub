# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci --include=dev

# Copy all project files (respecting .dockerignore)
COPY . .

# Build frontend with Vite only (TypeScript checking happens in Vite)
RUN npx vite build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server file and built frontend
COPY server.js ./
COPY --from=frontend-builder /app/dist ./dist

# Expose the application port
EXPOSE 3070

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
