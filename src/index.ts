import { schedule } from 'node-cron';
import { GitHubClient } from './octokit.js';
import { RepositoryDetails } from './interfaces.js';


enum Regex {
  NEWLINE = "\n",
  PROJECT = "---",
  HEADER = "#\\s?",
  INDENT = ">\\s?",
  PACKAGE = "`([^`]+)`",
  LANGUAGE = "\\*\\*`([^`]+)`\\*\\*"
}


async function main() {


  const client = new GitHubClient(process.env.GITHUB_TOKEN!);

  const targetFile = process.env.TARGET_FILE!;
  const targetBranch = process.env.TARGET_BRANCH!;
  const cronSchedule = process.env.CRON_SCHEDULE!;
  const commitMessage = process.env.COMMIT_MESSAGE!;
  const repositoryOwner = process.env.REPOSITORY_OWNER!;
  const targetRepository = process.env.TARGET_REPOSITORY!;
  const usernames = process.env.USERNAMES!.split(',').map(item => item.trim());


  async function processRepositories() {
    try {

      // Collect all repositories with their owners
      const allRepositories: {owner: string, repo: string}[] = [];

      for (const u of usernames) {
        const personalRepos = await client.getUserRepositoryNames(u);
        for (const repo of personalRepos) {
          allRepositories.push({owner: u, repo});
        }

        const organizations = await client.getUserOrganizationNames(u);

        for (const organization of organizations) {
          const orgRepos = await client.getUserRepositoriesInOrganization(u, organization);
          for (const repo of orgRepos) {
            allRepositories.push({owner: organization, repo});
          }
        }
      }

      // Fetch detailed information for each repository
      const repositories: Record<string, RepositoryDetails> = {};
      const techStack = {language: new Set<string>(), package: new Set<string>()};

      for (const {owner, repo} of allRepositories) {
        try {
          const details = await client.getRepositoryInfo(owner, repo);
          if (details) {

            const readmeParts = details.readme
              .replace(new RegExp(Regex.INDENT, 'g'), "")
              .replace(new RegExp(Regex.HEADER, 'g'), "")
              .split(Regex.PROJECT)
              [0]
              ;

            if (readmeParts.length > 1) {

              const [title, description, stackLine] = readmeParts
                .split(Regex.NEWLINE)
                .filter(line => line.trim() !== '');

              // Extract languages (**`Language`**) and packages (`Package`)
              const languages = new Set<string>();
              const languageRegex = new RegExp(Regex.LANGUAGE, 'g');
              let langMatch;
              while ((langMatch = languageRegex.exec(stackLine || '')) !== null) {
                languages.add(langMatch[1].trim());
                techStack.language.add(langMatch[1].trim());
              }

              const stack: string[] = [];
              const packageRegex = new RegExp(Regex.PACKAGE, 'g');
              let match;
              while ((match = packageRegex.exec(stackLine || '')) !== null) {
                const item = match[1].trim();
                stack.push(item);
                if (!languages.has(item)) {
                  techStack.package.add(item);
                }
              }

              repositories[repo] = {
                title: title,
                stack: stack,
                url: details.url,
                description: description
              };

            }
          }
        } catch (error) {
          continue;
        }
      }

      // Write the compiled data to target repository
      await client.writeFileContents(
        repositoryOwner,
        targetRepository,
        targetFile,
        {
          repositories: repositories,
          languages: Array.from(techStack.language),
          packages: Array.from(techStack.package)
        },
        targetBranch,
        commitMessage
      );

    } catch (error) {
      console.error(error);
    }
  }

  await processRepositories();
  schedule(cronSchedule, async () => {
    await processRepositories();
  });

}


main();