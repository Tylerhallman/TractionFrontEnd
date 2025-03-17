FROM node:22-alpine
WORKDIR /app

COPY . .
RUN npm install

ENTRYPOINT ["node", "/app/app.js"]
