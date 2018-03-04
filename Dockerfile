# temporary Dockerfile. Don't care about minimizing the size.

FROM node:8.9-alpine
WORKDIR /var/www/current
COPY ./package.json ./
COPY ./yarn.lock ./
COPY ./theia.config.json ./
COPY ./public ./public
COPY ./views ./views

RUN apk update && apk --no-cache add python make g++ git bash openssh
RUN yarn install
COPY ./tsconfig.json ./
COPY ./tslint.json ./
COPY ./src ./src
RUN yarn run lint
RUN yarn run test
RUN yarn run build
# this prunes dev deps
RUN yarn install --production

COPY ./deploy/secrets.sh ./secrets.sh
ARG theia_env=development
ENV THEIA_ENV=$theia_env
CMD [ "/bin/bash", "-c", "source ./secrets.sh && PORT=80 yarn run start" ]

# Use the following when docker on Jenkins has been upgraded.

# FROM scratch as base
# RUN mkdir ./var
# COPY ./package.json ./
# COPY ./yarn.lock ./
# COPY ./theia.config.json ./
# COPY ./public ./public
# COPY ./views ./views

# FROM node:8.9-alpine as build
# WORKDIR /var/www/current
# RUN apk update && apk --no-cache add python make g++ git
# COPY --from=base / ./
# RUN yarn install
# COPY ./tsconfig.json ./
# COPY ./tslint.json ./
# COPY ./src ./src
# RUN yarn run lint
# RUN yarn run test
# RUN yarn run build
# # this prunes dev deps
# RUN yarn install --production

# FROM node:8.9-alpine AS release
# WORKDIR /var/www/current
# RUN apk update && apk --no-cache add bash git openssh
# COPY --from=base / ./
# COPY --from=build /var/www/current/node_modules ./node_modules
# COPY --from=build /var/www/current/dist ./dist
# COPY ./deploy/secrets.sh ./secrets.sh
# ARG theia_env=development
# ENV THEIA_ENV=$theia_env
# CMD [ "/bin/bash", "-c", "source ./secrets.sh && PORT=80 yarn run start" ]
