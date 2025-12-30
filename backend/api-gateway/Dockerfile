FROM node:22-alpine

WORKDIR /app

# Copy root package.json if needed, but services have their own
COPY api-gateway/package.json .
RUN npm install

# Copy service code
COPY api-gateway/ .

# Note: API Gateway doesn't currently use shared, but we can copy it if needed
# COPY shared/ ./shared/

EXPOSE 8000

CMD ["npm", "start"]
