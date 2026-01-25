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

      // Collect all repository names for each user
      const allUsersRepositories: Record<string, string[]> = {};

      for (const u of usernames) {
        const userRepositories: string[] = [];

        const personalRepos = await client.getUserRepositoryNames(u);
        userRepositories.push(...personalRepos);

        const organizations = await client.getUserOrganizationNames(u);

        for (const organization of organizations) {
          const orgRepos = await client.getUserRepositoriesInOrganization(u, organization);
          userRepositories.push(...orgRepos);
        }

        allUsersRepositories[u] = userRepositories;
      }

      // Fetch detailed information for each repository
      const repositories: Record<string, Record<string, RepositoryDetails>> = {};

      for (const [u, r] of Object.entries(allUsersRepositories)) {
        repositories[u] = {};

        for (const repository of r) {
          try {
            const details = await client.getRepositoryInfo(u, repository);
            if (details) {
              
              const readmeParts = details.readme
                .replace(new RegExp(Regex.INDENT, 'g'), "")
                .replace(new RegExp(Regex.HEADER, 'g'), "")
                .split(Regex.PROJECT)
                [0]
                ;
              
              if (readmeParts.length > 1) {

                const [title, description, stack] = readmeParts.split(Regex.NEWLINE);
                repositories[u][repository] = {
                  title: title,
                  stack: stack,
                  description: description,
                  iteration: details.branchCount,
                  url: details.url,
                };

              }
            }
          } catch (error) {
            continue;
          }
        }
      }

      // Extract **`Language`** and `Package` from READMEs using regex
      const techStack = {language: new Set<string>(), package: new Set<string>()};

      for (const [u, r] of Object.entries(repositories)) {
        for (const [rName, rDetails] of Object.entries(r)) {
          const stack = rDetails.stack;

          let languageMatch;
          const languageRegex = new RegExp(Regex.LANGUAGE, 'g');
          while ((languageMatch = languageRegex.exec(stack)) !== null) {
            techStack.language.add(languageMatch[1].trim());
          }

          let packageMatch;
          const packageRegex = new RegExp(Regex.PACKAGE, 'g');
          while ((packageMatch = packageRegex.exec(stack)) !== null) {
            const packageName = packageMatch[1].trim();
            if (!techStack.language.has(packageName)) {
              techStack.package.add(packageName);
            }
          }
        }
      }

      // Write the compiled data to the target repository
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