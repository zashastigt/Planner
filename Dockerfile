FROM node:22.16
WORKDIR /usr/local/planner
COPY . .

RUN npm i

EXPOSE 8080

CMD ["npm", "run", "dev"]