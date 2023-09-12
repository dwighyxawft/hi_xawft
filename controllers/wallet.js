const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailer = require("nodemailer");
const axios = require('axios');
const User = require("../models/User");
const Auth = require("../models/Auth");
const Verification = require("../models/Verify");
const https = require('https');
const Forgot = require("../models/Pass");
const forgot_pass = require("../middlewares/forgot_pass");
const Flutterwave = require("flutterwave-node-v3");
const Transaction = require("../models/transactionRecords");
const Topup = require("../models/Topup");
const Electricity = require("../models/Electricity");
const Cable = require("../models/Cable");
const Complaints = require("../models/Complaints");
const Deposit = require("../models/Deposit");
// Payment record model
const PaymentRecord = require("../models/paymentRecord");
const Transfer = require("../models/Transfers");
const Withdrawal = require("../models/Withdrawals");
const Data = require("../models/Data");
const BankTransfer = require("../models/OtherTransfers");
const Admin = require("../models/Admin");
const Betting = require("../models/Betting");
const data_prices = require("../middlewares/data_prices");
const electrics = require("../middlewares/electric");
const cables = require("../middlewares/cables");
const multer  = require('multer')
const { v4: uuidv4 } = require('uuid');
const { trusted } = require("mongoose");
const { name } = require("ejs");

// Salt Round Value
const saltRound = 10;
require("dotenv").config();


const flw = new Flutterwave(
    process.env.FLUTTER_TEST_PUBLIC_KEY,
    process.env.FLUTTER_TEST_SECRET_KEY
);


function verifyEmail(currentUrl, email, _id, uniqueString){
    return {
        from: "amuoladipupo420@gmail.com",
        to: email,
        subject: "Verify your email from xawftly",
        html: `
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
            <style>
                *{
                    margin: 0;
                    padding: 0;
                    font-family: sans-serif;
                    line-height: 1.5;
                    color: #333;
                }
                body{
                    background-color: #f2f2f2;
                    padding: 20px;
                }
                .container{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                }
                h1{
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 20px;
                    text-align: center;
                }
                p{
                    font-size: 16px;
                    margin-bottom: 10px;
                }
                .button{
                    display: inline-block;
                    background-color: #00bfff;
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 5px;
                    text-decoration: none;
                    margin-top: 20px;
                }
                .button:hover{
                    background-color: #009acd;
                }
            </style>
            <div class="container">
                <h1>Xawftly Email Verification</h1>
                <p>Verify your email address to complete your signup and login to your account</p>
                <p>This link <strong>expires in 6 hours</strong>.</p>
                <p>Click the link below to proceed:</p>
                <a href="${currentUrl}verify/${_id}/${uniqueString}/" class="button">Verify Email Address</a>
                <p style="margin-top: 20px">You can also copy and paste the following link in your browser</p>
                <p style="margin-top: 10px;"><a href="${currentUrl}verify/${_id}/${uniqueString}/">Verify Email Address</a></p>
            </div>
        </body>
        </html>`
    }
}  

function tmp_feedback(name, email){
  return {
      from: "amuoladipupo420@gmail.com",
      to: email,
      subject: "Feedback from xawftly",
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px 40px;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
        }

        .logo {
            max-width: 150px;
            margin-bottom: 15px;
        }

        .content {
            margin-top: 20px;
            line-height: 1.6;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://github.com/dwighyxawft/mybank/blob/main/images/logos_bg/polaris.jpg" alt="xawft Logo" class="logo">
            <h2>We're Sorry!</h2>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>We've received your complaint, and we're truly sorry for any inconvenience you've experienced. Your satisfaction is our top priority, and we'll do our utmost to address your concerns promptly and efficiently.</p>
            <p>Please rest assured that our team will review the details of your complaint and take appropriate action. You can expect an update from us within [XX hours/days].</p>
            <p>Thank you for bringing this to our attention. Your feedback helps us serve you better.</p>
            <p>Kind Regards,<br>Your Company Name</p>
        </div>
        <div class="footer">
            © 2023 xawftly. All rights reserved.
        </div>
    </div>
</body>
</html>
`
  }
}  

function admin_feedback(name, email, body){
  return {
      from: "amuoladipupo420@gmail.com",
      to: email,
      subject: "Response from xawftly",
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 50px auto;
            background-color: #ffffff;
            padding: 20px 40px;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
        }

        .logo {
            max-width: 150px;
            margin-bottom: 15px;
        }

        .content {
            margin-top: 20px;
            line-height: 1.6;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://github.com/dwighyxawft/mybank/blob/main/images/logos_bg/polaris.jpg" alt="xawft Logo" class="logo">
            <h2>We're Sorry!</h2>
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>${body},</p>
            <p>Kind Regards,<br>xawftly wallet</p>
        </div>
        <div class="footer">
            © 2023 xawftly. All rights reserved.
        </div>
    </div>
</body>
</html>
`
  }
}  

function mail(){
    return mailer.createTransport({
        host: process.env.SMTP_HOSTNAME,
        port: process.env.AUTH_SMTP_PORT,
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASSWORD
        }
    });
}

function generateToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: "24h"});
}




const get_started = function(req, res){
    res.render("index");
}

const register_redirect = function(req, res){
  res.render("register");
}

const forgot_password_redirect = function(req, res){
  res.render("forgotten_password");
}

const contact_redirect = function(req, res){
  res.render("contact");
}

const features = function(req, res){
  res.render("features");
}

const login_redirect = function(req, res){
  res.render("login");
}

const withdrawal_redirect = function(req, res){
  res.render("withdrawal");
}

const dashboard = function(req, res){
  const user_id = req.user;
  User.findOne({_id: user_id}).then(function(user){
    if(user){
      Transaction.find({userId: user_id}).limit(10).sort({_id: -1}).then(function(transactions){
        if(transactions){
          res.render("dashboard", {user: user, transactions});
        }
      }).catch(function(err){
        console.log(err);
      })
    }
  }).catch(function(err){
    console.log(err);
  })
}

const airtime_redirect = function(req, res){
  const user_id = req.user;
  User.findOne({_id: user_id}).then(function(user){
    if(user){
      res.render("airtime", {user: user});
    }
  }).catch(function(err){
    console.log(err);
  })
}

const data_redirect = function(req, res){
  const user_id = req.user;
  User.findOne({_id: user_id}).then(function(user){
    if(user){
      res.render("data", {user: user});
    }
  }).catch(function(err){
    console.log(err);
  })
}

const cable_redirect = function(req, res){
  const user_id = req.user;
  User.findOne({_id: user_id}).then(function(user){
    if(user){
      res.render("cable", {user: user});
    }
  }).catch(function(err){
    console.log(err);
  })
}

const deposit_redirect = function(req, res){
    res.render("deposit");
}

const electricity_redirect = function(req, res){
  res.render("electricity");
}

const betting_redirect = function(req, res){
  res.render("betting");
}

const transfer_redirect = function(req, res){
  res.render("transfer");
}

const wallet_transfer_redirect = function(req, res){
  res.render("wallet_transfer");
}

const banks_transfer_redirect = function(req, res){
  res.render("bank_transfer");
}

const settings_redirect = function(req, res){
  User.findOne({_id: {$eq: req.user}}).then(function(user){
      res.render("settings", {user});
  }).catch(function(err){
    console.log(err);
  })
}

