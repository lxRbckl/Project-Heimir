FROM node:18


# referencing kubernetes environment #
ENV tokendiscord ${tokendiscord}

ENV repository "https://github.com/lxRbckl/Project-Heimir.git"


WORKDIR /usr/src/app
COPY . .


RUN apt-get install -y git
RUN git clone ${repository}

RUN cd Project-JA
RUN npm install


CMD ["node", "index.js"]