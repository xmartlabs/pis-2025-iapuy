FROM node:latest

# Set working directory
WORKDIR /

# Install dependencies first (only package*.json to leverage caching)
COPY package*.json ./

RUN npm install

# Copy source code (but in docker-compose we mount it live)
COPY . .

# Default command (overridden in docker-compose to run dev)
CMD ["npm", "start"]
