FROM node:16.18

WORKDIR /apps

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]