const register = async function(req, res){
        await User.findOne({ email: req.body.email}).then(function(existing){
          const uniqueString = uuidv4();
            if(!existing){
                if(req.body.password == req.body.confirm_password){
                  req.body.pin = req.body.pin1 + req.body.pin2 + req.body.pin3 + req.body.pin4;
                  bcrypt.hash(req.body.password, 10).then(function(hash){
                    bcrypt.hash(req.body.pin, 10).then(function(pin_hash){
                      req.body.pin = pin_hash;
                      req.body.image = req.body.gender == "male" ? "image.jpg" : "female.jpg";
                      req.body.password = hash;
                      
                      const user = new User({name: req.body.name, username: req.body.username, email: req.body.email, phone: req.body.phone, pin: req.body.pin, gender: req.body.gender, image: req.body.image, password: req.body.password, referrer: req.body.referrer});
                      user.save().then(function(){
                            let verifyUser = new Verification({user_id: user._id, email: user.email, link: "https://xawftly.onrender.com/wallet/"+user._id+"/"+uniqueString+"/", uuid: uniqueString});
                            verifyUser.save().then(async function(){
                              let transport = mail();
                              const info = await transport.sendMail(verifyEmail("https://xawftly.onrender.com/wallet/", user.email, user._id, uniqueString));
                              if(info){
                                res.status(200).json({code: "success", msg: "The user has been registered successfully, A registration link has been sent to your email", user})
                              }
                            }).catch(function(error){
                              res.status(500).json({code: "error", msg: "Database Error: Could not save verification details"});
                            })
                      }).catch(function(err){
                          res.status(500).json({code: "error", msg: "Database Error: Could not save user details"});
                      })
                    }).catch(function(err){
                        res.status(500).json({code: "error", msg: "Server Error: Error hashing the pin"});
                    })
                  }).catch(function(err){
                      res.status(500).json({code: "error", msg: "Server Error: Error hashing the password"});
                  })
                }else{
                  res.status(400).json({code: "error", msg: "The password are not matching. Please make sure your passwords are matching"})
                }
            }else{
                if(!existing.verified){
                    Verification.findOne({$and: [{user_id: {$eq: existing._id}}, {email: {$eq: existing.email}}]}).then(function(verify){
                        if(verify){
                            if(verify.expires <= Date.now()){
                                Verification.deleteOne({$and: [{user_id: {$eq: existing._id}}, {email: {$eq: existing.email}}]}).then(function(){
                                    let verifyUser = new Verification({user_id: existing._id, email: existing.email, link: "https://xawftly.onrender.com/wallet/"+existing._id+"/"+uniqueString+"/", uuid: uniqueString});
                                    verifyUser.save().then(async function(){
                                        let transport = mail();
                                        await transport.sendMail(verifyEmail("https://xawftly.onrender.com/wallet/", existing.email, existing._id, uniqueString));
                                        res.status(200).json({code: "error", msg: "This user already exists, A registration link will be sent to your email"})
                                    })
                                })
                            }else{
                                res.status(200).json({code: "error", msg: "This user already exists, A verification link has been sent to you, If not seen in your inbox, check your spam folder"})
                            }
                        }
                    })
                }else{
                    res.status(200).json({code: "error", msg: "This user already exists", existing});
                }
            }
        }).catch(err=>console.error(err));

}

const verify = function(req, res){
    const id = req.params.id;
    const uuid = req.params.uuid;
    Verification.findOne({$and: [{ user_id: {$eq: id}}, {uuid : {$eq: uuid}}]}).then(function(details){
        if(details){
            if(details.expires <= Date.now()){
                Verification.deleteOne({ user_id: {$eq: id}}).then(function(){
                    res.render("verification", {status: false})
                }).catch(function(err){
                    res.status(500).json({msg: "Database Error: Verification details could not be deleted"});
                })
            }else{
                User.updateOne({_id: id}, {verified: true}).then(function(){
                    Verification.deleteOne({ user_id: {$eq: id}}).then(function(){
                      res.render("verification", {status: true})
                    }).catch(function(err){
                        res.status(500).json({msg: "Database Error: Verification details could not be deleted"});
                    })
                }).catch(function(err){
                    res.status(500).json({msg: "Database Error: user details could not be updated"});
                })
            }
        }
    }).catch(function(err){
        res.status(500).json({msg: "Database Error: Could not get verification details"});
    })
}

const login = function(req, res){
    const { email, password } = req.body;
    User.findOne({email: email}).then(function(user){
        if(user){ 
            if(user.verified){
                Auth.findOne({user_id: {$eq: user._id}}).then(function(auth){
                    if(!auth){
                        if(bcrypt.compare(password, user.password)){         
                            const details = {user: user._id};
                            const accessToken = generateToken(details);
                            const refreshToken = jwt.sign(details, process.env.REFRESH_TOKEN);
                            const auth = new Auth({user_id: user._id, access: accessToken, refresh: refreshToken});
                            auth.save().then(function(){
                                delete user.password;
                                req.user = user._id;
                                global = user._id;
                                res.cookie('accessToken', accessToken);
                                req.refreshToken = refreshToken;
                                res.status(200).json({msg: "User has been logged in", user, status: true});
                            }).catch(function(error){
                                res.status(500).json({msg: "Database Error: Could not save authentication details", error, status:false});
                            })
                        }else{
                            res.status(400).json({msg: "Your credentials are incorrect, Please try again", status: false});
                        }
                    }else{
                        if(auth.expires_at <= Date.now()){
                            Auth.deleteOne({user_id: {$eq: user._id}}).then(function(){
                                if(bcrypt.compare(password, user.password)){         
                                    const details = {user: user._id};
                                    const accessToken = generateToken(details);
                                    const refreshToken = jwt.sign(details, process.env.REFRESH_TOKEN);
                                    const auth = new Auth({user_id: user._id, access: accessToken, refresh: refreshToken});
                                    auth.save().then(function(){
                                        delete user.password;
                                        req.user = user._id;
                                        global = user._id;
                                        res.cookie('accessToken', accessToken);
                                        req.refreshToken = refreshToken;
                                        res.status(200).json({msg: "User has been logged in", user, status: true});
                                    }).catch(function(error){
                                        res.status(500).json({msg: "Database Error: Could not save authentication details", error, status: false});
                                    })
                                }else{
                                    res.status(400).json({msg: "Your credentials are incorrect, Please try again", status: false});
                                }                           
                             })
                        }else{
                                req.user = user._id;
                                global = user._id;
                                res.cookie('accessToken', auth.access);
                                req.refreshToken = auth.refresh;
                                res.status(200).json({msg: "User has been logged in", user, status: true});
                        }
                    }
                })
            }else{
                res.status(400).json({msg: "Please verify your details before you login", status: false});
            }
        }else{
             res.status(400).json({msg: "This user does not exist, please register and try again", status: false});
        }
    }).catch(function(err){
        res.status(500).json({msg: "Database Error: Could not get the user details"});
    })
}

const forgotten_password = function (req, res) {
    User.findOne({ email: { $eq: req.body.email } }).then(function (user) {
      if (user) {
        let id = user._id;
        let email = user.email;
        if ( forgot_pass.send(id, email)) {
          res
            .status(200)
            .json({ msg: "A link has been sent to your email account", id });
        } else {
          res
            .status(200)
            .json({ msg: "Error sending a reset link to the user email", user });
        }
      } else {
        res.status(200).json({ msg: "This user does not exist. Please signup" });
      }
    });
};

const reset_password = function (req, res) {
    let id = req.param.id;
    let u_str = req.param.u_str;
    Forgot.findOne({
      $and: [{ user_id: { $eq: id } }, { u_uid: { $eq: u_str } }],
    }).then((forgot) => {
      if (forgot) {
        if (forgot.expires_at < Date.now()) {
          Forgot.deleteOne({ user_id: id })
            .then(function () {
              res.redirect("/forgot/password");
            })
            .catch(function (err) {
              console.log(err);
            });
        } else {
          User.updateOne({ _id: { $eq: id } }, { password: "" }).then(function (
            user
          ) {
            if (user) {
              res.render("reset_password", {id: id, u_str: u_str});
            }
          });
        }
      } else {
        res.status(200).json({ msg: "This link is not valid, please try again" });
      }
    });
};
  
