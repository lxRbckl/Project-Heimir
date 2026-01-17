import { GitHubClient } from './octokit';
import { RepositoryDetails } from './interfaces';


async function main() {


  const targetBranch = "main";
  const targetFile = "output.txt";
  const packageRegex = /`([^`]+)`/g;
  const targetRepository = "Project-Heimir";
  const languageRegex = /\*\*`([^`]+)`\*\*/g;
  const commitMessage = "Add repository data output";
  const usernames = 'lxrbckl, ala2q6'.split(',').map(item => item.trim());
  const client = new GitHubClient("");


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
  const detailedRepositoryData: Record<string, Record<string, RepositoryDetails>> = {};

  for (const [username, repositories] of Object.entries(allUsersRepositories)) {
    detailedRepositoryData[username] = {};

    for (const repository of repositories) {
      try {
        const details = await client.getRepositoryInfo(username, repository);
        if (details) {
          detailedRepositoryData[username][repository] = details;
        }
      } catch (error) {
        continue;
      }
    }
  }

  // Extract **`Language`** and `Package` from READMEs using regex
  const techStack = {language: new Set<string>(), package: new Set<string>()};

  for (const [username, repositories] of Object.entries(detailedRepositoryData)) {
    for (const [repoName, repoDetails] of Object.entries(repositories)) {
      const readme = repoDetails.readme;

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

  console.log('Tech Stack Analysis:');
  console.log('Languages:', Array.from(techStack.language));
  console.log('Packages:', Array.from(techStack.package));
  console.log(detailedRepositoryData);
}


main();