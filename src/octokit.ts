import { Octokit } from 'octokit';
import { RepositoryInfo } from './interfaces';

export class GitHubClient {
  private octokit: Octokit;

  constructor(authToken: string) {
    this.octokit = new Octokit({
      auth: authToken,
    });
  }

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

  async getUserRepositoriesInOrganization(username: string, organization: string): Promise<string[]> {
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

  async getRepositoryInfo(username: string, repository: string): Promise<RepositoryInfo | null> {
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

}