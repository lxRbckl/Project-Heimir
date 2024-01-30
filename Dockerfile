FROM node:18.16.0


# referencing kubernetes environment #
ENV users ${users}
ENV owner ${owner}
ENV branch ${branch}
ENV filepath ${filepath}
ENV channelId ${channelId}
ENV repository ${repository}
ENV tokenOctokit ${tokenOctokit}
ENV tokenDiscord ${tokenDiscord}


WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install


CMD ["node", "index.js"]