from node:16

WORKDIR /app

COPY package*.json ./

RUN yarn global add nodemon

RUN apt update && apt install netcat -y 

RUN yarn install 

COPY . /app
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
