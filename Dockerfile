FROM mhart/alpine-node:8.6.0
RUN apk update \
    && apk add python make g++
RUN rm -rf /var/cache/apk/*
RUN npm i -g nodemon
ENV NODE_PATH=./lib
COPY package.json package-lock.json /opt/ticktock/
WORKDIR /opt/ticktock
RUN npm i
RUN npm cache clean --force
COPY . /opt/ticktock/
RUN chmod +x ./execute
ENTRYPOINT ["node", "start.js"]