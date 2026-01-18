# Project SelfStack 3
> Scan repositories daily to extract and catalog technology stack information into a centralized data file. V3. Spring 2026.
> 
> **`TypeScript`** **`Docker`** `node-cron` `octokit`

---

## Local Development
```bash
npm install
npm run build
npm start
```

---

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
  -e TARGET_REPOSITORY=Project-SelfStack \
  -e LANGUAGE_REGEX="\\*\\*`([^`]+)`\\*\\*" \
  -e COMMIT_MESSAGE="Project SelfStack - Automated Data Collection" \
  -e USERNAMES="lxrbckl, ala2q6" \
  -e GITHUB_TOKEN=<your-token-here> \
  lxrbckl/project-selfstack:latest
```

---