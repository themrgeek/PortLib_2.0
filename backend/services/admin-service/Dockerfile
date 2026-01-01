FROM node:20-slim

WORKDIR /app/backend

# Copy service package.json to the backend root for installation
# This ensures shared/ can find node_modules in a parent directory
COPY services/admin-service/package.json .
RUN npm install

# Copy service code and shared code maintaining relative structure
COPY services/admin-service/ ./services/admin-service/
COPY shared/ ./shared/

WORKDIR /app/backend/services/admin-service

EXPOSE 8004

CMD ["npm", "start"]
