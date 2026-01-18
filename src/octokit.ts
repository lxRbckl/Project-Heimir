import { Octokit } from 'octokit';
import { RepositoryInfo } from './interfaces';

export class GitHubClient {
  private octokit: Octokit;

  /**
   * Creates a GitHub client instance with authentication
   * @param authToken GitHub personal access token
   */
  constructor(authToken: string) {
    this.octokit = new Octokit({
      auth: authToken,
    });
  }

  /**
   * Gets all repository names for a given username
   * @param username GitHub username
   * @returns Array of repository names
   */
  async getUserRepositoryNames(username: string): Promise<string[]> {
    try {
      let page = 1;
      let hasMorePages = true;
      const allRepos: string[] = [];

      while (hasMorePages) {
        const { data } = await this.octokit.rest.repos.listForUser({
          username,
          type: 'owner',
          sort: 'updated',
          per_page: 100,
          page,
        });

        allRepos.push(...data.map((repo: any) => repo.name));

        hasMorePages = data.length === 100;
        page++;
      }

      return allRepos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets all organization names for a given username
   * @param username GitHub username
   * @returns Array of organization names
   */
  async getUserOrganizationNames(username: string): Promise<string[]> {
    try {
      let page = 1;
      let hasMorePages = true;
      const allOrgs: string[] = [];

      while (hasMorePages) {
        const { data } = await this.octokit.rest.orgs.listForUser({
          username,
          per_page: 100,
          page,
        });

        allOrgs.push(...data.map((org: any) => org.login));

        hasMorePages = data.length === 100;
        page++;
      }

      return allOrgs;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets all repositories in an organization that a user has contributed to
   * @param username GitHub username
   * @param organization Organization name
   * @returns Array of repository names
   */
  async getUserRepositoriesInOrganization(
    username: string,
    organization: string
  ): Promise<string[]> {
    try {
      let page = 1;
      let hasMorePages = true;
      const allRepos: any[] = [];

      while (hasMorePages) {
        const { data } = await this.octokit.rest.repos.listForOrg({
          org: organization,
          per_page: 100,
          page,
        });

        allRepos.push(...data);

        hasMorePages = data.length === 100;
        page++;
      }

      const contributedRepos: string[] = [];
      for (const repo of allRepos) {
        try {
          await this.octokit.rest.repos.getCollaboratorPermissionLevel({
            owner: organization,
            repo: repo.name,
            username: username,
          });
          contributedRepos.push(repo.name);
        } catch (error) {
          continue;
        }
      }

      return contributedRepos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets detailed information about a repository including README and branch count
   * @param username Repository owner username
   * @param repository Repository name
   * @returns Repository information or null if private/invalid
   */
  async getRepositoryInfo(
    username: string,
    repository: string
  ): Promise<RepositoryInfo | null> {
    try {
      const repoResponse = await this.octokit.rest.repos.get({
        owner: username,
        repo: repository,
      });

      if (repoResponse.data.private) {
        return null;
      }

      if (repository.toLowerCase() === username.toLowerCase()) {
        return null;
      }

      const readmeResponse = await this.octokit.rest.repos.getReadme({
        owner: username,
        repo: repository,
      });

      let page = 1;
      let hasMorePages = true;
      const allBranches: any[] = [];

      while (hasMorePages) {
        const branchesResponse = await this.octokit.rest.repos.listBranches({
          owner: username,
          repo: repository,
          per_page: 100,
          page,
        });

        allBranches.push(...branchesResponse.data);

        hasMorePages = branchesResponse.data.length === 100;
        page++;
      }

      const readmeContent = Buffer
        .from(readmeResponse.data.content, 'base64')
        .toString('utf-8');

      return {
        readme: readmeContent,
        branchCount: allBranches.length,
        repositoryUrl: repoResponse.data.html_url,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets and parses JSON content from a file in a repository
   * @param owner Repository owner
   * @param repo Repository name
   * @param path File path within the repository
   * @param branch Branch name
   * @returns Parsed JSON content
   */
  async getFileContents(
    owner: string,
    repo: string,
    path: string,
    branch: string
  ): Promise<any> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      const content = Buffer
        .from(response.data.content, 'base64')
        .toString('utf-8');

      return JSON.parse(content);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Writes JSON data to a file in a repository
   * @param owner Repository owner
   * @param repo Repository name
   * @param path File path within the repository
   * @param data Data to write as JSON
   * @param branch Branch name
   * @param commitMessage Commit message
   */
  async writeFileContents(
    owner: string,
    repo: string,
    path: string,
    data: any,
    branch: string,
    commitMessage: string
  ): Promise<void> {
    try {
      const content = JSON.stringify(data, null, 2);

      let sha: string | undefined;
      try {
        const existingFile = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        });
        if (!Array.isArray(existingFile.data)) {
          sha = existingFile.data.sha;
        }
      } catch (error) {
      }

      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: commitMessage,
        content: Buffer.from(content).toString('base64'),
        branch,
        sha,
      });
    } catch (error) {
      throw error;
    }
  }

}