const https = require("https");
require("dotenv").config();


const topup_balance = async function(req, res, next){
    const options = {
    hostname: 'topups.reloadly.com',
    path: '/accounts/balance',
    method: 'GET',
    headers: {
        Accept: 'application/com.reloadly.topups-v1+json',
        Authorization: 'Bearer '+ req.reloadly
    }
    };

    const reqr = https.request(options, (resr) => {
    let data = '';
    
    resr.on('data', (chunk) => {
        data += chunk;
    });

    resr.on('end', () => {
        const initial = JSON.parse(data);
        req.balance = initial.balance;
        console.log(initial)
        next();
    });
});

reqr.on('error', (err) => {
  console.error('error: ' + err);
});

reqr.end();

}

const util_balance = async function(req, res, next){
        const options = {
        hostname: 'utilities.reloadly.com',
        path: '/accounts/balance',
        method: 'GET',
        headers: {
            Accept: 'application/com.reloadly.utilities-v1+json',
            Authorization: 'Bearer '+ req.reloadly
        }
        };

        const reqr = https.request(options, (resr) => {
        let data = '';
        
        resr.on('data', (chunk) => {
            data += chunk;
        });

        resr.on('end', () => {
            const initial = JSON.parse(data);
            req.balance = initial.balance;
            console.log(initial)
            next();
        });
        });

        reqr.on('error', (err) => {
        console.error('error: ' + err);
        });

        reqr.end();

}

const gift_balance = async function(req, res, next){
    const options = {
      hostname: 'giftcards.reloadly.com',
      path: '/accounts/balance',
      method: 'GET',
      headers: {
        Accept: 'application/com.reloadly.giftcards-v1+json',
        Authorization: 'Bearer '+ req.reloadly
      }
    };
    
    const reqr = https.request(options, (resr) => {
      let data = '';
      
      resr.on('data', (chunk) => {
        data += chunk;
      });
    
      resr.on('end', () => {
            const initial = JSON.parse(data);
            req.balance = initial.balance;
            console.log(initial)
            next();
      });
    });
    
    reqr.on('error', (err) => {
      console.error('error: ' + err);
    });
    
    reqr.end();
    

}


module.exports = {
    topup_balance, util_balance, gift_balance
}