const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const bodyParser = require("body-parser");
const { userJoin, userLeave, getRoomUsers } = require("./utils/users");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Secret key for JWT (replace reliable)
const JWT_SECRET_KEY = "my_secret_key_here";

app.post("/chat.html", (req, res) => {
  const username = req.body.username;
  const room = req.body.room;

  // Create and send JWT token upon successful login
  const token = jwt.sign({ username, room }, JWT_SECRET_KEY);
  console.log('token', token);
  res.redirect(`/chat.html?token=${token}`);
});

io.on("connection", (socket) => {
  socket.on("joinRoom",(token) => { 
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET_KEY);
      const { username, room } = decoded;

      const user = userJoin(socket.id, username, room);
      socket.join(user.room);
      socket.emit("message", formatMessage("BOT", `Welcome ${user.username}!`));
      socket.broadcast
        .to(user.room)
        .emit("message", formatMessage("BOT", `${user.username} has joined!`));

      io.to(user.room).emit("usersInRoom", {
        room: user.room,
        usersList: getRoomUsers(user.room),
      });
    } catch (error) {
     
      socket.emit(
        "message",
        formatMessage("BOT", "Invalid token.")
      );
      setTimeout(()=>{
        socket.emit("redirect", {
          msg: "Please log in again.",
          url: "/",
        });
      },2000
      )
       
    }
  });

  socket.on("chatMsg", (data) => {
    const { msg, token } = data;
     try {
       // Verify JWT token
       const decoded = jwt.verify(token, JWT_SECRET_KEY);
       const { username } = decoded;
       io.emit("message", formatMessage(username, msg));
     } catch (error) {
      console.error(error);
      // Handle invalid token
    
      socket.emit(
        "message",
        formatMessage("BOT", "Invalid token. Please log in again.")
      );
     }
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
