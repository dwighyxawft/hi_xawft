const nodemailer = require("nodemailer");
const mailOptions = require("./forgotOption");
const Forgot = require("../models/Pass");
const { v4: uuidv4 } = require("uuid");


  const fns = {
    send: function (id, email) {
      const uniqueString = uuidv4() + id;
      const currentUrl = "https://xawftly.onrender.com/wallet";
      var transport = nodemailer.createTransport({
        host: process.env.SMTP_HOSTNAME,
        port: process.env.AUTH_SMTP_PORT,
        auth: {
          user: process.env.AUTH_EMAIL,
          pass: process.env.AUTH_PASSWORD
        }
      });
      this.store(id, uniqueString, email);
      if(transport.sendMail(mailOptions.mail(currentUrl, id, uniqueString, email))){
        return true;
      }else{
        return false;
      }
    },
    store: function (id, uniqueString, email) {
      Forgot.findOne({ user_id: { $eq: id } }).then(function (data) {
        if (!data) {
          let forgot = new Forgot({
            user_id: id,
            email: email,
            u_uid: uniqueString
          });
          if(forgot.save()){
            return true;
          }
        } else {
          Forgot.deleteOne({ user_id: { $eq: id } }).then(function(){
            let forgot = new Forgot({
              userId: id,
              email: email,
              u_str: uniqueString
            });
            if(forgot.save()){
              return true;
            }
          }).catch(function(err){
            if(err){
                return false;
            }
          })
        }
      });
    },
  };

module.exports = fns;
