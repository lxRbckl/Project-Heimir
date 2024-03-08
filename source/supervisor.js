// import <
const {Octokit} = require('@octokit/rest');
const {githubUpdate, axiosGet} = require('lxrbckl');

// >


class supervisor {

   constructor(pToken) {

      // setup <
      // initialize <
      this.token = pToken;
      this.owner = process.env.owner;
      this.branch = process.env.branch;
      this.filepath = process.env.filepath;
      this.configLink = process.env.configLink;
      this.repository = process.env.repository;
      this.users = (process.env.users).split(',');

      this.octokit = new Octokit({auth : this.token});

      // >

   }


   async getRepositories({
      
      pUser,
      pExcluded
   
   }) {

      var data = {};
      let query = `GET /users/${pUser}/repos`;
      var repos = await this.octokit.paginate(query);
      for (const r of repos) {

         let result = (await this.octokit.repos.get({

            owner : pUser,
            repo : r.name

         })).data;

         // if (not excluded) <
         if (!(pExcluded.includes(result.name))) {

            data[result.name] = {

               'packages' : result.topics,
               'languages' : [result.language],
               'description' : result.description,
               'url' : `https://github.com/${pUser}/${result.name}`

            };
         
         }

         // >

      }

      return data;

   }


   async updateFile(pData) {

      let result = await githubUpdate({

         pData : pData,
         pOwner : this.owner,
         opShowError : false,
         pPath : this.filepath,
         pGithub : this.octokit,
         opBranch : this.branch,
         pRepository : this.repository

      });

      return (result == undefined);

   }


   async run() {

      var data = {};
      let config = await axiosGet({pURL : this.configLink});
      await Promise.all(this.users.map(async u => {

         let result = await this.getRepositories({
            
            pUser : u,
            pExcluded : config['projects']['exclude']
         
         });
         data[u] = result;

      }));

      return {

         // if (success) <
         // if (failure) <
         true : 'File updated.',
         false : 'File failed to update.'

         // >

      }[await this.updateFile(data)];

   }


}


// export <
module.exports = supervisor;

// >