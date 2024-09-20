require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;
let username;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let otp = '';

app.post('/create-page', (req, res) => {
  const userName = req.body.userName;
  if (userName && userName.trim() !== "") {
    const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '');
    username=req.body.userName;
    const filePath = path.join(__dirname, 'public', `${sanitizedUserName}.html`); 
	if(fs.existsSync(filePath))
{
return res.status(409).send('Page Already Exists !');
}

      fs.readFile(path.join(__dirname, 'HTML.html'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading HTML.html file:', err);
        return res.status(500).send('Server error');
      }

      const content = data.replace('${sanitizedUserName}', sanitizedUserName); // Inject sanitizedUserName
      
  fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error('Error writing file', err);
        res.status(500).send('Server error');
      } else {
        res.status(201).send('Page created');
      }
    });
      });
  } else {
    res.status(400).send('Invalid user name');
  }
});

app.post('/send', (req, res) => {
  const msg = req.body.message;
  const sanitizedMessage = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Prevent script injection
  // Read the HTML file and find the 'msgcon' div
  const filePath = path.join(__dirname, 'public', `${username}.html`);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading ${username} file:`, err);
      return res.status(500).json({ success: false, error: 'Server error' });
    }

    // Append the new message as a <div> inside the #msgcon container
    const newMessageDiv = `<div id="messg"><p>${sanitizedMessage}</p></div>\n`;
    const updatedHtml = data.replace(
      '<div id="msgcon">',
      `<div id="msgcon">\n${newMessageDiv}`
    );

    // Write the updated content back to the HTML file
    fs.writeFile(filePath, updatedHtml, (err) => {
      if (err) {
        console.error(`Error writing ${username} file:`, err);
        return res.status(500).json({ success: false, error: 'Server error' });
      }

      // Email notification part
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      
      let mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: 'MESSAGE FROM USER',
        text: `Message: ${msg}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error:', error);
          return res.status(500).json({ success: false, error: 'Email sending failed' });
        }
        console.log('Email sent: ' + info.response);
        res.status(200).json({ success: true });
      });
    });
  });
});

app.post('/nickname', (req, res) => {
  const { nickname } = req.body;
  if (nickname && nickname.trim().length >= 5 && nickname.trim().length <= 25) {
    res.json({ approved: true });
  } else {
    res.json({ approved: false });
  }
});

// New route handler for email OTP sending
app.post('/email', (req, res) => {
  const { email } = req.body;
  otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP

  // Setup email transport (adjust with your email credentials)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.json({ sent: false });
    } else {
      console.log('Email sent: ' + info.response);
      res.json({ sent: true });
    }
  });
});

// New route handler for OTP verification
app.post('/verify-otp', (req, res) => {
  const { email, otp: userOtp } = req.body;
  if (userOtp === otp) {
    res.json({ verified: true });
  } else {
    res.json({ verified: false });
  }
});

// New route handler for final data submission
app.post('/requests', (req, res) => {
  const { nickname, email } = req.body;
  console.log(`Nickname: ${nickname}, Email: ${email}`);
  res.sendStatus(200);
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
/*
app.post('/sendMessage',(req,res) => {
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const message=req.body.message;
const userame=req.body.userName;
    const username='+91'+userame;
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
    body: `Message : ${message}`,
    from: '+12673968516',
    to: `${username}`
  })
  .then((message) => console.log(`Message sent successfully! SID: ${message.sid}`))  // Success callback
  .catch((error) => console.error(`Error: ${error.message}`));  // Error callback
});
*/
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`);
});
