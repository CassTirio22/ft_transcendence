FROM node

WORKDIR /usr/src/app/server

COPY *.json ./

RUN npm install

COPY . .

CMD ["npm", "run", "start"]
