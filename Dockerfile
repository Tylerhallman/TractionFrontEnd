FROM node:22-alpine
WORKDIR /index

COPY . .
RUN npm install

ENTRYPOINT ["node", "/index/index.js"]
