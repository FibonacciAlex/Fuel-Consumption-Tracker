# FROM node:20-bullseye
FROM node:lts-alpine

ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

# installs only the dependencies listed under dependencies (skips devDependencies)
#  and suppresses most npm output so the Docker build log stays clean.
# then moves the resulting node_modules directory up one level in the image’s filesystem. This is often done so the dependencies 
# can be reused by another build stage or shared between multiple app directories without reinstalling.

# RUN npm install --production --silent && mv node_modules ../  

RUN apk add --no-cache python3 make g++ \
 && npm install --production --silent \
 && mv node_modules ..
COPY . .
EXPOSE 5000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
