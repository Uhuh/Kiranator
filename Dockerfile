FROM node:16 as base

WORKDIR /home/panku/Kiranator

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build
