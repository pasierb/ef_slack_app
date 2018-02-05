FROM node:8.9.4

WORKDIR /app

COPY package* ./

RUN npm i

ADD . .

CMD [ "npm", "start" ]