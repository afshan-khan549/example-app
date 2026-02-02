# ---------- BUILD STAGE ----------
FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npx nx build api

# ---------- PRODUCTION STAGE ----------
FROM node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system api && \
    adduser --system -G api api

COPY --from=builder /app/dist/apps/api ./api

RUN npm --prefix api --omit=dev install

RUN chown -R api:api .
USER api

EXPOSE 3000
CMD ["node", "api/main.js"]
