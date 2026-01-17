import { Octokit } from 'octokit';

/**
 * GitHub API client wrapper using Octokit
 * Template for RESTful API calls to GitHub
 */
export class GitHubClient {
  private octokit: Octokit;

  constructor(authToken: string) {
    this.octokit = new Octokit({
      auth: authToken,
    });
  }

  /**
   * Get repository names for a specific user
   * Returns only the names of repositories owned by the user
   */
  async getUserRepositoryNames(username: string): Promise<string[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForUser({
        username,
        type: 'owner',
        sort: 'updated',
        per_page: 100,
      });

      return data.map((repo: any) => repo.name);
    } catch (error) {
      console.error(`Error fetching repositories for user ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get organization names for a specific user
   * Returns only the names of organizations the user is a member of
   */
  async getUserOrganizationNames(username: string): Promise<string[]> {
    try {
      const { data } = await this.octokit.rest.orgs.listForUser({
        username,
        per_page: 100,
      });

      return data.map((org: any) => org.login);
    } catch (error) {
      console.error(`Error fetching organizations for user ${username}:`, error);
      throw error;
    }
  }

  /**
   * Get repository names owned by a specific user within a GitHub organization
   * Returns only the names of repositories owned by the user in the specified organization
   */
  async getUserRepositoriesInOrganization(username: string, organization: string): Promise<string[]> {
    try {
      const { data } = await this.octokit.rest.repos.listForOrg({
        org: organization,
        per_page: 100,
      });

      return data
        .filter((repo: any) => repo.owner.login === username)
        .map((repo: any) => repo.name);
    } catch (error) {
      console.error(`Error fetching repositories for user ${username} in organization ${organization}:`, error);
      throw error;
    }
  }

}