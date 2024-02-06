// < Project Heimir by Alex Arbuckle > //


/// import <
const Client = require('./source/client.js');
const Database = require('./source/database.js');

// >


// setup <
const token = {

   discord : process.env.tokenDiscord,
   octokit : process.env.tokenOctokit
   
};

// >


(async () => {

   new Client({

      pToken : token.discord,
      pDatabase : new Database(token.octokit)

   }).run();

})();


// export <
module.exports = token;

// >
