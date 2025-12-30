FROM node:22-alpine
WORKDIR /app/backend

# Copy package files
COPY services/books-service/package.json ./services/books-service/package.json
COPY package.json .

# Install dependencies
RUN npm install --prefix ./services/books-service && \
    npm install @supabase/supabase-js jsonwebtoken dotenv express cors multer

# Copy code
COPY services/books-service/ ./services/books-service/
COPY shared/ ./shared/

WORKDIR /app/backend/services/books-service
EXPOSE 8003
CMD ["npm", "start"]

