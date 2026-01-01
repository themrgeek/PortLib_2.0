FROM node:20-slim

WORKDIR /app/backend

# Copy service package.json to the backend root for installation
# This ensures shared/ can find node_modules in a parent directory
COPY services/books-service/package.json .
RUN npm install

# Copy service code and shared code maintaining relative structure
COPY services/books-service/ ./services/books-service/
COPY shared/ ./shared/

WORKDIR /app/backend/services/books-service

EXPOSE 8003

CMD ["npm", "start"]

