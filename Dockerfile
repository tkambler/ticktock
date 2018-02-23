FROM mhart/alpine-node:8.6.0
RUN npm i -g nodemon
ENV NODE_PATH=./lib
COPY package.json package-lock.json /opt/ticktock/
WORKDIR /opt/ticktock
RUN npm i
RUN npm cache clean --force
COPY . /opt/ticktock/
ENTRYPOINT ["node", "start.js"]
EXPOSE 80