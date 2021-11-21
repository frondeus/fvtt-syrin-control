FROM node:17-alpine

WORKDIR /usr/src/cors

COPY package*.json ./

RUN npm install

COPY main.js .

EXPOSE 8080

CMD ["node", "main.js"]
