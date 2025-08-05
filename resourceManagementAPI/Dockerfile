# Base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install

COPY . .

# Expose port
EXPOSE 8082

# Start server
CMD ["npm", "start"]
