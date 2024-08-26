// import <


// >


const archiveManagerConfig: {

   file: string,
   owner: string,
   token: string,
   branch: string,
   repository: string,
   urlGitHubUsers: string

} = {

   file : process.env.file!,
   owner : process.env.owner!,
   branch : process.env.branch!,
   token : process.env.tokenOctokit!,
   repository : process.env.repository!,
   urlGitHubUsers : process.env.urlGitHubUsers!

}


// export <
export default archiveManagerConfig;

// >