const get_new_pass = function (req, res) {
    let id = req.body.id;
    let u_str = req.body.u_str;
    let pass = req.body.new_pass;
    let confirm_pass = req.body.confirm_pass;
    if(pass == confirm_pass){
          Forgot.findOne({
            $and: [{ user_id: { $eq: id } }, { u_str: { $eq: u_str } }],
        }).then(function (forgot) {
            if (forgot) {
            bcrypt.hash(pass, 10).then(function (hashed) {
                User.updateOne({ _id: id }, { password: hashed })
                .then(function (user) {
                    if (user.password != "") {
                    Forgot.deleteOne({
                        $and: [{ user_id: { $eq: id } }, { u_uid: { $eq: u_str } }],
                    })
                        .then(function () {
                        res.status(200).json({
                            msg: "Your password has been changed, you can now login",
                        });
                        })
                        .catch(function (err) {
                        console.log(err);
                        });
                    } else {
                    res.status(200).json({ msg: "Error processing new password" });
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });
            });
            } else {
            res.status(200).json({ msg: "This link is not valid. Please try again" });
            }
        });
    }else{
      res.status(200).json({
        msg: "Your password are not matching",
    });
    }
}

const flutterWallet = async (req, res, next) => {
  const reference_code = uuidv4();
  const userId = req.user;
  const { amountString, transaction_pin } = req.body;
  const amount = parseInt(amountString);
  if (amount < 200) {
    res.status(403).json({ message: "Amount cannot be less than 200 naira" });
    return;
  }
  if (amount > 1000000) {
    res
      .status(403)
      .json({ message: "Amount cannot be more than 1 million naira." });
    return;
  }
  User.findById(userId)
    .then((userData) => {
          if (transaction_pin != userData.pin) {
            res.status(401).json({ message: "Incorrect pin. Try again." });
            return;
          }
          const requestData = JSON.stringify({
            tx_ref: reference_code,
            amount: amount,
            currency: "NGN",
            redirect_url:
              "http://localhost:3000/wallet/dashboard/flutterpaymentcheck",
            meta: {
              consumer_id: userId,
              consumer_mac: "",
            },
            customer: {
              email: userData.email,
              phonenumber: userData.phone,
              name: userData.name,
            },
            customizations: {
              title: "hi_xawft Inc.",
              logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png",
            },
          });

          const options = {
            hostname: "api.flutterwave.com",
            path: "/v3/payments",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": requestData.length,
              Authorization: `Bearer ${process.env.FLUTTER_TEST_SECRET_KEY}`,
            },
          };

          const reqFw = https.request(options, (resFw) => {
            let data = "";

            resFw.on("data", (chunk) => {
              data += chunk;
            });

            resFw.on("end", () => {
              const response = JSON.parse(data);
              if (!response) {
                res
                  .status(500)
                  .json({ message: "Something went wrong. Please try again." });
                return;
              }
              const newTransaction = new Transaction({
                userId: userId,
                email: userData.email,
                reference_code: reference_code,
                transaction_id: "",
                amount: amount,
                status: "pending",
              });

              newTransaction
                .save()
                .then((newRecord) => {
                  res.status(201).json(response);
                })
                .catch((error) => {
                  next(error);
                });
            });
          });

          reqFw.on("error", (error) => {
            next(error);
          });

          reqFw.write(requestData);
          reqFw.end();
        
    })
    .catch((error) => {
      console.log(error);
      next(error);
    });
};

