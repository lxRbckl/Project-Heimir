// import <
const {githubUpdate} = require('lxrbckl');
const {Octokit} = require('@octokit/rest');

// >


class database {

   constructor(pToken) {

      // setup <
      // initialize <
      this.token = pToken;
      this.owner = process.env.owner;
      this.branch = process.env.branch;
      this.filepath = process.env.filepath;
      this.repository = process.env.repository;

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

}


// export <
module.exports = database;

// >
