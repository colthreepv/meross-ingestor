FROM node:lts-alpine as build
WORKDIR /usr/src/app

RUN apk add -qU git

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

# Install only production dependencies now, smaller image
FROM node:lts-alpine
WORKDIR /usr/src/app
ENV NODE_ENV=production

RUN apk add -qU git

COPY package.json yarn.lock ./
RUN yarn install --prod
RUN apk del git

COPY --from=build /usr/src/app/dist .

CMD ["node", "."]