const flutterPaymentCheck = async (req, res, next) => {
  if (req.query.status === "successful") {
    Transaction.findOne({ reference_code: req.query.tx_ref })
      .then((transactionDetails) => {
        if (!transactionDetails) {
          res.status(200).json({
            message: "No transaction details found for this transaction",
          });
          return;
        }
        if (transactionDetails.status === "completed") {
          res
            .status(200)
            .json({ message: "This transaction is already completed" });
          return;
        }
        flw.Transaction.verify({ id: req.query.transaction_id })
          .then((response) => {
            const amountParsed = parseInt(transactionDetails.amount);
            if (
              response.data.status === "successful" &&
              response.data.amount === amountParsed &&
              response.data.currency === "NGN"
            ) {
              // Success! Confirm the customer's payment
              Transaction.findOneAndUpdate(
                { userId: transactionDetails.userId },
                {
                  status: "completed",
                  transaction_id: req.query.transaction_id,
                }
              )
                .then(() => {
                  User.findById(transactionDetails.userId)
                    .then((userData) => {
                      if (!userData) {
                        res.status(404).json({ message: "User not found" });
                        return;
                      }
                      User.findByIdAndUpdate(transactionDetails.userId, {
                        balance: userData.balance + amountParsed,
                      })
                        .then(() => {
                          let payment = new PaymentRecord({userId: req.user, amount: amountParsed});
                          payment.save();
                          res.status(201).json({
                            message: "Balance added to wallet successfully",
                          });
                        })
                        .catch((error) => {
                          res.json({ message: error });
                          console.log(error);
                          // next(error);
                        });
                    })
                    .catch((error) => {
                      res.json({ message: error });
                      console.log(error);
                      // next(error);
                    });
                })
                .catch((error) => {
                  res.json({ message: error });
                  console.log(error);
                  // next(error);
                });
            } else {
              // Inform the customer their payment was unsuccessful
              res.status(200).json({ message: "Payment was unsuccessful" });
            }
          })
          .catch((error) => {
            next(error);
          });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    Transaction.findOneAndUpdate(
      { reference_code: req.query.tx_ref },
      { status: "failed" }
    )
      .then(() => {
        res.status(200).json({ message: "Payment was unsuccessful" });
      })
      .catch((error) => {
        next(error);
      });
  }
};

const initiate_deposit = function(req, res){
  const uniqueString = uuidv4();
    const {name, email, cardNumber, expiry, cvv, amount} = req.body;
    const month_a = expiry.charAt(0);
    const month_b = expiry.charAt(1);
    const year_a = expiry.charAt(3);
    const year_b = expiry.charAt(4);
    console.log(expiry);
    console.log(name);
    console.log(email);
    console.log(cardNumber);
    console.log(cvv);
    console.log(amount);
    const month = month_a+month_b;
    const year = year_a+year_b;
    const n_amount = Number(amount);
    const payload = {
        card_number: cardNumber,
        cvv: cvv,
        expiry_month: month,
        expiry_year: year,
        currency: 'NGN',
        amount: n_amount,
        email: email,
        fullname: name,
        tx_ref: uniqueString,
        redirect_url: 'http://localhost:3000/wallet/deposit',
        enckey: process.env.FLUTTER_ENC_KEY
    }
    flw.Charge.card(payload)
        .then(function(response){
          console.log(response)
            if(response.status == "success"){
                const mode = response.meta.authorization.mode;
                if(mode == "pin"){
                    res.status(200).json({status: true, ref: uniqueString});
                }else{
                  res.status(500).json({false: false, msg: "This card does not support pin authentication"});
                }
            }
        })
}

const authenticate_deposit = async function(req, res){
    const {name, email, cardNumber, expiry, cvv, amount, pin, ref} = req.body;
    const month_a = expiry[0];
    const month_b = expiry[1];
    const year_a = expiry[3];
    const year_b = expiry[4];
    const month = month_a+month_b;
    const year = year_a+year_b;
    const n_amount = Number(amount);
    const payload = {
        card_number: cardNumber,
        cvv: cvv,
        expiry_month: month,
        expiry_year: year,
        currency: 'NGN',
        amount: n_amount,
        email: email,
        fullname: name,
        tx_ref: ref,
        redirect_url: 'http://localhost:3000/wallet/deposit',
        authorization: {
          mode: "pin", 
          pin: pin
        },
        enckey: process.env.FLUTTER_ENC_KEY
    }
    flw.Charge.card(payload)
        .then(function(resp){
            const response = JSON.parse(resp);
            if(response.status == "success"){
                const mode = response.meta.authorization.mode;
                if(mode == "otp"){
                    res.status(200).json({status: true, ref: ref, flw_ref: response.data.flw_ref});
                }else{
                  res.status(500).json({false: false, msg: "This card does not support pin authentication"});
                }
            }
        })
}

const validate_deposit = function(req, res){
  User.findOne({_id: req.user}).then(async function(user){
    
    const response = await flw.Charge.validate({
      otp: req.body.otp,
      flw_ref: req.body.flw_ref
    });
  if(response.status == "success"){
    const transactionId = response.data.id;
    const transaction = flw.Transaction.verify({
        id: transactionId
    });
    if(transaction.data.status == "successful"){
        User.updateOne({_id: req.user}, {balance: user.balance + transaction.data.amount}).then(function(){
          const newTransaction = new Transaction({
            userId: user._id,
            email: user.email,
            reference_code: req.body.tx_ref,
            transaction_id: response.data.id,
            amount: amount,
            status: "success",
            purpose: "deposit"
          });

          newTransaction
            .save()
            .then((newRecord) => {
              const deposit = new Deposit({userId: user._id, email: user.email, transaction_id: transactionId, amount: transaction.data.amount, status: "success"});
              deposit.save()
              res.status(201).json({msg: "Your deposit was successful"});
            })
            .catch((error) => {
              next(error);
            });
        }).catch(function(err){
          console.log(err)
        })
    }else if(transaction.data.status == "pending"){
      const newTransaction = new Transaction({
        userId: user._id,
        email: user.email,
        reference_code: req.body.ref,
        transaction_id: response.data.id,
        amount: amount,
        status: "pending",
        purpose: "deposit"
      });

      newTransaction
        .save()
        .then((newRecord) => {
          const deposit = new Deposit({userId: user._id, email: user.email, transaction_id: transactionId, amount: transaction.data.amount, status: "pending"});
          deposit.save()
          res.status(201).json({msg: "Your deposit is pending, please check back in a few minutes"});
        })
        .catch((error) => {
          next(error);
        });
    }else{
      res.status(201).json({msg: "Your deposit has failed, please try again"});
    }
  }else{
    res.status(500).json({msg: "Please check your otp and try again"})
  }

  }).catch(err => console.log(err));
}

const check_and_validate_deposit = function(req, res){
  User.findOne({_id: req.user}).then(function(user){
    Deposit.findOne({$and: [{userId: {$eq: req.user}}, {status: {$eq: "pending"}}]}).sort({_id: -1}).then(function(deposit){
        const transactionId = deposit.transaction_id;
        const transaction = flw.Transaction.verify({
          id: transactionId
      });
      if(transaction.data.status == "successful"){
        User.updateOne({_id: req.user}, {balance: user.balance + transaction.data.amount}).then(function(){
          Transaction.updateOne({$and: [{transaction_id: {$eq: transactionId}}, {userId: {$eq: req.user}}]}, {status: "success"})
            .then((newRecord) => {
              Deposit.updateOne({$and: [{transaction_id: {$eq: transactionId}}, {userId: {$eq: req.user}}]}, {status: "success"}).then(function(){
                res.status(201).json({msg: "Your deposit was successful"});
              }).catch(err=>console.error(err));
            })
            .catch((error) => {
              next(error);
            });
        }).catch(function(err){
          console.log(err)
        })
    }
    }).catch(err=>console.error(err));
  }).catch(err=>console.error(err));
}

const top_up = async function(req, res){
  const user = req.user;
  const reloadly = req.reloadly;
      User.findOne({_id: user}).then(function(user){
          if(user){
              if(user.balance >= req.body.amount){
                  req.body.phone = req.body.phone.indexOf(0) == "0" ? req.body.phone.replace("0", "") : req.body.phone;
                  const url = 'https://topups.reloadly.com/operators/auto-detect/phone/' +req.body.phone+ '/countries/NG?suggestedAmounsMap=true&SuggestedAmounts=true';
                  const options = {
                      method: 'GET',
                      headers: {
                          'Authorization': 'Bearer '+ reloadly,
                          'Accept': 'application/com.reloadly.topups-v1+json'
                      }
                  };

                  const reqd = https.request(url, options, (resd) => {
                      let respo = '';

                      resd.on('data', (chunk) => {
                          respo += chunk;
                      });

                      resd.on('end', () => {
                          let respol = JSON.parse(respo);
                          let operatorId = respol.operatorId;
                          const networks = ["mtn", "glo", "airtel", "etisalat"];
                          const net_id = [341, 344, 342, 340];
                          console.log(net_id.indexOf(operatorId));
                          const chosen_network = networks[net_id.indexOf(operatorId)];
                          const url = 'https://topups.reloadly.com/topups';
                          const options = {
                            hostname: 'vtu.ng',
                            port: 443,
                            path: '/wp-json/api/v1/airtime?username=dwighyxawft&password=timilehin1.&phone=0'+req.body.phone+'&network_id='+chosen_network+'&amount='+req.body.amount+'',
                            method: 'GET'
                        };

                          const reqs = https.request(url, options, (ress) => {
                          let respons = '';

                          ress.on('data', (chunk) => {
                              respons += chunk;
                          });

                          ress.on('end', () => {
                            let responsd = JSON.parse(respons);
                            console.log(responsd);
                              if(responsd.code == "success"){
                                const topup = new Topup({userId: user._id, email: user.email, phone_number: user.phone, amount: req.body.amount, transaction_id: t_id});
                                topup.save().then(function(){
                                  const newTransaction = new Transaction({
                                    userId: user._id,
                                    email: user.email,
                                    reference_code: "",
                                    transaction_id: t_id,
                                    amount: amount,
                                    status: "success",
                                    purpose: "airtime topup"
                                  });
                        
                                  newTransaction
                                    .save()
                                    User.findOne({_id: user}).then(function(user){
                                        if(user){
                                            User.updateOne({_id: user}, {balance: user.balance-req.body.amount}).then(function(){
                                                res.status(200).json({msg: "Your topup was successful, your new balance is "+ user.balance});
                                            }).catch(function(err){
                                                res.status(500).json({msg: "Database Error: Could not update user details"})
                                            })
                                        }
                                    }).catch(function(err){
                                        res.status(500).json({msg: "Database Error: Could not get user details"})
                                    })
                                }).catch(function(err){
                                    console.log(err);
                                    res.status(500).json({msg: "Database Error: Could not save payment details"});
                                })
                                  
                              }else{
                                  res.status(500).json({msg: "Your topup was unsuccessful, you will be refunded"});
                              }
                          });
                          });

                          reqs.on('error', (error) => {
                          console.error('error:', error);
                          });

                          reqs.end();
                      });
                  });

                  reqd.on('error', (error) => {
                  console.error('error:', error);
                  });

                  reqd.end();
              }else{
                  res.status(400).json({msg: "Insufficient Funds... Please fund your wallet"});
              }
          }
      }).catch(function(err){
          res.status(500).json({msg: "Database Error: Could not get the user details"});
      })
}

const transfer = async function(req, res){
  const {email, amount} = req.body;
  User.findOne({_id: {$eq: req.user}}).then(function(sender){
      User.findOne({email: {$eq: email}}).then(function(receiver){
          if(receiver){
              if(sender.balance >= amount){
                User.updateOne({_id: {$eq: req.user}}, {balance: sender.balance - amount}).then(function(){
                  User.updateOne({email: {$eq: email}}, {balance: receiver.balance + amount}).then(function(){
                    const uniqueString = uuidv4();
                      const transfer = new Transfer({sender_email: sender.email, receiver_email: receiver.email, amount: amount, transaction_id: uniqueString, status: "success"});
                      transfer.save().then(function(){
                        const newTransaction = new Transaction({
                          userId: sender._id,
                          email: sender.email,
                          reference_code: "",
                          transaction_id: uniqueString,
                          amount: amount,
                          status: "success",
                          purpose: "wallet transfer"
                        });
              
                        newTransaction
                          .save()
                        res.status(200).json({msg: "Your transfer was successful", transfer});
                      }).catch(function(err){
                        console.log(err);
                      })
                  }).catch(function(err){
                    console.log(err);
                  })
                }).catch(function(err){
                  console.log(err);
                })
              }else{
                res.status(200).json({msg: "Your transfer was unsuccessful, Please fund your wallet"});
              }
          }else{
            res.status(400).json({msg: "User does not exist. Please use another email and try again"});
          }
      })
  })
}

const withdraw = function(req, res) {
  User.findOne({_id: {$eq: req.user}}).then(function(user){
    const sagecloud = req.sagecloud;
    const uniqueString = uuidv4();
    const postData = JSON.stringify({
        reference: uniqueString,
        bank_code: req.body.code,
        account_number: req.body.acct,
        account_name: req.body.acct_name,
        amount: req.body.amount,
        narration: "Withdrawal from xawftly"
    });

    const url = 'https://sagecloud.ng/api/v2/transfer/fund-transfer';
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sagecloud,
            'Content-Length': postData.length
        }
    };

    const reqr = https.request(url, options, (resr) => {
        let responseData = '';

        resr.on('data', (chunk) => {
            responseData += chunk;
        });

        resr.on('end', () => {
            const response = JSON.parse(responseData);
            if (response.success) {
                User.updateOne({ _id: req.user }, { balance: user.balance - req.body.amount }).then(function () {
                    const withdrawal = new Withdrawal({
                        userId: user._id,
                        bank_code: req.body.code,
                        reference_code: uniqueString,
                        account_number: req.body.acct,
                        account_name: req.body.acct_name,
                        amount: req.body.amount,
                        status: "success",
                        narration: "Withdrawal from xawftly"
                    });
                    withdrawal.save().then(function () {
                      const newTransaction = new Transaction({
                        userId: user._id,
                        email: user.email,
                        reference_code: "",
                        transaction_id: uniqueString,
                        amount: amount,
                        status: "success",
                        purpose: "withdrawal"
                      });
            
                      newTransaction
                        .save()
                        res.status(200).json({ msg: "Withdrawal successful, You will receive funds within 5 minutes" });
                    }).catch(function (err) {
                        console.log(err);
                        res.status(500).json({ msg: "An error occurred while saving withdrawal data." });
                    })
                })
            } else {
                res.status(400).json({ msg: "Withdrawal Unsuccessful. Please try again later" });
            }
        });
    });

    reqr.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ msg: "An error occurred during the withdrawal request." });
    });

    reqr.write(postData);
    reqr.end();
  }).catch(function(err){
    console.log(err);
  })
}

