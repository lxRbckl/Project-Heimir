import { GitHubClient } from './octokit';

// Your GitHub token (keep this secure - consider using environment variables in production)
const GITHUB_TOKEN = '';

// Create authenticated GitHub client
const github = new GitHubClient(GITHUB_TOKEN);

// Example usage
async function main() {
  try {
    console.log('GitHub client initialized');

    // Test the connection by getting repository names for a user
    const repos = await github.getUserRepositoryNames('octocat');
    console.log('Repositories for octocat:', repos);

  } catch (error) {
    console.error('Error:', error);
  }
}

main();