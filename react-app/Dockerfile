# Dockerfile - Üzenetküldő Alkalmazás

## Build stage - Frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app/react-app

COPY react-app/package*.json ./
RUN npm install

COPY react-app/ ./
RUN npm run build

## Production stage
FROM node:18-alpine
WORKDIR /app

# Install production dependencies
COPY react-app/package*.json ./
RUN npm install --only=production && npm install pg bcryptjs jsonwebtoken cors express

# Copy built frontend
COPY --from=frontend-builder /app/react-app/dist ./dist

# Copy backend
COPY react-app/src/backend ./src/backend

EXPOSE 3001

# Start server
CMD ["node", "src/backend/express.cjs"]
