

import { GitHubClient } from './octokit';

async function main() {
  const octokitToken = '';
  const usernames = 'lxrbckl, ala2q6'
    .split(',')
    .map(item => item.trim());

  const client = new GitHubClient(octokitToken);

  const allUsersRepositories: Record<string, string[]> = {};

  for (const u of usernames) {
    const userRepositories: string[] = [];

    console.log(`Fetching personal repositories for ${u}...`);
    const personalRepos = await client.getUserRepositoryNames(u);
    userRepositories.push(...personalRepos);
    console.log(`Found ${personalRepos.length} personal repositories for ${u}`);

    console.log(`Fetching organizations for ${u}...`);
    const organizations = await client.getUserOrganizationNames(u);
    console.log(`Found ${organizations.length} organizations for ${u}: ${organizations.join(', ')}`);

    for (const organization of organizations) {
      console.log(`Fetching repositories for ${u} in organization ${organization}...`);
      const orgRepos = await client.getUserRepositoriesInOrganization(u, organization);
      userRepositories.push(...orgRepos);
      console.log(`Found ${orgRepos.length} repositories for ${u} in ${organization}`);
    }

    console.log(`Total repositories found for ${u}: ${userRepositories.length}`);

    allUsersRepositories[u] = userRepositories;

    console.log(`Added ${userRepositories.length} repositories for ${u} to parent variable`);
  }

  console.log('\n=== FINAL RESULTS ===');
  Object.entries(allUsersRepositories).forEach(([username, repos]) => {
    console.log(`\n${username}: ${repos.length} total repositories`);
    if (repos.length > 0) {
      repos.forEach(repo => console.log(`  - ${repo}`));
    }
  });
}

main();