const buyData = function(req, res){
  User.findOne({_id: {$eq: req.user}}).then(function(user){
    


        const user_id = req.user;
        const reloadly = req.reloadly;
        const plan = req.body.plan;
            User.findOne({_id: {$eq: req.user}}).then(function(user){
              if(user){
                  req.body.phone = req.body.phone.indexOf(0) == "0" ? req.body.phone.replace("0", "") : req.body.phone;
                  const url = 'https://topups.reloadly.com/operators/auto-detect/phone/' +req.body.phone+ '/countries/NG?suggestedAmounsMap=true&SuggestedAmounts=true';
                  const options = {
                      method: 'GET',
                      headers: {
                          'Authorization': 'Bearer '+ reloadly,
                          'Accept': 'application/com.reloadly.topups-v1+json'
                      }
                  };
                
                  const reqd = https.request(url, options, (resd) => {
                      let respo = '';
                
                      resd.on('data', (chunk) => {
                          respo += chunk;
                      });
                
                      resd.on('end', () => {
                        let respol = JSON.parse(respo);
                        console.log(respol);
                        let operatorId = respol.operatorId;
                        const networks = ["mtn", "glo", "airtel", "etisalat"];
                        const net_id = [341, 344, 342, 340];
                        console.log(net_id.indexOf(operatorId));
                        const chosen_network = networks[net_id.indexOf(operatorId)];
                        const plan_network = data_prices[net_id.indexOf(operatorId)];
                        console.log(plan_network);
                        const plan_details = plan_network.filter((plans) => plans.plan == req.body.plan)[0];
                        const plan_price = plan_details.price;
                        const plan_text = plan_details.text;
                        console.log(plan_price);
                        if(user.balance >= plan_price){
                          const url = 'https://vtu.ng/wp-json/api/v1/data?username=dwighyxawft&password=Timilehin1.&phone=0'+req.body.phone+'&network_id='+chosen_network+'&variation_id='+req.body.plan+'';
                          const options = {
                              method: 'GET',
                          };
                          const reqs = https.request(url, options, (ress) => {
                            let respons = '';
                        
                            ress.on('data', (chunk) => {
                                respons += chunk;
                            });
                        
                            ress.on('end', () => {
                              let responsd = JSON.parse(respons);
                              if(responsd.code == "success"){
                                const uniqueString = uuidv4();
                                User.updateOne({user_id: {$eq: req.user}}, {balance: user.balance - plan_price}).then(function(){
                                  const mobile_data = new Data({userId: req.user, email: user.email, phone_number: req.body.phone, network: chosen_network, plan: plan_details.plan, amount: plan_price, transaction_id: uniqueString});
                                  mobile_data.save().then(function(){
                                    const newTransaction = new Transaction({
                                      userId: user._id,
                                      email: user.email,
                                      reference_code: "",
                                      transaction_id: uniqueString,
                                      amount: amount,
                                      status: "success",
                                      purpose: "data topup"
                                    });
                          
                                    newTransaction
                                      .save()
                                    res.status(200).json({msg: plan_text + " has been successfully transferred to your phone number for a total amount of " + plan.price + " from your wallet"})
                                  }).catch(function(err){
                                    console.log(err);
                                  })
                                }).catch(function(err){
                                  console.log(err)
                                })
                              }else{
                                res.status(400).json({msg: "There is an error in your transaction. Please try again later"});
                              }
                            });
                            });
                            reqs.on('error', (error) => {
                              console.error('error:', error);
                            });
                        
                            reqs.end();
                        }else{
                          res.status(500).json({msg: "Insufficient Funds. Please fund your wallet"});
                        }
                      });
                  });
                
                  reqd.on('error', (error) => {
                  console.error('error:', error);
                  });
                
                  reqd.end();
          }
      }).catch(function(err){
          res.status(500).json({msg: "Database Error: Could not get the user details"});
      })
        



  }).catch(function(err){
    console.error(err);
  })
}

const get_data_network = function(req, res){
  const reloadly = req.reloadly;
  req.body.phone = req.body.phone.indexOf(0) == "0" ? req.body.phone.replace("0", "") : req.body.phone;
  const url = 'https://topups.reloadly.com/operators/auto-detect/phone/' +req.body.phone+ '/countries/NG?suggestedAmounsMap=true&SuggestedAmounts=true';
  const options = {
      method: 'GET',
      headers: {
          'Authorization': 'Bearer '+ reloadly,
          'Accept': 'application/com.reloadly.topups-v1+json'
      }
  };

  const reqd = https.request(url, options, (resd) => {
      let respo = '';

      resd.on('data', (chunk) => {
          respo += chunk;
      });

      resd.on('end', () => {
        let respol = JSON.parse(respo);
        console.log(respol);
        let operatorId = respol.operatorId;
        const networks = ["mtn", "glo", "airtel", "etisalat"];
        const net_id = [341, 344, 342, 340];
        console.log(net_id.indexOf(operatorId));
        const chosen_network = networks[net_id.indexOf(operatorId)];
        const plan_network = data_prices[net_id.indexOf(operatorId)];
        res.status(200).json({chosen_network, plan_network});
      });
  });

  reqd.on('error', (error) => {
  console.error('error:', error);
  });

  reqd.end();
}

const get_airtime_network = function(req, res){
  const reloadly = req.reloadly;
  req.body.phone = req.body.phone.indexOf(0) == "0" ? req.body.phone.replace("0", "") : req.body.phone;
  const url = 'https://topups.reloadly.com/operators/auto-detect/phone/' +req.body.phone+ '/countries/NG?suggestedAmounsMap=true&SuggestedAmounts=true';
  const options = {
      method: 'GET',
      headers: {
          'Authorization': 'Bearer '+ reloadly,
          'Accept': 'application/com.reloadly.topups-v1+json'
      }
  };

  const reqd = https.request(url, options, (resd) => {
      let respo = '';

      resd.on('data', (chunk) => {
          respo += chunk;
      });

      resd.on('end', () => {
        let respol = JSON.parse(respo);
        console.log(respol);
        let operatorId = respol.operatorId;
        const networks = ["mtn", "glo", "airtel", "etisalat"];
        const net_id = [341, 344, 342, 340];
        console.log(net_id.indexOf(operatorId));
        const chosen_network = networks[net_id.indexOf(operatorId)];
        res.status(200).json({chosen_network});
      });
  });

  reqd.on('error', (error) => {
  console.error('error:', error);
  });

  reqd.end();
}

