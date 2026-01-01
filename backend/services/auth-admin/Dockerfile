FROM node:20-slim

WORKDIR /app/backend

# Copy service package.json to the backend root for installation
# This ensures shared/ can find node_modules in a parent directory
COPY services/auth-admin/package.json .
RUN npm install

# Copy service code and shared code maintaining relative structure
COPY services/auth-admin/ ./services/auth-admin/
COPY shared/ ./shared/

WORKDIR /app/backend/services/auth-admin

EXPOSE 8002

CMD ["npm", "start"]
