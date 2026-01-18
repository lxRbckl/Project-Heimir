# Project SelfStack
> A TypeScript project.

## Prerequisites

- Node.js >= 18.0.0 (tested with v25.3.0)
- npm (comes with Node.js)

---

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Install TypeScript (if not already installed):
   ```bash
   npm install --save-dev typescript
   ```

---

## Local Development
```bash
npm run build
npm start
```

## Remote Deployment
```bash
docker run \
  --name project-selfstack \
  --restart unless-stopped \
  -e TARGET_BRANCH=V3 \
  -e PROJECT_DELIMITER=--- \
  -e CRON_SCHEDULE="0 0 * * *" \
  -e PACKAGE_REGEX="`([^`]+)`" \
  -e REPOSITORY_OWNER=lxrbckl \
  -e TARGET_FILE="data/automated.json" \
  -e TARGET_REPOSITORY=Project-Heimir \
  -e LANGUAGE_REGEX="\\*\\*`([^`]+)`\\*\\*" \
  -e COMMIT_MESSAGE="Project SelfStack - Automated Data Collection" \
  -e USERNAMES="lxrbckl, ala2q6" \
  -e GITHUB_TOKEN=<your-token-here> \
  project-heimir
```


---