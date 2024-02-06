// import <
const cron = require('node-cron');
const {

   Client,
   IntentsBitField

} = require('discord.js');

// >


class client {

   constructor({

      pToken,
      pDatabase

   }) {

      // setup <
      // initialize <
      this.token = pToken;
      this.database = pDatabase;
      this.channelId = process.env.channelId;
      this.users = (process.env.users).split(',');
      
      this.client = new Client({

         rest : {version : '10'},
         intents : [
      
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent
            
         ]

      });

      // >
      
   }


   async fetch() {

      var data = {};
      await Promise.all(this.users.map(async u => {

         let result = this.database.getRepositories(u);
         data[u] = result;

      }));

      return data;

   }


   message(result) {

      this.client.channels.cache.get(this.channelId).send({

         content : {

            // event (failure) <
            // event (success) <
            false : '`Failed to update.`',
            true : '`Update was successful.`'

            // >

         }[result]

      });

   }


   schedule() {

      this.client.on('ready', async () => {

         cron.schedule('0 0 * * *', async () => {

            let data = await this.fetch();
            let result = await this.database.updateFile(data);

            this.message(result);

         });

      });

   }


   async run() {

      this.client.login(this.token);
      this.schedule();

   }

}


// export <
module.exports = client;

// >
