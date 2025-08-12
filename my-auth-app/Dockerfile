# Step 1: Build the React app using Node
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build  # this creates the dist/ folder

# Step 2: Serve the built app using Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
