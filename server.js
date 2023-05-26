const express = require("express");
const morgan = require("morgan");
const app = express();
const db = require("./db/database");
const cookieParser = require("cookie-parser");
const port = 3000;
const wallet = require("./routes/wallet");
if(db){
    app.listen(port, console.log(`listening on port ${port}`));
}
app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(morgan("dev"));


app.use("/wallet", wallet);


// import fetch from 'node-fetch';

// async function run() {
//     const resp = await fetch(
//       `https://auth.reloadly.com/oauth/token`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           client_id: 'gGH988E5zNGJehdI5nBNDYvoxbD0SdfA',
//           client_secret: '2YeH9x5a8E-sfvCWiC556oSlyh5BBl-2pOthQXkemw3Jzg0U3om0brML3KDJZcU',
//           grant_type: 'client_credentials',
//           audience: 'https://topups-sandbox.reloadly.com'
//         })
//       }
//     );
   
//     const data = await resp.json();
//     console.log(data);
//   }
   
//   run();
  


// async function run() {
//     const resp = await fetch(
//       `https://topups-sandbox.reloadly.com/topups`,
//       {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: 'Bearer <YOUR_TOKEN_HERE>'
//         },
//         body: JSON.stringify({
//           operatorId: 1100,
//           amount: 832,
//           useLocalAmount: false,
//           customIdentifier: 'airtime-top-up',
//           recipientEmail: 'jeanb@reloadly.com',
//           recipientPhone: {
//             countryCode: 'AE',
//             number: '0503971821'
//           },
//           senderPhone: {
//             countryCode: 'CA',
//             number: '11231231231'
//           }
//         })
//       }
//     );
   
//     const data = await resp.json();
//     console.log(data);
//   }
   
//   run();
  