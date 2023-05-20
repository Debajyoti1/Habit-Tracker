FROM node:19-alpine

WORKDIR /app

COPY . .

RUN npm install

RUN apk add --no-cache gcc musl-dev linux-headers

EXPOSE 8000

CMD npm start