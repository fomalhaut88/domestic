FROM node:14

WORKDIR /usr/src/app

EXPOSE 8080

COPY package.json .
RUN npm install

COPY . .
RUN ./node_modules/.bin/webpack

CMD ["./node_modules/.bin/http-server"]
