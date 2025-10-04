# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build frontend
RUN npm run build

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
