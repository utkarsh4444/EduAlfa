# syntax=docker/dockerfile:1

FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
COPY frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/postcss.config.js frontend/tailwind.config.ts ./
COPY frontend/index.html ./
COPY frontend/src ./src
RUN npm ci
RUN npm run build

FROM node:20-slim AS backend-build
WORKDIR /app
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/uploads ./uploads
COPY --from=frontend-build /app/frontend/dist ./frontend/dist
RUN npm ci
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

FROM node:20-slim AS runtime
WORKDIR /app
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/prisma ./prisma
COPY --from=backend-build /app/frontend/dist ./frontend/dist
COPY --from=backend-build /app/uploads ./uploads
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]
