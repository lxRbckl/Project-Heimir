// < Project Heimir by Alex Arbuckle > //


/// import <
const Client = require('./source/client.js');
const Supervisor = require('./source/supervisor.js');

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
      objSupervisor : new Supervisor(token.octokit)

   }).run();

})();


// export <
module.exports = token;

// >
