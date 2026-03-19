FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && cp -r node_modules /prod_modules
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
USER node
CMD ["node", "dist/index.js"]
