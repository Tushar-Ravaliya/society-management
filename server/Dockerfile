# Multi-stage production build for Bun backend
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package specs and lockfiles
COPY package.json bun.lock ./

# Install dependencies with frozen lockfile
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Runner stage
FROM oven/bun:latest AS runner

WORKDIR /app

# Copy only what's needed from builder
COPY --from=builder /app /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run migrations and start the server on container launch
CMD ["bun", "run", "start"]
