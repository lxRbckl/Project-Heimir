class update {

   constructor(objSupervisor) {

      this.supervisor = objSupervisor;

   }


   context() {

      return {

         type : 1,
         name : 'update',
         description : 'bypass schedule and force an update'

      }

   }


   async run() {return await this.supervisor.run()}

}


// export <
module.exports = update;

// >