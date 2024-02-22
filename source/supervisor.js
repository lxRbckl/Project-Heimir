// import <
const {githubUpdate} = require('lxrbckl');
const {Octokit} = require('@octokit/rest');

// >


class supervisor {

   constructor(pToken) {

      // setup <
      // initialize <
      this.token = pToken;
      this.owner = process.env.owner;
      this.branch = process.env.branch;
      this.filepath = process.env.filepath;
      this.repository = process.env.repository;
      this.users = (process.env.users).split(',');

      this.octokit = new Octokit({auth : this.token});

      // >

   }


   async getRepositories(user) {

      var data = {};
      let query = `GET /users/${user}/repos`;
      var repos = await this.octokit.paginate(query);
      for (const r of repos) {

         let result = (await this.octokit.repos.get({

            owner : user,
            repo : r.name

         })).data;

         data[result.name] = {

            'url' : result.url,
            'topics' : result.topics,
            'language' : result.language,
            'description' : result.description

         };

      }

      return data;

   }


   async updateFile(data) {

      let result = await githubUpdate({

         pData : data,
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
      await Promise.all(this.users.map(async u => {

         let result = await this.getRepositories(u);
         data[u] = result;

      }));

      return {

         // if (success) <
         // if (failure) <
         true : '`File updated.`',
         false : '`File failed to update.`'

         // >

      }[await this.updateFile(data)];

   }


}


// export <
module.exports = supervisor;

// >