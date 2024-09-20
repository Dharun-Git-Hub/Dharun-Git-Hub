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

        // Send a request to the server to append the div code in HTML.html file
        fetch('/append-div', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ divContent: newmsg.outerHTML }),  // Send the newly created div
        })
        .then(response => response.json())
        .then(data => {
          if (data.saved) {
            console.log('Div saved in the HTML file.');
          }
        })
        .catch(error => {
          console.log('Error saving div in the HTML file:', error);
        });
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

    setTimeout(() => {
      screen.scrollTop = screen.scrollHeight;
    }, 100);
  }
}

// Fetch previously saved messages and append them on load
window.onload = function() {
  fetch('/get-saved-messages', {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
    if (data.messages) {
      const screen = document.getElementById('msgcon');
      data.messages.forEach(message => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = message;
        screen.appendChild(tempDiv.firstChild);
      });
    }
  })
  .catch(error => {
    console.log('Error fetching saved messages:', error);
  });
};

