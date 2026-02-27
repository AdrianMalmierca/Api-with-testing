############################
# BUILD STAGE
############################
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


############################
# RUNTIME STAGE
############################
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Carpeta persistente para SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/database.sqlite

EXPOSE 3000

CMD ["sh", "-c", "node dist/scripts/seed.js && node dist/index.js"]