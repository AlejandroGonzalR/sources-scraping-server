'use strict';

const nodeMailer = require('nodemailer');

const emailAddress = process.env.GMAIL_ADDRESS;
const emailPass = process.env.GMAIL_PASS;

const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: emailAddress,
        pass: emailPass
    }
});

exports.sendMail = (link, email) => {
    const mailOptions = {
        from: process.env.GMAIL_ADDRESS,
        to: email,
        subject: 'Caronte Server Error Log',
        html: mailTemplate(link)
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
        console.log(`Message sent`);
    });
};

const mailTemplate = (link) => `
    <style>
        #waaa {
            border: 1px solid blue;
            border-radius: 15px;
            background: palevioletred;
        }
    </style>
    <div id="#waaa">
        <h3>Details</h3>
        <p>${link}</p>
    </div>
`;
