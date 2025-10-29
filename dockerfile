# Dockerfile

# --- Stage 1: Build ---
# Use an official Node.js image
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code
COPY . .

# Build your app
RUN npm run build

# --- Stage 2: Production ---
# Use a smaller, more secure base image
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the builder stage
COPY package*.json ./
COPY --from=builder /app/dist ./dist

# Install *only* production dependencies
RUN npm ci --omit=dev

# Expose the port your app runs on
EXPOSE 3000

# The command to start your app
CMD ["node", "dist/main"]