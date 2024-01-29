FROM node:18.16.0


# referencing kubernetes environment #
ENV tokenGitHub ${tokenGitHub}
ENV tokendiscord ${tokendiscord}


WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install


CMD ["node", "index.js"]