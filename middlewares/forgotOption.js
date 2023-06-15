module.exports = {
    mail: function (currentUrl, _id, uniqueString, email){
        return {
            from: "amuoladipupo420@gmail.com",
            to: email,
            subject: "Reset Your Password",
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
                    <h1>Reset Password</h1>
                    <p>Reset your password in order to be able to login to your account</p>
                    <p>This link <strong>expires in 6 hours</strong>.</p>
                    <p>Click the link below to proceed:</p>
                    <a href="${currentUrl + '/reset/password/' + _id + '/' + uniqueString}" class="button">Reset your password</a>
                    <p style="margin-top: 20px">You can also copy and paste the following link in your browser</p>
                    <p style="margin-top: 10px;"><a href="${currentUrl + '/reset/password/' + _id + '/' + uniqueString}">Reset your password</a></p>
                </div>
            </body>
            </html>`
        }
    }    
}