const get_cable_network = function(req, res){
  const service = req.body.service;
  const cable = ["dstv", "gotv", "startimes"];
  const chosen_cable = cable.indexOf(service);
  const cable_plans = chosen_cable >= 0 ? cables[chosen_cable] : false;
  if(cable_plans){
    res.status(200).json({plans: cable_plans});
  }else{
    res.status(500).json({plans: "Please select your plan"});
  }
}

const electricity_payment = function(req, res){
    const user_id = req.user;
    const {amount, meter, service, type, phone} = req.body;
    User.findOne({_id: user_id}).then(function(user){
      if(user){
            const url = 'https://vtu.ng/wp-json/api/v1/verify-customer?username=dwighyxawft&password=Timilehin1.&customer_id='+meter+'&service_id='+service+'&variation_id='+type+'';
            const options = {
                method: 'GET',
            };
            const reqs = https.request(url, options, (ress) => {
              let respons = '';
          
              ress.on('data', (chunk) => {
                  respons += chunk;
              });
          
              ress.on('end', () => {
                let responsd = JSON.parse(respons);
                if(responsd.code == "success" && user.balance >= amount){
                  const url2 = 'https://vtu.ng/wp-json/api/v1/electricity?username=dwighyxawft&password=Timilehin1.&phone='+phone+'&meter_number='+meter+'&service_id='+service+'&variation_id='+type+'&amount='+amount+'';
                  const options2 = {
                      method: 'GET',
                  };
                  const reqs2 = https.request(url2, options2, (ress2) => {
                    let respons2 = '';
                
                    ress2.on('data', (chunk) => {
                        respons2 += chunk;
                    });
                
                    ress2.on('end', () => {
                      let responsd2 = JSON.parse(respons2);
                      if(responsd2.code == "success"){
                          User.updateOne({_id: {$eq: req.user}}, {balance: user.balance - amount}).then(function(){
                            const electricity = new Electricity({userId: req.user, token: responsd2.data.token, amount: amount, reference_id: responsd2.data.order_id, phone: phone, meter: meter, biller_id: service});
                            electricity.save().then(function(){
                              const newTransaction = new Transaction({
                                userId: user._id,
                                email: user.email,
                                reference_code: "",
                                transaction_id: responsd2.data.order_id,
                                amount: amount,
                                status: "success",
                                purpose: "electricity payment"
                              });
                    
                              newTransaction
                                .save()
                              res.status(200).json({msg: "Your electricity bill has been successfully paid"});
                            }).catch(function(err){
                              console.log(err);
                            })
                          }).catch(function(err){
                            console.log(err);
                          })
                      }else{
                        res.status(400).json({msg: responsd2.message})
                      }
                    });
                    });
                    reqs2.on('error', (error) => {
                      console.error('error:', error);
                    });
                
                    reqs2.end();
                }else{
                  res.status(400).json({msg: responsd.message})
                }
              });
              });
              reqs.on('error', (error) => {
                console.error('error:', error);
              });
          
              reqs.end();
      }
    }).catch(function(err){
      res.status(500).json({msg: "Database Error: Could not get the user details"});
  })
}

const electricity_details = function(req, res){
  const user = req.user;
      User.findOne({_id: user}).then(function(user){
        if(user){
          res.status(200).json({electrics: electrics});
        }
      }).catch(function(err){
          res.status(500).json({msg: "Database Error: Could not get the user details"});
      })
}

const cable_payment = function(req, res){
  const user_id = req.user;
  const {iuc, service, type, phone} = req.body;
  const cable = ["dstv", "gotv", "startimes"];
  const chosen_cable = cable.indexOf(service);
  const cable_plans = chosen_cable >= 0 ? cables[chosen_cable] : false;
  const plan_details = cable_plans.filter((plans) => plans.plan == type)[0];
  const plan_price = plan_details.price;
  const plan_text = plan_details.text;
  User.findOne({_id: user_id}).then(function(user){
    if(user){
          const url = 'https://vtu.ng/wp-json/api/v1/verify-customer?username=dwighyxawft&password=Timilehin1.&customer_id='+iuc+'&service_id='+service+'';
          const options = {
              method: 'GET',
          };
          const reqs = https.request(url, options, (ress) => {
            let respons = '';
        
            ress.on('data', (chunk) => {
                respons += chunk;
            });
        
            ress.on('end', () => {
              let responsd = JSON.parse(respons);
              if(responsd.code == "success" && user.balance >= plan_price){
                const url2 = 'https://vtu.ng/wp-json/api/v1/tv?username=dwighyxawft&password=Timilehin1.&phone='+phone+'&service_id='+service+'&smartcard_number='+iuc+'&variation_id='+type+'';
                const options2 = {
                    method: 'GET',
                };
                const reqs2 = https.request(url2, options2, (ress2) => {
                  let respons2 = '';
              
                  ress2.on('data', (chunk) => {
                      respons2 += chunk;
                  });
              
                  ress2.on('end', () => {
                    let responsd2 = JSON.parse(responsd2);
                    if(responsd2.code == "success"){
                        User.updateOne({_id: {$eq: req.user}}, {balance: user.balance - amount}).then(function(){
                          const cable = new Cable({userId: req.user, type: plan_text, amount: plan_price, reference_id: responsd2.data.order_id, phone: phone, iuc: iuc, biller_id: service});
                          cable.save().then(function(){
                            const newTransaction = new Transaction({
                              userId: user._id,
                              email: user.email,
                              reference_code: "",
                              transaction_id: responsd2.data.order_id,
                              amount: amount,
                              status: "success",
                              purpose: "cable tv payment"
                            });
                  
                            newTransaction
                              .save()
                            res.status(200).json({msg: "Your cable tv bill has been successfully paid"});
                          }).catch(function(err){
                            console.log(err);
                          })
                        }).catch(function(err){
                          console.log(err);
                        })
                    }else{
                      res.status(400).json({msg: responsd2.message})
                    }
                  });
                  });
                  reqs2.on('error', (error) => {
                    console.error('error:', error);
                  });
              
                  reqs2.end();
              }else{
                res.status(400).json({msg: responsd.message})
              }
            });
            });
            reqs.on('error', (error) => {
              console.error('error:', error);
            });
        
            reqs.end();
    }
  }).catch(function(err){
    res.status(500).json({msg: "Database Error: Could not get the user details"});
})
}

const betting_billers = function(req, res) {
    const sagecloud = req.sagecloud;
    const url = 'https://sagecloud.ng/api/v2/betting/billers';

    const options = {
        method: 'GET',
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            'Authorization': 'Bearer ' + sagecloud
        }
    };

    const reqr = https.request(url, options, (resr) => {
        let data = '';

        resr.on('data', (chunk) => {
            data += chunk;
        });

        resr.on('end', () => {
            const response = JSON.parse(data);
            if (response.success) {
                res.status(200).json({ msg: response.data });
            } else {
                res.status(500).json({ msg: "Failed to fetch data." });
            }
        });
    });

    reqr.on('error', (error) => {
        console.error(error);
        res.status(500).json({ msg: "An error occurred." });
    });

    reqr.end();
}

const betting_validate = function(req, res) {
    const sagecloud = req.sagecloud;
    const data = JSON.stringify({
        type: req.body.type,
        customerId: req.body.customerId
    });

    const url = 'https://sagecloud.ng/api/v2/betting/validate';

    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': 'Bearer ' + sagecloud
        }
    };

    const reqr = https.request(url, options, (resr) => {
        let responseData = '';

        resr.on('data', (chunk) => {
            responseData += chunk;
        });

        resr.on('end', () => {
            const response = JSON.parse(responseData);
            if (response.success) {
                res.status(200).json({ status: true });
            } else {
                res.status(400).json({ status: false });
            }
        });
    });

    reqr.on('error', (error) => {
        console.error(error);
        res.status(500).json({ msg: "An error occurred." });
    });

    reqr.write(data);
    reqr.end();
}

