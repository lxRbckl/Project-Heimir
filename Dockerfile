FROM node:18.16.0


# referencing docker compose .yaml #
ENV users ${users}
ENV owner ${owner}
ENV branch ${branch}
ENV guildId ${guildId}
ENV filepath ${filepath}
ENV channelId ${channelId}
ENV repository ${repository}
ENV tokenOctokit ${tokenOctokit}
ENV tokenDiscord ${tokenDiscord}
ENV applicationiD ${applicationId}


WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install


CMD ["node", "index.js"]