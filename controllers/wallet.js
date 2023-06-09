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
// Payment record model
const PaymentRecord = require("../models/paymentRecord");
const Transfer = require("../models/Transfers");
const Withdrawal = require("../models/Withdrawals");
const Data = require("../models/Data");
const data_prices = require("../middlewares/data_prices");
const electrics = require("../middlewares/electric");
const cables = require("../middlewares/cables");

// Salt Round Value
const saltRound = 10;
require("dotenv").config();


const flw = new Flutterwave(
    process.env.FLUTTER_TEST_PUBLIC_KEY,
    process.env.FLUTTER_TEST_SECRET_KEY
);


function verifyEmail(currentUrl, email, _id){
    return {
        from: "amuoladipupo420@gmail.com",
        to: email,
        subject: "Verify your email",
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
                <h1>Email Verification</h1>
                <p>Verify your email address to complete your signup and login to your account</p>
                <p>This link <strong>expires in 6 hours</strong>.</p>
                <p>Click the link below to proceed:</p>
                <a href="${currentUrl + 'wallet/verify/' + _id}" class="button">Verify Email Address</a>
                <p style="margin-top: 20px">You can also copy and paste the following link in your browser</p>
                <p style="margin-top: 10px;"><a href="${currentUrl + 'verify/' + _id}">Verify Email Address</a></p>
            </div>
        </body>
        </html>`
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

// Generate 8-digit reference code
function generateRandomString() {
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
    let result = "";
  
    for (let i = 0; i < 12; i++) {
      let randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
  
    return result;
}




const get_started = function(req, res){
    res.render("home");
}

const register = function(req, res){
        User.findOne({ email: {$eq: req.body.email}}).then(function(existing){
            if(!existing){
                bcrypt.hash(req.body.password, 10).then(function(hash){
                    req.body.password = hash;
                    const user = new User(req.body);
                    user.save().then(function(){
                          let verifyUser = new Verification({user_id: user._id, email: user.email, link: "http://localhost:3000/verify/"+user._id});
                          verifyUser.save().then(function(){
                            let transport = mail();
                            transport.sendMail(verifyEmail("http://localhost:3000/", user.email, user._id));
                            res.status(200).json({msg: "The user has been registered successfully, A registration link has been sent to your email", user})
                          }).catch(function(error){
                            res.status(500).json({msg: "Database Error: Could not save verification details"});
                          })
                    }).catch(function(err){
                        res.status(500).json({msg: "Database Error: Could not save user details"});
                    })
                }).catch(function(err){
                    res.status(500).json({msg: "Server Error: Error hashing the password"});
                })
              
            }else{
                if(!existing.verified){
                    Verification.findOne({$and: [{user_id: {$eq: existing._id}}, {email: {$eq: existing.email}}]}).then(function(verify){
                        if(verify){
                            if(verify.expires <= Date.now()){
                                Verification.deleteOne({$and: [{user_id: {$eq: existing._id}}, {email: {$eq: existing.email}}]}).then(function(){
                                    let verifyUser = new Verification({user_id: existing._id, email: existing.email, link: "http://localhost:3000/verify/"+existing._id});
                                    verifyUser.save().then(function(){
                                        let transport = mail();
                                        transport.sendMail(verifyEmail("http://localhost:3000/", existing.email, existing._id));
                                        res.status(200).json({msg: "This user already exists, A registration link has been sent to your email", existing})
                                    })
                                })
                            }else{
                                res.status(200).json({msg: "This user already exists, A verification link has been sent to you, If not seen in your inbox, check your spam folder", existing})
                            }
                        }
                    })
                }else{
                    res.status(200).json({msg: "This user already exists", existing});
                }
            }
        })

}

const verify = function(req, res){
    const id = req.params.id;
    Verification.findOne({ user_id: {$eq: id}}).then(function(details){
        if(details){
            if(details.expires <= Date.now()){
                Verification.deleteOne({ user_id: {$eq: id}}).then(function(){
                    res.status(404).json({msg: "This link has expired, Please try again"});
                }).catch(function(err){
                    res.status(500).json({msg: "Database Error: Verification details could not be deleted"});
                })
            }else{
                User.updateOne({_id: {$eq: id}}, {verified: true}).then(function(){
                    Verification.deleteOne({ user_id: {$eq: id}}).then(function(){
                        res.status(200).json({msg: "User email verification successful"});
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
                                res.status(200).json({msg: "User has been logged in", user});
                            }).catch(function(error){
                                res.status(500).json({msg: "Database Error: Could not save authentication details", err});
                            })
                        }else{
                            res.status(400).json({msg: "Your credentials are incorrect, Please try again"});
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
                                        res.status(200).json({msg: "User has been logged in", user});
                                    }).catch(function(error){
                                        res.status(500).json({msg: "Database Error: Could not save authentication details", err});
                                    })
                                }else{
                                    res.status(400).json({msg: "Your credentials are incorrect, Please try again"});
                                }                           
                             })
                        }else{
                                req.user = user._id;
                                global = user._id;
                                res.cookie('accessToken', auth.access);
                                req.refreshToken = auth.refresh;
                                res.status(300).json({msg: "This user is logged in"});
                        }
                    }
                })
            }else{
                res.status(400).json({msg: "Please verify your details before you login"});
            }
        }else{
             res.status(400).json({msg: "This user does not exist, please register and try again"});
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
        if (forgot_pass.send(id, email)) {
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
    let id = req.params.id;
    let u_str = req.params.u_str;
    Forgot.findOne({
      $and: [{ user_id: { $eq: id } }, { u_uid: { $eq: u_str } }],
    }).then((forgot) => {
      if (forgot) {
        if (forgot.expires_at < Date.now()) {
          Forgot.deleteOne({ user_id: id })
            .then(function () {
              res
                .status(200)
                .json({ msg: "This link has expired, Please try again" });
            })
            .catch(function (err) {
              console.log(err);
            });
        } else {
          User.updateOne({ _id: { $eq: id } }, { password: "" }).then(function (
            user
          ) {
            if (user) {
              res.status(200).json({
                msg: "Your password has been reset, please click this link to put your new password",
                link:
                  "http://localhost:3000/wallet/get_new_pass/" +
                  id +
                  "/" +
                  u_str,
              });
            }
          });
        }
      } else {
        res.status(200).json({ msg: "This link is not valid, please try again" });
      }
    });
};
  
const get_new_pass = function (req, res) {
    let id = req.params.id;
    let u_str = req.params.u_str;
    let pass = req.body.password;
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
}

const flutterWallet = async (req, res, next) => {
  const reference_code = generateRandomString();
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
                        console.log(respol);
                          let operatorId = respol.operatorId;
                          const url = 'https://topups.reloadly.com/topups';
                          const options = {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                              Accept: 'application/com.reloadly.topups-v1+json',
                              Authorization: 'Bearer '+ reloadly
                          }
                          };

                          const data = JSON.stringify({
                              operatorId: operatorId,
                              amount: req.body.amount,
                              useLocalAmount: true,
                              customIdentifier: 'This is example identifier 130',
                              recipientEmail: user.email,
                              recipientPhone: { countryCode: 'NG', number: '234'+req.body.phone },
                              senderPhone: { countryCode: 'NG', number: '2348181107488' }
                          });

                          const reqs = https.request(url, options, (ress) => {
                          let respons = '';

                          ress.on('data', (chunk) => {
                              respons += chunk;
                          });

                          ress.on('end', () => {
                            let responsd = JSON.parse(respons);
                            console.log(responsd);
                              if(responsd.status == "SUCCESSFUL"){
                                const t_id = responsd.transactionId;
                                    const options = {
                                      hostname: 'topups.reloadly.com',
                                      path: '/topups/'+t_id+'/status',
                                      method: 'GET',
                                      headers: {
                                        'Accept': 'application/com.reloadly.topups-v1+json',
                                        'Authorization': 'Bearer ' + req.reloadly
                                      }
                                    };

                                    const reqa = https.request(options, (resa) => {
                                      let why = "";
                                      console.log(`Status Code: ${resa.statusCode}`);

                                      resa.on('data', (chunk) => {
                                         why += chunk;
                                      });
                                      resa.on('end', () => {
                                        let what = JSON.parse(why);
                                        if(what.status == "SUCCESSFUL"){
                                          const topup = new Topup({userId: user._id, email: user.email, phone_number: user.phone, amount: req.body.amount, transaction_id: t_id});
                                            topup.save().then(function(){
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
                                          res.status(500).json({msg: "Server error."});
                                        }
                                      });
                                    });
                                    reqa.on('error', (error) => {
                                      console.error(`Request Error: ${error}`);
                                    });

                                    reqa.end();

                                  
                              }else{
                                  res.status(500).json({msg: "Your topup was unsuccessful, you will be refunded"});
                              }
                          });
                          });

                          reqs.on('error', (error) => {
                          console.error('error:', error);
                          });

                          reqs.write(data);
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
                      const transfer = new Transfer({sender_email: sender.email, receiver_email: receiver.email, amount: amount, transaction_id: generateRandomString(), status: "success"});
                      transfer.save().then(function(){
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

const withdraw = function(req, res, next){
  User.findOne({_id: {$eq: req.user}}).then(function(user){
    const reference_code = generateRandomString();
  const { account_bank, account_number, amount, narration } = req.body;
  const details = {
    account_bank: account_bank,
    account_number: account_number,
    amount: amount,
    currency: "NGN",
    narration: narration,
    reference: reference_code,
  };
  flw.Transfer.initiate(details).then((response) => {
    const withdrawal = new Withdrawal({
      userId: user._id,
      email: user.email,
      reference_code: reference_code,
      amount: amount,
      account_number: account_number,
      account_bank: account_bank,
    });

    withdrawal.save().then(() => {
        res.status(201).json({
          status: "success",
          message: "Your withdrawal is being processed.",
        });
      })
      .catch((error) => {
        next(error);
      });
  }).catch((error) => {
    console.log(error);
    res.json(error)
  });
  }).catch(function(err){
    console.log(err)
  })
}

const getAvailable = function(req, res, next){
  const { country } = req.query;
  const tokenData = req.reloadly;
  if (country != "US" && country != "NG") {
    res
      .status(404)
      .json({ message: "This country is not available yet on payflex" });
    return;
  }
  const options = {
    hostname: "giftcards.reloadly.com",
    path: `/countries/${country}/products`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokenData}`,
    },
  };

  const reqGet = https.request(options, (resGet) => {
    let data = "";

    resGet.on("data", (chunk) => {
      data += chunk;
    });

    resGet.on("end", () => {
      const response = JSON.parse(data);
      res.status(200).json(response);
    });
  });

  reqGet.on("error", (error) => {
    next(error);
  });

  reqGet.end();
};

