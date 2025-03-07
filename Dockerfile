# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma Client inside the Docker container
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose application port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]