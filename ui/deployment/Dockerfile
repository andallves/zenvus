# frontend/Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Cache de dependências
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copia código e builda
COPY . .
RUN npm run build:dev

# Stage 2: Nginx com otimizações GCP
FROM nginx:alpine

# Remove config default
RUN rm /etc/nginx/conf.d/default.conf

# Copia config otimizada
COPY nginx-gcp.conf /etc/nginx/conf.d/default.conf

# Copia build
COPY --from=builder /app/dist/ui/browser /usr/share/nginx/html

# Health check para Cloud Run
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

# Metadata para GCP
LABEL maintainer="dev@zenvus.com"
LABEL version="1.0"
LABEL environment="production"

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
