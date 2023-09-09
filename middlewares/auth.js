const jwt = require("jsonwebtoken");
const https = require("https");
require("dotenv").config();



const authenticateToken = function(req, res, next) {
  const accessToken = req.headers.authorization || req.cookies.accessToken;

  if (!accessToken) {
      res.status(401).json({ msg: "Access token not provided" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid access token" });
  }
};

const topup_token = async function(req, res, next){
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
          req.reloadly = initial.access_token;
          next();
      });
  });

  reqv.on('error', err => {
  console.error('error:' + err);
  });

  reqv.write(data);
  reqv.end();

}

const util_token = async function(req, res, next){
const url = 'https://auth.reloadly.com/oauth/token';
const options = {
  hostname: 'auth.reloadly.com',
  path: '/oauth/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

const data = JSON.stringify({
  client_id: 'gGH988E5zNGJehdI5nBNDYvoxbD0SdfA',
  client_secret: '4BMeIbHxMM-5ZwP2fYKyCc91F5hU0s-nmfrJWT8q9t9np59CrgXWFBrdw3XcGc8',
  grant_type: 'client_credentials',
  audience: 'https://utilities.reloadly.com',
});

const reqr = https.request(url, options, (resr) => {
  let responseData = '';

  resr.on('data', (chunk) => {
    responseData += chunk;
  });

  resr.on('end', () => {
      const initial = JSON.parse(responseData);
      req.reloadly = initial.access_token;
      next();
  });
});

reqr.on('error', (err) => {
  console.error('error: ' + err);
});

reqr.write(data);
reqr.end();

}

const sagecloud_token = async function(req, res, next){
const data = JSON.stringify({
  email: 'amuoladipupo@gmail.com',
  password: 'Timilehin1.'
});

const options = {
  hostname: 'sagecloud.ng',
  path: '/api/v2/merchant/authorization',
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const reqr = https.request(options, (resr) => {
  let responseData = '';

  resr.on('data', (chunk) => {
    responseData += chunk;
  });

  resr.on('end', () => {
    const response = JSON.parse(responseData);
    if(response.success){
      req.sagecloud = response.data.token.access_token;
      next();
    }else{
      res.status(400).json({msg: "Authentication failed"});
    }
  });
});

reqr.on('error', (error) => {
  console.error(error);
});

reqr.write(data);
reqr.end();

}

module.exports = {
    authenticateToken, topup_token, util_token, sagecloud_token
}