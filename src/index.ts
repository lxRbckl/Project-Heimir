import { schedule } from 'node-cron';
import { GitHubClient } from './octokit';
import { RepositoryDetails } from './interfaces';


async function main() {


  const targetBranch = "V3";
  const projectDelimiter = "---";
  const cronSchedule = "0 0 * * *";
  const packageRegex = /`([^`]+)`/g;
  const repositoryOwner = "lxrbckl";
  const targetFile = "data/automated.json";
  const targetRepository = "Project-Heimir";
  const languageRegex = /\*\*`([^`]+)`\*\*/g;
  const commitMessage = "Project SelfStack - Automated Data Collection";
  const usernames = "lxrbckl, ala2q6".split(',').map(item => item.trim());
  const client = new GitHubClient("");


  schedule(cronSchedule, async () => {
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
              const readmeParts = details.readme.split(projectDelimiter);
              details.readme = readmeParts[0] || "";
              repositories[u][repository] = details;
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
          const readme = rDetails.readme;

          let languageMatch;
          while ((languageMatch = languageRegex.exec(readme)) !== null) {
            techStack.language.add(languageMatch[1].trim());
          }

          let packageMatch;
          while ((packageMatch = packageRegex.exec(readme)) !== null) {
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
  });

}


main();