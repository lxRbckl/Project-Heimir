FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY data/ ./data

ENV USERNAMES=${USERNAMES}
ENV TARGET_FILE=${TARGET_FILE}
ENV GITHUB_TOKEN=${GITHUB_TOKEN}
ENV TARGET_BRANCH=${TARGET_BRANCH}
ENV CRON_SCHEDULE=${CRON_SCHEDULE}
ENV COMMIT_MESSAGE=${COMMIT_MESSAGE}
ENV REPOSITORY_OWNER=${REPOSITORY_OWNER}
ENV TARGET_REPOSITORY="${TARGET_REPOSITORY}"

CMD ["npm", "start"]