# Frontend - Flutter web (multi-stage: build then serve with nginx)
# Stage 1: Build Flutter web
FROM ghcr.io/cirruslabs/flutter:stable AS builder

WORKDIR /app

# Enable web and install dependencies
RUN flutter config --enable-web
COPY pubspec.yaml pubspec.lock ./
RUN flutter pub get

# Copy source and build web
COPY . .
RUN flutter build web --release

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built app from builder
COPY --from=builder /app/build/web /usr/share/nginx/html

# Optional: custom nginx config if needed (e.g. SPA fallback)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
