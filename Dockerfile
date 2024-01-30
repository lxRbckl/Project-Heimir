FROM node:18.16.0


# referencing kubernetes environment #
ENV tokenOctokit ${tokenOctokit}
ENV tokenDiscord ${tokenDiscord}


WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install


CMD ["node", "index.js"]