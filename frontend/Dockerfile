FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN addgroup app && adduser -S -G app app
USER app

EXPOSE 3000

CMD ["npm", "start"]