FROM node:19.5.0


# referencing docker compose <
ENV tokenOctokit ${tokenOctokit}

ENV file ${file}
ENV owner ${owner}
ENV branch ${branch}
ENV repository ${repository}
ENV urlGitHubUsers ${urlGitHubUsers}

# >


WORKDIR /app
COPY . .
RUN npm install


CMD ["node", "dist/app.js"]