FROM node:22-alpine
WORKDIR /app/backend

# Copy package files
COPY services/admin-service/package.json ./services/admin-service/package.json
COPY package.json .

# Install dependencies
RUN npm install --prefix ./services/admin-service && \
    npm install @supabase/supabase-js jsonwebtoken dotenv express cors nodemailer

# Copy code
COPY services/admin-service/ ./services/admin-service/
COPY shared/ ./shared/

WORKDIR /app/backend/services/admin-service
EXPOSE 8004
CMD ["npm", "start"]

