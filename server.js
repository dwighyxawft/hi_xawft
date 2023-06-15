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

app.use(function(req, res){
    res.status(404).json({msg: "This route does not exist. Please login and try again"});
})