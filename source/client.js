// import <
const cron = require('node-cron');
const {

   Client,
   Routes,
   IntentsBitField

} = require('discord.js');

const update = require('./command/update.js');

// >


class client {

   constructor({

      pToken,
      pSupervisor

   }) {

      // setup <
      // initialize <
      this.token = pToken;
      this.supervisor = pSupervisor;
      this.guildId = process.env.guildId;
      this.channelId = process.env.channelId;
      this.applicationId = process.env.applicationId;
      this.commands = {'update' : new update(pSupervisor)};

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


   message(content) {

      let channel = this.client.channels.cache.get(this.channelId);
      channel.send(content);

   }


   listen() {

      this.client.on('interactionCreate', async (interaction) => {

         let command = this.commands[interaction.commandName];
         let result = await command.run();

         await this.message(result);

      });

   }


   schedule() {

      this.client.on('ready', async () => {

         cron.schedule('0 0 * * *', async () => {

            let result = await this.supervisor.run();
            this.message(result);

         });

      });

   }


   async run() {

      // register slash command <
      // activate interaction, schedule <
      this.client.login(this.token);
      this.client.rest.put(

         Routes.applicationGuildCommands(

            this.applicationId,
            this.guildId

         ),
         {body : Object.values(this.commands).map((i) => {return i.context();})}

      );
      this.listen();
      this.schedule();

      // >

   }

}


// export <
module.exports = client;

// >
