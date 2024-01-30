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
const rate = 6;
const owner = 'lxRbckl';
const filepath = 'data.json';
const branch = 'Project-Heimir-2';
const users = ['ala2q6', 'lxRbckl'];
const repository = 'Project-Heimir';
const channelId = '1199281939547435030';
const token = {

   octokit : '',
   discord : ''

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


async function message(result) {

   (await client.channels.cache.get(channelId)).send({

      content : {

         // (failure) <
         // (successful) <
         true : '@silent `Failed to update.`',
         false : '@silent `Update was successful.`'

         // >

      }[result == undefined]

   });

}


function schedule() {

   this.client.on('ready', async () => {

      cron.schedule('0 0 * * *', async () => {

         let data = await fetch();
         let result = await update(data);

         await message(result);

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