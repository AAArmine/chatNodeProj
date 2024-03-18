const chatForm = document.getElementById('chat-form');
const messagesContainer = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const socket = io();
// get query
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const username = urlParams.get("username");

const room = urlParams.get("room");

// console.log("Username:", username);
// console.log("Room:", room);

socket.emit('joinRoom', {username, room})

socket.on("message", (m) => {
  console.log(m);
  outputMsg(m);
  // scroll To Bottom
messagesContainer.scrollTop = messagesContainer.scrollHeight
});

chatForm.addEventListener('submit', (e)=>{
  e.preventDefault()
  const msg = e.target.elements.msg.value
  socket.emit('chatMsg', msg)
  e.target.elements.msg.value=''
  e.target.elements.msg.focus();

})

function outputMsg (m){
  const div = document.createElement('div')

  div.classList.add('message')
  div.innerHTML = `<p class='meta'>${m.username} <span>${m.time}</span></p><p class='text'>${m.text}</p>`;
  messagesContainer.appendChild(div)
}

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
