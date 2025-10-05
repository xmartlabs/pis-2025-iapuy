### Multi-stage Dockerfile for production Next.js
### Stage 1: Build the application (install deps needed for build)
FROM node:22 AS builder
WORKDIR /app

# Install all dependencies (including dev) required for building
COPY package*.json ./
# Use npm ci when lockfile present, otherwise fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build the optimized production Next.js app
COPY . .
RUN npx next build

### Stage 2: Production image
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy build output and public assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Copy package.json and install only production deps inside the runner
COPY --from=builder /app/package*.json ./
# Use npm ci when lockfile present, otherwise fallback to npm install (only prod deps)
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --production; fi

EXPOSE 3000

# Run Next.js production server on port 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
