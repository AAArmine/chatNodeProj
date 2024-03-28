const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const bodyParser = require("body-parser");
const { userJoin, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
// app.get("/chat.html", (req, res) => {
//   // Render the chat.html page
//   res.sendFile(path.join(__dirname, "public", "chat.html"));
// });
app.post("/chat.html", (req, res) => {
  const username = req.body.username;
  const room = req.body.room;
  res.redirect(`/chat.html?username=${username}&room=${room}`);
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (userData) => {
    const user = userJoin(socket.id, userData.username, userData.room);
    socket.join(user.room);
    socket.emit("message", formatMessage("BOT", `Welcome ${user.username}!`));
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage("BOT", `${user.username} has joined!`));

    io.to(user.room).emit("usersInRoom", {
      room:user.room,
      usersList: getRoomUsers(user.room),
    }); 
  });

  socket.on("chatMsg", (data) => {
    io.emit("message", formatMessage(data.username, data.msg));
  });
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.emit(
        "message",
        formatMessage("BOT", `${user.username} has just left!`)
      );
       io.to(user.room).emit("usersInRoom", {
         room: user.room,
         usersList: getRoomUsers(user.room),
       }); 

    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listens to the port ${PORT}`);
});
