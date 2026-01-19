# Project SelfStack 3
> Scan repositories daily to extract and catalog technology stack information into a centralized data file. V3. Spring 2026.
> 
> **`TypeScript`** **`Docker`** `node-cron` `octokit`

---

### Local Development
```bash
npm install
npm run build
npm start
```

### Remote Deployment
```bash
docker run \
  -d \
  --name selfstack \
  --restart unless-stopped \
  -e TARGET_BRANCH=V3 \
  -e CRON_SCHEDULE="0 0 * * *" \
  -e REPOSITORY_OWNER=lxrbckl-dev \
  -e TARGET_FILE="data/automated.json" \
  -e TARGET_REPOSITORY=Project-SelfStack \
  -e COMMIT_MESSAGE="Project SelfStack - Automated Data Collection" \
  -e USERNAMES="lxrbckl, ala2q6" \
  -e GITHUB_TOKEN=<your-token-here> \
  lxrbckl/project-selfstack:v3
```

---