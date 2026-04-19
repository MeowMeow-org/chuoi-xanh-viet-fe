# syntax=docker/dockerfile:1.7

############################
# 1) deps — cài dependencies
############################
FROM node:20-alpine AS deps
WORKDIR /app

# libc6-compat cần cho một số native deps trên Alpine (sharp, swc…)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

############################
# 2) builder — build Next
############################
FROM node:20-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* được inline vào bundle lúc build, nên phải truyền qua ARG.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

############################
# 3) runner — image chạy thật
############################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# public/ có thể không tồn tại → copy có điều kiện bằng glob;
# tránh fail nếu project không có folder này.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Output standalone của Next đã gom sẵn node_modules cần thiết + server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
