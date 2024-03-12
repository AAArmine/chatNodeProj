const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require('./utils/messages')

const app = express();
const server = http.createServer(app);

const io = socketio(server);
//set static folder
app.use(express.static(path.join(__dirname, "public")));

//run when client connects

io.on("connection", (socket) => {
  console.log("new websocket connection");
  //to the user which triggers
  socket.emit("message", formatMessage("BOT", "welcome to this chat"));
  //to all the users exept the user which triggers
  socket.broadcast.emit("message", formatMessage("BOT", "a user has just joined!"));
  socket.on("chatMsg", (m) => {
    io.emit("message", m);
  });
  socket.on("disconnect", () => {
    io.emit("message", "a user has just left!");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
