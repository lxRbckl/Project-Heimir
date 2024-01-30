// < Project Heimir by Alex Arbuckle > //


/// import <
const cron = require('node-cron');
const {githubUpdate} = require('lxrbckl');
const {Octokit} = require('@Octokit/rest');
const {

   Client,
   IntentsBitField

} = require('discord.js');

// >


// setup <
// initialize <
const owner = process.env.owner;
const users = process.env.users;
const branch = process.env.branch;
const filepath = process.env.filepath;
const channelId = process.env.channelId;
const repository = process.env.repository;
const token = {

   octokit : process.env.tokenOctokit,
   discord : process.env.tokenDiscord

};

const octokit = new Octokit({auth : token.octokit});
const client = new Client({

   rest : {version : '10'},
   intents : [

      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent
      
   ]

});

// >


async function fetch() {

   var data = {};
   await Promise.all(users.map(async u => {

      const repos = await octokit.paginate(`GET /users/${u}/repos`);
      for (const r of repos) {

         let result = (await octokit.repos.get({

            owner : u,
            repo : r.name

         })).data;

         data[result.name] = {

            'url' : result.url,
            'topics' : result.topics,
            'language' : result.language,
            'description' : result.description

         };

      }
      
   }));

   return data;

}


async function update(data) {

   return await githubUpdate({

      pData : data,
      pOwner : owner,
      pPath : filepath,
      pGithub : octokit,
      opBranch : branch,
      opShowError : false,
      pRepository : repository

   });

}


function message(result) {

   client.channels.cache.get(channelId).send({

      content : {

         // (successful) <
         // (failure) <
         true : '`Update was successful.`',
         false : '`Failed to update.`'

         // >

      }[result == undefined]

   });

}


function schedule() {

   client.on('ready', async () => {

      cron.schedule('0 0 * * *', async () => {

         let data = await fetch();
         let result = await update(data);

         message(result);

      });

   });

}


(async () => {

   client.login(token.discord);
   schedule();

})();


// export <
module.exports = token;

// >