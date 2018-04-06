FROM mhart/alpine-node:8.6.0 AS development
RUN apk update && apk add \
    python \
    make \
    g++ \
    ruby-dev \
    ruby \
    ruby-io-console \
    ruby-bundler
RUN rm -rf /var/cache/apk/*
RUN gem install sass compass --no-ri --no-rdoc
RUN npm i -g nodemon grunt-cli
ENV NODE_PATH=./lib
COPY package.json package-lock.json /opt/ticktock/
WORKDIR /opt/ticktock
RUN npm i
RUN npm cache clean --force
COPY . /opt/ticktock/
RUN chmod +x ./execute
RUN chmod +x ./report
WORKDIR /opt/ticktock/frontend
RUN npm i
RUN grunt
WORKDIR /opt/ticktock
ENTRYPOINT ["node", "start.js"]

FROM mhart/alpine-node:8.6.0 AS production
RUN apk update && apk add \
    python \
    make \
    g++
RUN rm -rf /var/cache/apk/*
ENV NODE_PATH=./lib
COPY package.json package-lock.json /opt/ticktock/
WORKDIR /opt/ticktock
RUN npm i
RUN npm cache clean --force
COPY . /opt/ticktock/
RUN chmod +x ./execute
RUN chmod +x ./report
RUN rm -rf /opt/ticktock/frontend
COPY --from=development /opt/ticktock/frontend/public /opt/ticktock/frontend/public
ENTRYPOINT ["node", "start.js"]