const orderGiftcard = function(req, res, next){
  const tokenData = req.reloadly;
  User.findOne({_id: {$eq: tokenData}}).then(function(user){
    const {
      productIdString,
      quantityString,
      unitPriceString,
      customIdentifier,
      recipientEmail,
      recipientCountryCode,
      recipientPhoneNumber,
    } = req.body;
  
    const [productId, quantity, unitPrice] = [
      parseInt(productIdString),
      parseInt(quantityString),
      parseInt(unitPriceString),
    ];
  
    const options = {
      hostname: "giftcards.reloadly.com",
      path: "/orders",
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData}`,
        "Content-Type": "application/json",
      },
    };
  
    const data = JSON.stringify({
      productId: productId,
      countryCode: "NG",
      quantity: quantity,
      unitPrice: unitPrice,
      customIdentifier: customIdentifier,
      senderName: full_name,
      recipientEmail: recipientEmail,
      recipientPhoneDetails: {
        countryCode: recipientCountryCode,
        phoneNumber: recipientPhoneNumber,
      },
    });

    if(user.balance >= unitPrice && req.balance >= unitPrice){
      
  
    const reqOrder = https.request(options, (resOrder) => {
      let responseData = "";
      resOrder.on("data", (chunk) => {
        responseData += chunk;
      });
  
      resOrder.on("end", () => {
        const response = JSON.parse(responseData);
        const brandId = response.product.brand.brandId;
        const options1 = {
          hostname: "giftcards.reloadly.com",
          path: `/redeem-instructions/${brandId}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${tokenData}`,
          },
        };
  
        const reqInfo = https.request(options1, (resInfo) => {
          let responseData2 = "";
          resInfo.on("data", (chunk) => {
            responseData2 += chunk;
          });
  
          resInfo.on("end", () => {
            const response2 = JSON.parse(responseData2);
            res
              .status(200)
              .json({ message: response, redeem_instructions: response2 });
          });
        });
  
        reqInfo.on("error", (error) => {
          console.error("Error:", error)
        });
  
        reqInfo.end();
      });
    });
    }else{
      res.status(400).json({msg: "Insufficient funds. Please topup your wallet"});
    }
  
    reqOrder.on("error", (error) => {
      next(error);
    });
  
    reqOrder.write(data);
    reqOrder.end();
  }).catch(function(err){
    console.log(err);
  })
};

const getDataOffers = function(req, res){
  const user = req.user;
  const plan = req.body.plan;
      User.findOne({_id: user}).then(function(user){
        if(user){
          res.status(200).json({plans: data_prices});
        }
      }).catch(function(err){
          res.status(500).json({msg: "Database Error: Could not get the user details"});
      })
}

const buyData = function(req, res){


  const user = req.user;
  const reloadly = req.reloadly;
  const plan = req.body.plan;
      User.findOne({_id: user}).then(function(user){
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
                          User.updateOne({user_id: {$eq: req.user}}, {balance: user.balance - plan_price}).then(function(){
                            const mobile_data = new Data({userId: req.user, email: user.email, phone_number: req.body.phone, amount: plan_price, transaction_id: generateRandomString()});
                            mobile_data.save().then(function(){
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
  const plan = req.body.plan;
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
                    let responsd2 = JSON.parse(respons2);
                    if(responsd2.code == "success"){
                        User.updateOne({_id: {$eq: req.user}}, {balance: user.balance - amount}).then(function(){
                          const cable = new Cable({userId: req.user, type: plan_text, amount: plan_price, reference_id: responsd2.data.order_id, phone: phone, iuc: iuc, biller_id: service});
                          electricity.save().then(function(){
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

const cable_details = function(req, res){
  const user = req.user;
  const plan = req.body.plan;
      User.findOne({_id: user}).then(function(user){
        if(user){
          res.status(200).json({cables: cables});
        }
      }).catch(function(err){
          res.status(500).json({msg: "Database Error: Could not get the user details"});
      })
}

const support = function(req, res){
  const { email, subject, body } = req.body;
  User.findOne({email: {$eq: email}}).then(function(user){
    if(user){
        const complaint = new Complaints({userId: user._id, name: user.name, email: user.email, subject: subject, body: body});
        complaint.save().then(function(){
            res.status(200).json({msg: "Your cmplaint has been forwarded. We will respond within 48 hours"});
        }).catch(function(err){
          consle.log(err)
        })
    }else{
      res.status(404).json({msg: "This user does not exist"});
    }
  }).catch(function(err){
    consle.log(err)
  })
}

const admin_complaints = function(req, res){
  Complaints.find({}).then(function(complaints){
      res.status(200).json({complaints});
  }).catch(function(err){
    console.log(err);
  })
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
    getAvailable, 
    orderGiftcard, 
    getDataOffers, 
    buyData, 
    cable_details, 
    cable_payment,
    support
}