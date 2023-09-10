const mongoose = require("mongoose");
require("dotenv").config();
let connection;
try{
    mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true});
    connection = true;
}catch(error){
    connection = error;
}


module.exports = connection;