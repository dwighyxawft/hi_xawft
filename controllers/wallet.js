const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mailer = require("nodemailer");
const axios = require('axios');
const User = require("../models/User");
const Auth = require("../models/Auth");
const Verification = require("../models/Verify");
const Payment = require("../models/Payment");
const https = require('https');

require("dotenv").config();



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

async function getToken(){
    const url = 'https://auth.reloadly.com/oauth/token';
    const data = JSON.stringify({
    client_id: "gGH988E5zNGJehdI5nBNDYvoxbD0SdfA",
    client_secret: "4BMeIbHxMM-5ZwP2fYKyCc91F5hU0s-nmfrJWT8q9t9np59CrgXWFBrdw3XcGc8",
    grant_type: 'client_credentials',
    audience: 'https://topups.reloadly.com'
    });

    const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
    };

    const reqv = https.request(url, options, resv => {
        let responseData = '';

        resv.on('data', chunk => {
            responseData += chunk;
        });

        resv.on('end', () => {
            const initial = JSON.parse(responseData);
            const url = 'https://topups.reloadly.com/accounts/balance';
            const option = {
            method: 'GET',
            headers: {
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: 'Bearer '+ initial.access_token
            }
            };

            const reqb = https.request(url, option, resb => {
                let response = '';

                resb.on('data', chunk => {
                    response += chunk;
                });

                resb.on('end', () => {
                    const final = JSON.parse(response);
                    return final;
                });
            });

            reqb.on('error', err => {
                console.error('error:' + err);
            });

            reqb.end();
        });
    });

    reqv.on('error', err => {
    console.error('error:' + err);
    });

    reqv.write(data);
    reqv.end();

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
                                res.status(300).json({msg: "The user session has expired. Please login again"});
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
             res.status(400).json({msg: "This user does not exist, please egister and try again"});
        }
    }).catch(function(err){
        res.status(500).json({msg: "Database Error: Could not get the user details"});
    })
}

const initialize_payment = function(req, res){
    const user = req.user;
    

    const url = 'https://auth.reloadly.com/oauth/token';
    const data = JSON.stringify({
    client_id: "gGH988E5zNGJehdI5nBNDYvoxbD0SdfA",
    client_secret: "4BMeIbHxMM-5ZwP2fYKyCc91F5hU0s-nmfrJWT8q9t9np59CrgXWFBrdw3XcGc8",
    grant_type: 'client_credentials',
    audience: 'https://topups.reloadly.com'
    });

    const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
    };

    const reqv = https.request(url, options, resv => {
        let responseData = '';

        resv.on('data', chunk => {
            responseData += chunk;
        });

        resv.on('end', () => {
            const initial = JSON.parse(responseData);
            const url = 'https://topups.reloadly.com/accounts/balance';
            const option = {
            method: 'GET',
            headers: {
                Accept: 'application/com.reloadly.topups-v1+json',
                Authorization: 'Bearer '+ initial.access_token
            }
            };

            const reqb = https.request(url, option, resb => {
            let response = '';

            resb.on('data', chunk => {
                response += chunk;
            });

            resb.on('end', () => {
                const final = JSON.parse(response);
                if(req.body.amount <= final.balance){
                    Auth.find({user_id: user}).then(function(auths){
                        if(auths){
                             auths.forEach(function(auth){
                                 if(auth.expires_at <= Date.now()){
                                     Auth.deleteOne({user_id: user}).then().catch(function(err){
                                         console.log(err);
                                     })
                                 }else{
                                     User.findOne({_id: auth.user_id}).then(function(user){
                                         if(user){
                                             const params = JSON.stringify({
                                                 "email": user.email,
                                                 "amount": req.body.amount + "00"
                                               })
                                               
                                               const options = {
                                                 hostname: 'api.paystack.co',
                                                 port: 443,
                                                 path: '/transaction/initialize',
                                                 method: 'POST',
                                                 headers: {
                                                   Authorization: 'Bearer '+process.env.PAYSTACK_SECRET,
                                                   'Content-Type': 'application/json'
                                                 }
                                               }
                                               
                                               const reqp = https.request(options, resp => {
                                                 let data = ''
                                               
                                                 resp.on('data', (chunk) => {
                                                   data += chunk
                                                 });
                                               
                                                 resp.on('end', () => {
                                                   const result = JSON.parse(data);
                                                   res.status(200).json({msg: "Transaction initialization successful", result});
                 
                                                 })
                                               }).on('error', error => {
                                                 console.error(error)
                                               })
                                               
                                               reqp.write(params)
                                               reqp.end()
                                         }
                                     })
                                 }
                             })
                        }
                     })
                }else{
                    res.status(500).json({msg: "Server Error: Could not initialize a transaction process. Please try again later"});
                }
            });
            });

            reqb.on('error', err => {
            console.error('error:' + err);
            });

            reqb.end();
        });
    });

    reqv.on('error', err => {
    console.error('error:' + err);
    });

    reqv.write(data);
    reqv.end();

    
}

const verify_payment = async function(req, res) {
  const user = req.user;
  const event = req.body.event;
  const trxref = req.query.trxref;
  const reference = req.query.reference;
  console.log(event);
  if (event === "charge.success") {
    const paymentReference = req.body.data.reference;
    // Verify payment status with Paystack API
    const paystackResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer sk_live_58af92d67a993c890713ac20e639ec442169b2ec`,
        },
      }
    );
    const paymentStatus = paystackResponse.data.data.status;
    if (paymentStatus === "success") {
        const payment = new Payment({user_id: user, amount: paystackResponse.data.data.amount, reference: reference, type: "credit"});
        payment.save().then(function(){
            User.findOne({_id: user}).then(function(user){
                if(user){
                    User.updateOne({_id: user}, {balance: user.balance+paystackResponse.data.data.amount}).then(function(){
                        res.status(200).json({msg: "Your Transaction Verification was successful"})
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
    } else {
      return false;
    }
  } else {
    res.redirect("https://xawftwallet.onrender.com/wallet");
    return false;
  }
};

const top_up = async function(req, res){
    const user = req.user;
        User.findOne({_id: user}).then(async function(user){
            if(user){
                if(user.balance >= req.body.amount){
                    req.body.phone = user.phone.indexOf(0) == "0" ? user.phone.replace("0", "") : req.body.phone;
                    const url = 'https://topups.reloadly.com/operators/auto-detect/phone/' +req.body.phone+ '/countries/AR?suggestedAmounsMap=true&SuggestedAmounts=true';
                    const options = {
                        method: 'GET',
                        headers: {
                            'Authorization': 'Bearer '+ await getToken(),
                            'Accept': 'application/com.reloadly.topups-v1+json'
                        }
                    };

                    const reqd = https.request(url, options, (resd) => {
                        let respo = '';

                        resd.on('data', (chunk) => {
                            respo += chunk;
                        });

                        resd.on('end', async () => {
                            let operatorId = respo.operatorId;
                            const url = 'https://topups.reloadly.com/topups';
                            const options = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Accept: 'application/com.reloadly.topups-v1+json',
                                Authorization: 'Bearer '+ await getToken()
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
                                if(respons.status == "SUCCESSFUL"){
                                    const payment = new Payment({user_id: user, amount: req.body.amount, reference: "topup", type: "debit"});
                                    payment.save().then(function(){
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

module.exports = {
    get_started, register, verify, login, initialize_payment, verify_payment, top_up
}