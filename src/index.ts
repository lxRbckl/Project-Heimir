import { schedule } from 'node-cron';
import { GitHubClient } from './octokit.js';
import { RepositoryDetails } from './interfaces.js';


enum Regex {
  NEWLINE = "\n",
  PROJECT = "---",
  HEADER = "^#+\\s?",
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

      // Helper function to process README content and extract repository details
      function processReadme(
        readmeContent: string,
        url: string,
        isMainBranch: boolean
      ): { key: string; details: RepositoryDetails } | null {
        const readmeParts = readmeContent
          .replace(new RegExp(Regex.INDENT, 'g'), "")
          .replace(new RegExp(Regex.HEADER, 'gm'), "")
          .split(Regex.PROJECT)
          [0];

        if (readmeParts.length <= 1) {
          return null;
        }

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

        return {
          key: title,
          details: {
            title: title,
            stack: stack,
            url: url,
            description: description,
            show: isMainBranch
          }
        };
      }

      for (const {owner, repo} of allRepositories) {
        try {
          const repoInfo = await client.getRepositoryInfo(owner, repo);
          if (repoInfo) {
            // Process the default branch README (show: true)
            const mainResult = processReadme(
              repoInfo.readme,
              repoInfo.url,
              true
            );
            if (mainResult) {
              repositories[mainResult.key] = mainResult.details;
            }

            // Process other branches (show: false)
            for (const branch of repoInfo.branches) {
              if (branch !== repoInfo.defaultBranch) {
                try {
                  const branchReadme = await client.getReadmeForBranch(owner, repo, branch);
                  if (branchReadme) {
                    const branchResult = processReadme(
                      branchReadme,
                      `${repoInfo.url}/tree/${branch}`,
                      false
                    );
                    if (branchResult) {
                      repositories[branchResult.key] = branchResult.details;
                    }
                  }
                } catch (error) {
                  // Branch doesn't have a README, skip it
                  continue;
                }
              }
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