require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let otp = '';

app.post('/create-page', (req, res) => {
  const userName = req.body.userName;
  if (userName && userName.trim() !== "") {
    const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, '');
    const filePath = path.join(__dirname, 'public', `${sanitizedUserName}.html`); 
    const content = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, max-scale=1.0, user-scalable=no">
  <title>${sanitizedUserName}</title>
  <style>
    body {
      background-color: black;
      color: white;
      margin: 0;
      display: flex;
      flex-direction:column;
      justify-content:flex-start;
      align-items:center;
    }
    #topbar {
      display: flex;
      justify-content: space-between;
      position:relative;
      align-items: center;
      width: 100%;
      height:9vh;
      background-color: black;
      position: fixed;
      top: 0;
      margin:0;
    }
    #profile {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 15vw;
      height: 15vw;
      text-align: center;
      background-color: black;
      position: relative;
      transition: all 0.2s ease-in-out;
    }
    #profile:hover {
      border-radius:10%;
      box-shadow: 0px 0px 30px #ff1179;
    }
    #name {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      background-color: black;
      flex: 1;
      border-radius:20%;
    }
    #namecon {
      position: relative;
      display: inline;
      background-color: black;
      transition: all 0.5s ease-in-out;
    }
    #namecon:hover {
      border-radius: 20%;
      padding: 25px;
    }
    #options {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 15vw;
      height: 15vw;
      background-color: black;
      font-size: 25px;
      color: white;
      transition: all 0.2s ease-in-out;
    }
    #options:hover {
      border-radius: 10%;
      box-shadow: 0px 0px 30px #ff2679;
    }
    #butt {
      width: 10vw;
      height: 10vw;
      background-color: black;
      border-radius: 50%;
    }
    #msgbox {
      display:flex;
      justify-content:space-between;
      align-items:center;
      width: 100%;
      height: 7vh;
      background-color: black;
    }
    #profile,#butt,#namecon,#options,#chatscreen,#msgbox {
      user-select:none;
    }
    ::selection {
      background-color:white;
      color:#ff2679;
    }
    #chat-input {
      background-color: black;
      color: white;
      caret-color: #ff2679;
      overflow-y: auto;
      overflow-x: hidden;
      font-size: 20px;
      border: none;
      width: 55%;
      max-height: 300vw;
      border-radius: 30%;
      outline: none;
      padding:10px;
    }
    #Emoji {
      display:flex;
      width:15vw;
      height:15vw;
      max-height:250vw;
      justify-content:center;
      align-items:center;
    }
    #Files {
      display:flex;
      justify-content:flex-start;
      align-items:center;
    }
    #Emoji img {
      width:70%;
      height:70%;
    }
    #Files img {
      width:7vw;
      border-radius:50%;
      height:7vw;
    }
    #Emoji::before {
      content:'';
      position:absolute;
      top:2px;
      background-color:#ffff79;
      height:2px;
      width:0;
      left:0;
      transition: width 1s ease-in-out;
    }
    #Emoji:hover::before {
      width:100%;
      left:0;
    }
    #send {
      width:10vw;
      height:10vw;
      border-radius:50%;
      transition: box-shadow 0.1s ease-in-out;
    }
    #send.active {
      box-shadow: 0px 0px 10px green;
    }
    #Files::before {
      content:'';
      position:absolute;
      top:2px;
      background-color:#ff2679;
      height:2px;
      width:0;
      right:0;
      transition: width 1s ease-in-out;
    }
    #Files:hover::before {
      width:100%;
      right:0;
    }
    #Box {
      display:inline-block;
      max-width:65%;
      background-color:pink;
      border-radius:30px;
      margin:5px;
      padding: 5px 10px;
      color:white;
      word-wrap: break-word;
    }
    #msgcon {
      display: flex;
      flex-direction: column;
      width: 100%;
      height:86.4vh;
      background-color: black;
      align-items: flex-end;
      justify-content: flex-end;
      overflow-y: auto;
    }
    #messg {
      display:inline-block;
      max-width:65%;
      background-color:yellow;
      border-radius:30px;
      margin:5px;
      padding: 10px 20px;
      color:black;
      word-wrap: break-word;
    }
    #error {
      display:inline-block;
      max-width:65%;
      background-color:red;
      border-radius:30px;
      margin:5px;
      padding: 10px 20px;
      color:white;
      word-wrap: break-word;
    }
  </style>
</head>
<body>
  <div id="topbar">
    <div id="profile">
      <img id="butt" src="D.png" onclick="location.href='D.png'">
    </div>
    <div id="name">
      <span id="namecon"><h3><b>${sanitizedUserName}</b></h3></span>
    </div>
    <div id="options">
      <span>...</span>
    </div>
  </div>
  <div id="msgcon">
  </div>
  <div id="msgbox">
    <div id="Emoji">
      <img src="Emoji1.png">
    </div>
    <input placeholder="Message" id="chat-input">
    <img id="send" src="Send.jpg" onclick="sendMessage()">
    <div id="Files">
      <img src="File.png">
    </div>
  </div>
</body>
<script>
  const send = document.getElementById('send');

send.addEventListener("touchstart", () => {
  send.style.boxShadow = "0px 0px 10px green, 0px 0px 20px green, 0px 0px 30px green"; 
});

send.addEventListener("touchend", () => {
  send.style.boxShadow = ""; 
});

function sendMessage() {
  const screen = document.getElementById('msgcon');
  const input = document.getElementById('chat-input');
  
  if (input.value.trim() !== "") {
    const msg = input.value;
    const p = document.createElement('p');
    p.textContent = msg;
    const newmsg = document.createElement('span');
    newmsg.id = "messg";
    newmsg.appendChild(p);
    input.value = '';

    fetch('/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: msg }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        screen.appendChild(newmsg);
      }
    })
    .catch(error => {
      console.log(error);
      p.textContent = "Error while sending";
      const errorMsg = document.createElement('span');
      errorMsg.id = "error";
      errorMsg.appendChild(p);
      screen.appendChild(errorMsg);
    });
  /*    
      fetch('/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: msg , userName: userName}),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        screen.appendChild(newmsg);
      }
    })
    .catch(error => {
      console.log(error);
      p.textContent = "Error while sending";
      const errorMsg = document.createElement('span');
      errorMsg.id = "error";
      errorMsg.appendChild(p);
      screen.appendChild(errorMsg);
    });
*/
    setTimeout(() => {
      screen.scrollTop = screen.scrollHeight;
    }, 100);
  }
}

</script>
</html>
`;
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error('Error writing file', err);
        res.status(500).send('Server error');
      } else {
        res.status(201).send('Page created');
      }
    });
  } else {
    res.status(400).send('Invalid user name');
  }
});

app.post('/send',(req,res) => {
const msg=req.body.message;
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});
let mailOptions = {
  from: process.env.EMAIL,
  to: process.env.EMAIL,
  subject: 'MESSAGE FROM USER',
  text: `Mesaage : ${msg}`
};
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Error:', error);
  }
else {
  console.log('Email sent: ' + info.response);
  res.status(200).json({ success:true });
}
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
    from: '${phone}',
    to: `${username}`
  })
  .then((message) => console.log(`Message sent successfully! SID: ${message.sid}`))  // Success callback
  .catch((error) => console.error(`Error: ${error.message}`));  // Error callback
});
*/
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`);
});
