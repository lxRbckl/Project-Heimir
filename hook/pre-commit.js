// import <
const token = require('../index.js');

// >


// iterate (token) <
for (const [i, j] of Object.entries(token)) {

   // if (existing token) <
   if (j) {

      // notify <
      // failure <
      console.log(i, 'token exists.');
      process.exit(1);

      // >

   }

   // >

}

// >


// success <
process.exit(0);

// >