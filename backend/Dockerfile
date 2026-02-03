# Backend - NestJS API
FROM node:20-alpine

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies (no dev for smaller image; use npm ci for reproducible builds)
RUN npm ci

# Copy source
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Run the app (production build)
CMD ["npm", "run", "start:prod"]
