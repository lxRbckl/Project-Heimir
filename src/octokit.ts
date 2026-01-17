import { Octokit } from 'octokit';

export class GitHubClient {
  private octokit: Octokit;

  constructor(authToken: string) {
    this.octokit = new Octokit({
      auth: authToken,
    });
  }

  /** Get repository names for a specific user */
  async getUserRepositoryNames(username: string): Promise<string[]> {
    try {
      const allRepos: string[] = [];
      let page = 1;
      let hasMorePages = true;

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
      console.error(`Error fetching repositories for user ${username}:`, error);
      throw error;
    }
  }

  /** Get organization names for a specific user */
  async getUserOrganizationNames(username: string): Promise<string[]> {
    try {
      const allOrgs: string[] = [];
      let page = 1;
      let hasMorePages = true;

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
      console.error(`Error fetching organizations for user ${username}:`, error);
      throw error;
    }
  }

  /** Get repository names owned by a specific user within a GitHub organization */
  async getUserRepositoriesInOrganization(username: string, organization: string): Promise<string[]> {
    try {
      const allRepos: any[] = [];
      let page = 1;
      let hasMorePages = true;

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

      return allRepos
        .filter((repo: any) => repo.owner.login === username)
        .map((repo: any) => repo.name);
    } catch (error) {
      console.error(`Error fetching repositories for user ${username} in organization ${organization}:`, error);
      throw error;
    }
  }

  /** Get comprehensive information about a specific repository */
  async getRepositoryInfo(username: string, repository: string): Promise<{
    readme: string;
    branchCount: number;
    repositoryUrl: string;
  }> {
    try {
      const repoResponse = await this.octokit.rest.repos.get({
        owner: username,
        repo: repository,
      });

      const readmeResponse = await this.octokit.rest.repos.getReadme({
        owner: username,
        repo: repository,
      });

      const allBranches: any[] = [];
      let page = 1;
      let hasMorePages = true;

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
      console.error(`Error fetching repository information for ${username}/${repository}:`, error);
      throw error;
    }
  }

}