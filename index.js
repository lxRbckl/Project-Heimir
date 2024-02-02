// < Project Heimir by Alex Arbuckle > //


/// import <
const Client = require('./source/client.js');
const Database = require('./source/database.js');

// >


// setup <
const token = {

   octokit : process.env.tokenOctokit,
   discord : process.env.tokenDiscord

};

// >


(async () => {

   let client = new Client({

      pToken : token.discord,
      pDatabase : new Database(token.octokit)

   }).run();

})();


// export <
module.exports = token;

// >