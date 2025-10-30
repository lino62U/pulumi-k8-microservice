# Build stage
FROM node:20-bullseye AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM nginx:alpine
# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Vite genera la carpeta dist, no build
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
