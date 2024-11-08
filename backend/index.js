const express = require('express')
const { sendMail, sendSMS } = require('./utils');
const otpGenerator = require('otp-generator')
const app = express();
const PORT = 3000


app.get('/otp',(req,res)=>{
    const otp  = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets: false });

    sendMail({
        receiver: "@gmail.com",
        otp: otp
    })
    
    res.json({
        msg: "otp sent"
    })
})


app.listen(PORT,()=>{
    console.log(`The app is running on port: ${PORT}`)
})
