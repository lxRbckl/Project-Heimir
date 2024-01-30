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
const users = ['ala2q6', 'lxRbckl'];
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


function revise() {



}


function message() {

   

}


function schedule() {

   this.client.on('ready', async () => {

      cron.schedule('', async () => {

         console.log('scheduled');

      });

   });

}


(async () => {

   //

})();


// export <
module.exports = token;

// >