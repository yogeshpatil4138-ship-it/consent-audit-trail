# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# --- Run stage ---
FROM nginx:1.27-alpine
# Files in /etc/nginx/templates are run through envsubst at start-up, so ${PORT} works
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=80
EXPOSE 80