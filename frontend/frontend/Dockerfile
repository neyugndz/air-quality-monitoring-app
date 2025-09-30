# Step 1: Build the React app using the Node.js 18.19.1 image
FROM node:18.19.1 as build

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .
RUN npm run build

# Step 2: Use Nginx to serve the built React app
FROM nginx:alpine

# Copy the build files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx server to serve the React app
CMD ["nginx", "-g", "daemon off;"]
