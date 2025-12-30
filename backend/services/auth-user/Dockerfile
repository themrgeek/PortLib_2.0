FROM node:22-alpine

WORKDIR /app/backend

# Copy service package.json to the backend root for installation
# This ensures shared/ can find node_modules in a parent directory
COPY services/auth-user/package.json .
RUN npm install

# Copy service code and shared code maintaining relative structure
COPY services/auth-user/ ./services/auth-user/
COPY shared/ ./shared/

WORKDIR /app/backend/services/auth-user

EXPOSE 8001

CMD ["npm", "start"]
