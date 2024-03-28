const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const token = urlParams.get("token");
const roomName = document.getElementById("room-name");
const usersList = document.getElementById("users");

const socket = io();

const chatForm = document.getElementById("chat-form");
const messagesContainer = document.querySelector(".chat-messages");

socket.emit("joinRoom", token);

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit("chatMsg", { msg, token });
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

function outputMsg(m) {
  const div = document.createElement("div");
  const container = document.querySelector(".chat-messages");
  div.classList.add("message");
  div.innerHTML = `<p class='meta'>${m.username} <span>${m.time}</span></p><p class='text'>${m.text}</p>`;
  container.appendChild(div);
}

socket.on("message", (message) => {
  outputMsg(message);
  // scroll To Bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.on("disconnect", (message) => {
  outputMsg(message);
});

socket.on("usersInRoom", (data) => {
  outputRoom(data.room);
  outputUsersList(data.usersList);
});

function outputRoom(room) {
  roomName.innerText = room;
}

function outputUsersList(users) {
  usersList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}`;
}

//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  }
});

socket.on("redirect", (data) => {
    alert(data.msg);
     window.location.href = data.url;

});
