FROM node:22.16
WORKDIR /usr/local/planner-backend
COPY . .

RUN npm i

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]