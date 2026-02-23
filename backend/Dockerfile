FROM node:20-alpine

WORKDIR /app

# Prisma requires OpenSSL on Alpine
RUN apk add --no-cache openssl

# Install dependencies first (layer caching)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .

RUN npm run build

EXPOSE 3001

# Push schema, seed, then start server
CMD ["sh", "-c", "npx prisma db push && node dist/prisma/seed.js && node dist/src/index.js"]