const betting_funder = function(req, res){
  User.findOne({_id: req.user}).then(function(user){
    const {type, customerId, amount} = req.body;
    const sagecloud = req.sagecloud;
      const uniqueString = uuidv4();
      const postData = JSON.stringify({
        reference: uniqueString,
        type: type,
        customerId: customerId,
        name: user.name,
        amount: amount
    });

    const url = 'https://sagecloud.ng/api/v2/betting/payment';
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sagecloud,
            'Content-Length': postData.length
        }
    };

    const reqr = https.request(url, options, (resr) => {
        let responseData = '';

        resr.on('data', (chunk) => {
            responseData += chunk;
        });

        resr.on('end', () => {
            const response = JSON.parse(responseData);
            if(response.success && response.status == "success"){
              const newTransaction = new Transaction({
                userId: user._id,
                email: user.email,
                reference_code: "",
                transaction_id: uniqueString,
                amount: amount,
                status: "success",
                purpose: "bet funding"
              });
    
              newTransaction
                .save().then(function(){
                    const betting = new Betting({userId: user._id, customerId: customerId, platform: type, amount: amount, status: "success", transaction_id: uniqueString});
                    betting.save();
                    res.status(200).json({msg: "Your betting funding was successful"});
                }).catch(function(err){
                  console.error(err);
                })
            }else{
              res.status(200).json({msg: "Your betting funding was unsuccessful"});
            }
        });
    });

    reqr.on('error', (error) => {
        callback(error);
    });

    reqr.write(postData);
    reqr.end();
  }).catch(function(err){
    console.error(err);
  })
}

const fetch_banks = function(req, res) {
    const sagecloud = req.sagecloud;
    const url = 'https://sagecloud.ng/api/v2/transfer/get-transfer-data';

    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sagecloud
        }
    };

    const reqr = https.request(url, options, (resr) => {
        let responseData = '';

        resr.on('data', (chunk) => {
            responseData += chunk;
        });

        resr.on('end', () => {
            const response = JSON.parse(responseData);
            res.status(200).json({ response });
        });
    });

    reqr.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ msg: "An error occurred." });
    });

    reqr.end();
}

const verify_bank_details = function(req, res) {
    const sagecloud = req.sagecloud;
    const postData = JSON.stringify({
        bank_code: req.body.code,
        account_number: req.body.acct
    });

    const url = 'https://sagecloud.ng/api/v2/transfer/verify-bank-account';

    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sagecloud,
            'Content-Length': postData.length
        }
    };

    const reqr = https.request(url, options, (resr) => {
        let responseData = '';

        resr.on('data', (chunk) => {
            responseData += chunk;
        });

        resr.on('end', () => {
            const response = JSON.parse(responseData);
            if (response.success) {
                res.status(200).json({ response });
            } else {
                res.status(400).json({ msg: "Details not valid" });
            }
        });
    });

    reqr.on('error', (error) => {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ msg: "An error occurred." });
    });

    reqr.write(postData);
    reqr.end();
}

const bank_transfer = function(req, res){
  User.findOne({_id: req.user}).then(function(user){
    
 const sagecloud = req.sagecloud;
 const uniqueString = uuidv4();
    const postData = JSON.stringify({
      reference: uniqueString,
      bank_code: req.body.code,
      account_number: req.body.acct,
      account_name: req.body.acct_name,
      amount: req.body.amount,
      narration: req.body.narration
    });

    const options = {
      hostname: 'sagecloud.ng',
      path: '/api/v2/transfer/fund-transfer',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ sagecloud, // Replace 'YOUR_AUTH_TOKEN' with your actual token
        'Content-Length': postData.length
      }
    };

    const reqr = https.request(options, (res) => {
      let data = '';

      // A chunk of data has been received.
      resr.on('data', (chunk) => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resr.on('end', () => {
        const response = JSON.parse(data);
            if(response.success){
              User.updateOne({_id: req.user}, {balance: user.balance - req.body.amount}).then(function(){
                const transfer = new BankTransfer({user_id: user._id, bank_code: req.body.code, reference: uniqueString, acct_number: req.body.acct, acct_name: req.body.acct_name, amount: req.body.amount, status: "success", narration: req.body.narration});
                transfer.save().then(function(){
                  const newTransaction = new Transaction({
                    userId: user._id,
                    email: user.email,
                    reference_code: "",
                    transaction_id: uniqueString,
                    amount: amount,
                    status: "success",
                    purpose: "bank transfer"
                  });
        
                  newTransaction
                    .save()
                  res.status(200).json({msg: "Transfer successful, The recipient will receive funds within 5 minutes"});
                }).catch(function(err){
                  console.log(err);
                })
              })
            }else{
              res.status(400).json({msg: "Transfer Unsuccessful. Please try again later"});
            }
      });
    });

    reqr.on('error', (error) => {
      console.error(`Error: ${error.message}`);
    });

    // Write the post data to the request body
    reqr.write(postData);

    // End the request
    reqr.end();


  }).catch(function(err){
    console.error(err);
  })
}

const edit_details = function(req, res){
  const {name, email, username} = req.body;
  User.updateOne({_id: req.user}, {name: name, email: email, username: username}).then(function(){
      res.status(200).json({msg: "Your personal information has been updated successfully"});
  }).catch(function(err){
    console.log(err);
  })
}

const change_dp = function(req, res){
  res.status(200).json({msg: "The profile picture has been uploaded successfully"});
}

const change_password = function(req, res){
  const {current_pass, new_pass, confirm_pass} = req.body
    User.findOne({_id: {$eq: req.user}}).then(function(user){
        if(bcrypt.compare(current_pass, user.password)){
          if(new_pass == confirm_pass){
              const hash = bcrypt.hash(new_pass, 10);
              User.updateOne({_id: req.user}, {password: hash}).then(function(){
                res.status(200).json({msg: "Your password has been updated successfully"});
              }).catch(function(err){
                console.log(err);
              })
          }else{
            res.status(200).json({msg: "The passwords are not matching"});
          }
        }else{
          res.status(200).json({msg: "Please provide the correct password"});
        }
    })
}

const change_pin = function(req, res){
  const {current_pin, new_pin, confirm_pin} = req.body
    User.findOne({_id: {$eq: req.user}}).then(function(user){
        if(current_pin == user.pin){
          if(new_pass == confirm_pin){
              User.updateOne({_id: req.user}, {pin: new_pin}).then(function(){
                res.status(200).json({msg: "Your pin has been changed successfully"});
              }).catch(function(err){
                console.log(err);
              })
          }else{
            res.status(200).json({msg: "The pins are not matching"});
          }
        }else{
          res.status(200).json({msg: "Please provide the correct password"});
        }
    })
}

const support = function(req, res){
  const { name, email, subject, message } = req.body;
  User.findOne({email: {$eq: email}}).then(function(user){
    if(user){
        const complaint = new Complaints({ userId: user._id, name: name, email: email, subject: subject, body: body});
        complaint.save().then(async function(){
            let transport = mail();
            await transport.sendMail(tmp_feedback(name, email));
            res.status(200).json({msg: "Your complaint has been forwarded. We will respond within 48 hours"});
        }).catch(function(err){
          console.log(err)
        })
    }else{
      res.status(404).json({msg: "This user does not exist"});
    }
  }).catch(function(err){
    consle.log(err)
  })
}



const admin = function(req, res){
  res.render("admin_login");
}

const add_admin = function(req, res){
    const {password} = req.body;
    req.body.password = bcrypt.hash(password, 10);
    const admin = new Admin(req.body);
    admin.save().then(function(){
      res.status(200).json({status: true, msg: "The new admin has been added successfully"});
    }).catch(function(err){
      console.log(err);
    })
}

const admin_login = function(req, res){
  const { email, password } = req.body;
  Admin.findOne({email: email}).then(function(admin){
      if(admin){ 
              Auth.findOne({admin: {$eq: admin._id}}).then(function(auth){
                  if(!auth){
                      if(bcrypt.compare(password, admin.password)){         
                          const details = {admin: admin._id};
                          const accessToken = generateToken(details);
                          const refreshToken = jwt.sign(details, process.env.REFRESH_TOKEN);
                          const auth = new Auth({admin_id: admin._id, access: accessToken, refresh: refreshToken});
                          auth.save().then(function(){
                              delete admin.password;
                              req.user = admin._id;
                              global = admin._id;
                              res.cookie('accessToken', accessToken);
                              req.refreshToken = refreshToken;
                              res.status(200).json({msg: "User has been logged in", admin, status: true});
                          }).catch(function(error){
                              res.status(500).json({msg: "Database Error: Could not save authentication details", error, status: false});
                          })
                      }else{
                          res.status(400).json({msg: "Your credentials are incorrect, Please try again", status: false});
                      }
                  }else{
                      if(auth.expires_at <= Date.now()){
                          Auth.deleteOne({admin_id: {$eq: admin._id}}).then(function(){
                              if(bcrypt.compare(password, admin.password)){         
                                  const details = {admin: admin._id};
                                  const accessToken = generateToken(details);
                                  const refreshToken = jwt.sign(details, process.env.REFRESH_TOKEN);
                                  const auth = new Auth({admin_id: admin._id, access: accessToken, refresh: refreshToken});
                                  auth.save().then(function(){
                                      delete admin.password;
                                      req.user = admin._id;
                                      global = admin._id;
                                      res.cookie('accessToken', accessToken);
                                      req.refreshToken = refreshToken;
                                      res.status(200).json({msg: "User has been logged in", admin, status: true});
                                  }).catch(function(error){
                                      res.status(500).json({msg: "Database Error: Could not save authentication details", error, status: false});
                                  })
                              }else{
                                  res.status(400).json({msg: "Your credentials are incorrect, Please try again", status: false});
                              }                           
                           })
                      }else{
                              req.user = admin._id;
                              global = admin._id;
                              res.cookie('accessToken', auth.access);
                              req.refreshToken = auth.refresh;
                              res.status(200).json({msg: "User has been logged in", admin, status: true});
                      }
                  }
              })
      }else{
           res.status(400).json({msg: "This user does not exist, please register and try again"});
      }
  }).catch(function(err){
      res.status(500).json({msg: "Database Error: Could not get the user details"});
  })
}

const admin_complaints = function(req, res){
    const start = Number(req.param.start);
    Complaints.find().skip(start).limit(16).then(function(complaints){
      Complaints.find().then(function(numbers){
        res.render("admin_dashboard", {complaints, numbers: numbers.length});
      }).catch(function(err){
        console.log(err);
      })
    }).catch(function(err){
      console.log(err);
    })
}

const admin_send_mail = function(req, res){
  const {email, mail} = req.body;
    User.findOne({email: email}).then(async function(user){
      if(user){
        let transport = mail();
        await transport.sendMail(admin_feedback(user.name, email, mail));
        res.status(200).json({status: true, msg: "Email sent successfully"});
      }else{
        res.status(200).json({status: false, msg: "User not registered"});
      }
    })
}

const admin_complaint = function(req, res){
  const id = req.params.id;
  Complaints.findOne({_id: id}).then(function(complaint){
    if(complaint){
      res.render("complaint_details", {complaint: complaint});
    }else{
      res.redirect("/admin/dashboard/1");
    }
  }).catch(function(err){
    console.log(err);
  })
}

const search_complaint = function(req, res){
  Complaints.find({email: req.body.email}).then(function(complaints){
    res.status(200).json({complaints: complaints});
  }).catch(function(err){
    console.log(err);
  })
}

const search_transaction = function(req, res){
  const {transactionID} = req.body;
  Transaction.find({transaction_id: transactionID}).then(function(transaction){
      if(transaction){
          if(transaction.length > 1){
            const purposes = ["cable tv payment", "electricity payment", "bank transfer", "wallet transfer", "deposit", "withdrawal", "airtime topup", "data topup", "bet funding"];
            const models = [Cable, Electricity, BankTransfer, Transfer, Deposit, Withdrawal, Topup, Data, Betting];
            const data = [];
              transaction.forEach(function(trans){
                  const Modelling = models[purposes.indexOf(trans.purpose)];
                  Modelling.findOne({transaction_id: trans.transaction_id}).then(function(model){
                      data.push(model);
                  })
              })
              res.status(200).json({data: data, status: true});
          }else{
            const data = [];
              const Modelling = models[purposes.indexOf(transaction.purpose)];
              Modelling.findOne({transaction_id: trans.transaction_id}).then(function(model){
                data.push(model)
                res.status(200).json({data: data, status: true});
              })
          }
      }else{
        res.status(400).json({status: false, msg: "No transaction with this ID"});
      }
  }).catch(function(err){
    console.error(err);
  })
}

const admin_validate_deposit = function(req, res){
  User.findOne({_id: req.body.email}).then(function(user){
    Deposit.findOne({$and: [{userId: {$eq: req.user}}, {status: {$eq: "pending"}}]}).sort({_id: -1}).then(function(deposit){
        const transactionId = req.body.transactionId;
        const transaction = flw.Transaction.verify({
          id: transactionId
      });
      if(transaction.data.status == "successful"){
        User.updateOne({_id: req.user}, {balance: user.balance + transaction.data.amount}).then(function(){
          Transaction.updateOne({$and: [{transaction_id: {$eq: transactionId}}, {userId: {$eq: req.user}}]}, {status: "success"})
            .then((newRecord) => {
              Deposit.updateOne({$and: [{transaction_id: {$eq: transactionId}}, {userId: {$eq: req.user}}]}, {status: "success"}).then(function(){
                res.status(201).json({status: true});
              }).catch(err=>console.error(err));
            })
            .catch((error) => {
              next(error);
            });
        }).catch(function(err){
          console.log(err)
        })
    }else{
      res.status(201).json({status: false});
    }
    }).catch(err=>console.error(err));
  }).catch(err=>console.error(err));
}

const admin_settings = function(req, res){
  const {name, email, phone, gender, password} = req.body;
  req.body.password = bcrypt.hash(password, 10);
  Admin.updateOne({_id: req.user}, {name: name, email: email, gender: gender, phone:phone, password: req.body.password}).then(function(){
    res.status(200).json({status: true, msg: "The admin details has been updated successfully"});
  }).catch(function(err){
    console.log(err);
  })
}

const admin_settings_redirect = function(req, res){
  Admin.findOne({_id: req.user}).then(function(admin){
      res.render("admin_settings", {admin: admin});
  }).catch(err=>console.error(err));
}

const add_admin_redirect = function(req, res){
  res.render("admin_adder");
}

const logout = function(req, res){
  Auth.findOneAndDelete({user_id: req.user}).then(function(){
      res.redirect("/wallet")
  }).catch(err=>console.error(err));
}

const admin_logout = function(req, res){
  Auth.findOneAndDelete({admin_id: req.user}).then(function(){
      res.redirect("/wallet/admin")
  }).catch(err=>console.error(err));
}

const admin_search = function(req, res){
  res.render("admin_searches");
}







module.exports = {
    get_started,
    register,
    verify,
    login,
    forgotten_password,
    reset_password,
    get_new_pass,
    flutterWallet,
    flutterPaymentCheck,
    top_up,
    electricity_details,
    electricity_payment,
    transfer,
    withdraw, 
    buyData,  
    cable_payment,
    betting_billers,
    betting_funder,
    betting_validate,
    fetch_banks,
    verify_bank_details,
    bank_transfer,
    initiate_deposit,
    authenticate_deposit,
    validate_deposit,
    check_and_validate_deposit,
    edit_details,
    change_dp,
    change_password,
    change_pin,
    support,
    get_airtime_network,
    get_data_network,
    get_cable_network,
    register_redirect,
    contact_redirect,
    forgot_password_redirect,
    features,
    login_redirect,
    dashboard,
    airtime_redirect,
    data_redirect,
    cable_redirect,
    electricity_redirect,
    betting_redirect,
    transfer_redirect,
    wallet_transfer_redirect,
    banks_transfer_redirect,
    withdrawal_redirect,
    deposit_redirect,
    settings_redirect,
    admin_complaints,
    admin, admin_login, add_admin,
    search_transaction,
    admin_complaint,
    search_complaint,
    admin_validate_deposit,
    admin_settings,
    admin_settings_redirect,
    logout,
    admin_logout, 
    add_admin_redirect,
    admin_send_mail,
    admin_search
}